import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

(() => {
    const vid_width = 500;    // We will scale the photo width to this
    const vid_height = 500;     // This will be computed based on the input stream
    const xlwr = vid_width/3;
    const ylwr = vid_height/3;
    const boxw = 5;
    const boundsIndicatior = {"out_of_bounds":{"r":220,"g":20,"b":60},
"in_bounds" : {"r":127,"g":255,"b":0}};
  
    const streaming = false;
    let startbutton = null;

    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
    const detector = poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        
    const to1D = (x,y) => (y-1)*vid_width +x;
    const inBounds2d = (x,y) => (x > x_lwr) && (x < vid_width -x_lwr) && (y > y_lwr) && (y < vid_height - ylwr) 
    
    

    let vid,c1,ctx1,c_tmp,ctx_tmp,inFrame,r,g,b;
    function start() {
        inFrame = false;
        vid = document.getElementById("video");
        const startbutton = document.getElementById("startbutton");
        vid.addEventListener('play',computeFrame);

        c1 = document.getElementById("output-canvas");
        ctx1 = c1.getContext('2d');

        c_tmp = document.createElement('canvas');
        c_tmp.setAttribute('width',500);
        c_tmp.setAttribute('height',500);
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
        return frame;
    }

    function posesInRegion(poses) {
        let nose = poses[0]['keypoints'][0];
        let left_eye = poses[0]['keypoints'][1];
        let right_eye = poses[0]['keypoints'][2];
        let left_ear = poses[0]['keypoints'][3];
        let right_ear = poses[0]['keypoints'][4];
        let left_shoulder = poses[0]['keypoints'][5];
        let right_shoulder = poses[0]['keypoints'][6];

        return inBounds2d((nose['x'],nose['y'])) &&
        inBounds2d(left_eye['x'],left_eye['y']) &&
        inBounds2d(right_eye['x'],right_eye['y']) &&
        inBounds2d(left_ear['x'],left_ear['y']) &&
        inBounds2d(right_ear['x'],right_ear['y']) &&
        inBounds2d(left_shoulder['x'],left_shoulder['y']) &&
        inBounds2d(right_shoulder['x'],right_shoulder['y'])
        
    }
    function computeFrame() {
        ctx_tmp.drawImage(vid,0,0,vid_width,vid_height);
        let frame = ctx_tmp.getImageData(0,0,vid_width,vid_height);
        ctx1.putImageData(boundingBox(frame,inFrame),0,0);

        const poses = detector.estimatePoses(frame);
        if (posesInRegion) inFrame = true;
        else inFrame = false;
    
        setTimeout(computeFrame,0);

    };
    
    window.addEventListener("load", start, false);
})();