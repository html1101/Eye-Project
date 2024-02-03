
//import * as poseDetection from '@tensorflow-models/pose-detection';
//import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
//import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';




//read from web cam
//html

//constraints – accept audio and video

const video = <HTMLVideoElement>document.getElementById("video");

video.play()
const c = "camera" as PermissionName
navigator.permissions.query({ name: c}).then(res => {
  if(res.state == "granted"){
      // has permission
  }
});

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.error(`An error occurred: ${err}`);
  });


// It basically tells the getUserMedia() to 
// open both the camera and the microphone




//async function accessCamera() { 
    //const videoElem = document.getElementById( 'video'); 
    //let stream = null; 
    //try{ 
        //stream = await navigator.mediaDevices.getUserMedia(vidConstraints); 
  
        //adding the received stream to the source of the video element 
        //videoElem.srcObject = stream; 
      
        //videoElem.autoplay = true; 
    //}catch(err) { 
        //code to handle the error 
   //// } 



// 


//display a bounding box over the image to where the user should center their face

//check if the user is in bounding box (key points 0-4 within region)


//const detectorConfig = { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    //enableTracking: true,
    //trackerType: poseDetection.TrackerType.BoundingBox
  //};
  //const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

  //const poses = await detector.estimatePoses(video);