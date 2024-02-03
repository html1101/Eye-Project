

        
(() => {
    const vid_width = 500;    // We will scale the photo width to this
    const vid_height = 500;     // This will be computed based on the input stream
    const xlwr = 100;
    const ylwr = 150;
    const boxw = 5;
    const boundsIndicatior = {"out_of_bounds":{"r":220,"g":20,"b":60},
"in_bounds" : {"r":127,"g":255,"b":0}};
  
    const streaming = false;
    let startbutton = null;


   
    const to1D = (x,y) => (y-1)*vid_width +x;
    const inBounds2d = (x,y) => (x > xlwr) && (x < vid_width -xlwr) && (y > ylwr) && (y < vid_height - ylwr) 
    
    
    let vid,c1,ctx1,c_tmp,ctx_tmp,inFrame,r,g,b,detector,detectorConfig;
    async function start() {
        detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

        inFrame = false;
        vid = document.getElementById("video");
        const startbutton = document.getElementById("startbutton");
        vid.addEventListener('play',computeFrame);

        c1 = document.getElementById("output-canvas");
        ctx1 = c1.getContext('2d');

        c_tmp = document.createElement('canvas');
        c_tmp.setAttribute('width',500);
        c_tmp.setAttribute('height',500);
        c_tmp.style.display = "none";
        ctx_tmp = c_tmp.getContext('2d');
    
         
        navigator.mediaDevices
        .getUserMedia({video:{
            width: vid_width,
            height: vid_height,
          },audio:true})
        .then((stream)=> {
            vid.srcObject = stream;
            vid.play()
            
            //vid.play();
        })
        .catch((err)=> {console.error(`An error occurred: ${err}`);});

    };
    
    

    function inRegion(i) {
        let col = i%vid_width;
        let row = i/vid_width;
        if ( (col > xlwr &&
                col < (xlwr + boxw) &&
                row > ylwr &&
                row < (vid_height -ylwr)) ||
                (col < (vid_width-xlwr) && 
                col > (vid_width -xlwr - boxw) &&
                row > ylwr &&
                row < (vid_height -ylwr)) ||
                (row > ylwr && 
                    row < (ylwr + boxw) &&
                    col > xlwr && 
                    col < (vid_width-xlwr)) ||
                (row > (vid_height -ylwr -boxw) && 
                    row < (vid_height -ylwr) &&
                    col > xlwr && 
                    col < (vid_width-xlwr))
                ) {
                    return true;
                }
        return false;

    }

    function boundingBox(frame,inFrame) {
        if (inFrame) {
            r = boundsIndicatior['in_bounds']['r'];
            g = boundsIndicatior['in_bounds']['g'];
            b = boundsIndicatior['in_bounds']['b'];
        } else {
            r = boundsIndicatior['out_of_bounds']['r'];
            g = boundsIndicatior['out_of_bounds']['g'];
            b = boundsIndicatior['out_of_bounds']['b'];
    
        }

        for (let i = 0; i < frame.data.length/4;i++) {
            if (inRegion(i)) {
                frame.data[i*4] = r; 
                frame.data[i*4+1] = g;
                frame.data[i*4+2] = b;
                
            } 
        }
        console.log('parsed frame');
        return frame;
    }

    function posesInRegion(poses) {
        for (const pose of poses) {
            let count = 0;
            for (const kp of pose.keypoints) {
                if (count < 7 && !inBounds2d(kp.x,kp.y)) return false;
                count++;
 
            }
            return true;
        }
        
    }
    async function computeFrame() {
        ctx_tmp.drawImage(vid,0,0,vid_width,vid_height);
        let frame = ctx_tmp.getImageData(0,0,vid_width,vid_height);

        const poses = await detector.estimatePoses(frame);
        if (posesInRegion(poses)) {
            console.log("in region");
            inFrame = true;

        } 
        else {
            console.log("not in region");
            inFrame = false;
        }
        
        ctx1.putImageData(boundingBox(frame,inFrame),0,0);

        
    
        setTimeout(computeFrame,0);

    };
    
    window.addEventListener("load", start, false);
})();