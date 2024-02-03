(() => {
    const vid_width = 500;    // We will scale the photo width to this
    const vid_height = 500;     // This will be computed based on the input stream
  
    const streaming = false;
    let startbutton = null;

    let vid,c1,ctx1,c_tmp,ctx_tmp;
    function start() {
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

    function computeFrame() {
        ctx_tmp.drawImage(vid,0,0,vid_width,vid_height);
        let frame = ctx_tmp.getImageData(0,0,vid_width,vid_height);

        ctx1.putImageData(frame,0,0);
        setTimeout(computeFrame,0);

    };
    
    window.addEventListener("load", start, false);
})();