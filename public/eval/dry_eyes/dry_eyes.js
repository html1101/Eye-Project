// A teeny tiny thing to do some night mode toggling
let night_tog = document.querySelector(".night_toggle");
let mode = night_tog.classList.contains("night") ? "night" : "sun";
document.body.className = mode;
const std_N = 1;
const THRESHOLD = 10;

night_tog.addEventListener("click", evt => {
    if(night_tog.classList.contains("night")) { mode = "sun"; }
    else { mode = "night"; }

    night_tog.className = `night_toggle ${mode}`;
    document.body.className = mode;
});

// And then query the data we need
const get_data = async () => {
    let data = await fetch("/random_text");
    // Take text + put into the data thingy
    document.querySelector(".text").innerHTML = await data.text();
}
get_data();

// BLINKING DETECTION TIME BABYYYYYYY

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
}

// Distance function
const dis = (a, b) => {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2) + 
        Math.pow(a.z - b.z, 2)
    );
}

// List of points to log
let logs = [],
time_stamp = 0;

const main = async () => {
    const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    const video = document.getElementById("video");
    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.id = "canv";
    const c = canvas.getContext("2d");
    document.body.appendChild(canvas);

    // Alright it's face detection time! Time to pass in some face inputs
    // (1) Beg the user for cam permissions
    const permissions = await navigator.permissions.query({
        name: "camera"
    });
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }
    // (2) We got em!
    if(permissions.state != "granted") return;
    
    // (3) Get device + do shit
    navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
        video.autoplay = true;
        // Start the timer
        time_stamp = (new Date()).getTime();
    })
    .catch((err) => {
        console.error(`An error occurred: ${err}`);
    });

    // (4) When video starts playing, render to canvas
    const repeat = async () => {
        // Take video data + render it, if it's running
        if (video.paused || video.ended) {
            return;
        }
        // Make sure video width and height are the same as the canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        c.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Now it's time to send this over to the AI
        try {
            let [poses] = await detector.estimateFaces(canvas)

            // Points 396 and 374 are for right, 159 and 145 for left
            let r_t = poses.keypoints[386],
            r_b = poses.keypoints[374],
            l_t = poses.keypoints[159],
            l_b = poses.keypoints[145];
            // Make an avg between r_t and r_tt
            // r_t = {x: (r_t.x + r_tt.x)/2, y: (r_t.y + r_tt.y)/2, z: (r_t.z + r_tt.z)/2}
            // l_t = {x: (l_t.x + l_tt.x)/2, y: (l_t.y + l_tt.y)/2, z: (l_t.z + l_tt.z)/2}
            c.beginPath();
            c.lineWidth = 5;
            c.strokeStyle = "#CDFADB";
            c.arc((r_t.x + r_b.x) / 2, (r_t.y + r_b.y) / 2, Math.abs(r_t.y - r_b.y), 0, Math.PI*2);
            c.stroke();

            c.beginPath();
            c.strokeStyle = "#CDFADB";
            c.arc((l_t.x + l_b.x) / 2, (l_t.y + l_b.y) / 2, Math.abs(l_t.y - l_b.y), 0, Math.PI*2);
            c.stroke();
            
            // Now calc differences between these points:
            // console.log("Left: ", dis(l_t, l_b), "\nRight: ", dis(r_t, r_b));
            // After finishing, we can analyze this data and figure out # of blinks
            // Cause then we can calc the avg pt + points that dipped below this
            logs.push([dis(l_t, l_b), dis(r_t, r_b)]);
        } catch(err) {
            console.log("err", err);
        }
        // Repeat this
        requestAnimationFrame(repeat);
    }
    video.addEventListener("loadedmetadata", repeat);

    // Okie dokie when we press complete we done
    document.querySelector(".finish_txt").addEventListener("click", async evt => {
        // Now go over the logs + parse them out
        console.log("Logs we got:", logs);
        video.pause();
        // (1) Get avg
        // For each log, just sum them together for now
        let summ = logs.map(log => (log[0] + log[1]));
        let avg = summ.reduce((a, b) => a+b) / summ.length;

        // (2) Get std deviation
        let std = Math.sqrt((1/summ.length)*summ.map(a => Math.pow(a - avg, 2)).reduce((a, b) => a+b));

        console.log("ANALYSIS:", avg, std);
        // Log # of times we went over the std by N (a constant) + use for figuring out # of blinks
        /*let suspected_blinks = summ.map((e, i) => {
            return avg + std_N * std - e
        });*/
        let suspected_blinks = summ;
        // Now cluster blinks that happened at the same times
        const avg_val = (list) => list.reduce((a, b) => a+b);
        let blinks = [];
        let avg_last = [];
        let going_down = 0;
        let num_keep = 10;
        /*for(let i = 0; i < suspected_blinks.length; i++) {
            if(avg_last.length < num_keep) {
                avg_last.push(suspected_blinks[i]);
                continue;
            }
            let pts = avg_val(avg_last);
            avg_last.push(suspected_blinks[i]);
            avg_last = avg_last.slice(-num_keep);
            let new_pts = avg_val(avg_last);

            if(going_down > num_keep && new_pts - pts > 0.5) {
                blinks.push(new_pts);
                going_down = 0;
            }
            if(new_pts - pts < 0) {
                going_down++;
            }
        }*/
        let last_kept = false;
        let min = (Math.min(...suspected_blinks) * 7/10) + (Math.max(...suspected_blinks) * 3/10);
        console.log("Min value: ", min);
        console.log(suspected_blinks);
        for(let i = 0; i < suspected_blinks.length; i++) {
            if(suspected_blinks[i] <= min && !last_kept) {
                blinks.push(suspected_blinks[i]);
                last_kept = true;
            } else if(suspected_blinks[i] > min) {
                last_kept = false;
            }
        }
        let num_blinks = Math.round(blinks.length);
        let mins = (new Date().getTime() - time_stamp) / 60000;
        console.log("Blinks detected: ", num_blinks, "\nBlinks per Minute: ", num_blinks / mins, "(" + mins + ")");
        // Score this person--0 means normal, 1+ means wat da hell you crazy
        // avg is 17.5 bpm, std is 2.5 bpm
        const score = ((num_blinks / mins) - 17.5) / 2.5;
        // Send this information to the backend
        await fetch(`/save/dry_eyes?num_blinks=${num_blinks}&bpm=${num_blinks / mins}&mins=${mins}&score=${score}`);
        // Okok now time to go back to the home page?
        window.location = "/";
    })
}

main();