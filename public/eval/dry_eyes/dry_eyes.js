// A teeny tiny thing to do some night mode toggling
let night_tog = document.querySelector(".night_toggle");
let mode = night_tog.classList.contains("night") ? "night" : "sun";
document.body.className = mode;
const std_N = 1.2;
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
let logs = [];

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
    document.querySelector(".finish_txt").addEventListener("click", evt => {
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
        let suspected_blinks = summ.map((e, i) => {
            console.log(avg + std_N * std - e, i);
            return avg + std_N * std - e
        }).filter(e => {
            return e <= 0;
        });
        console.log(suspected_blinks, suspected_blinks.length);
        
    })
}

main();