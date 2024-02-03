//stream audio 
//(#) event listener for audio to be playable, call fxn 
//(#) when playable --> async helper fxn to record file and save it a particular fp 
//(#) res (in the form of field name name) = await helper fxn finishes results 
// (#)call whipser speech to text on file name with a certain model
// (#)save results a json file somewhere 

//NEED TO FIGURE OUT IMPORTING 

async function saveFile(chunks,e) {
    const audioBlob = new Blob(chunks,{'type':'audio/ogg; codecs=opus'});
    const audioUrl = window.URL.createObjectURL(audioBlob);
    e.src = audioUrl; //set the source of the created audio object
    e.controls = true; 
    e.type = 'audio.ogg';

    console.log(audioUrl);//log the blobl url

    const formData = new FormData();
    formData.append('file',audioBlob);
    let options = {
        method: 'POST',
        body: formData
    }
    console.log("Upload");
    let fetchRes = fetch("/upload", options);
    fetchRes.then(res =>
        res.json()).then(d => {
            console.log(d)
        })
};

async function transcribeAudio(chunks,audioElement) {
    await saveFile(chunks,AudioElement);
    axios.get('/audio')
    .then((response) => {
        const sucess = response;
        if (sucess) console.log('transcribed audio.');
        else console.log('error');
    });

}

function start() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }
    const start = document.getElementById('btnStart'); //start button
    const stop = document.getElementById('btnStop'); //stop button 
    const audioElem = document.getElementById('recordedAudio'); //create an audio element of the form <audio controls = true type = audio.ogg src = audioUrl></audio>
    

    const audioConfig = {
        'audio': true,
        'video': true
    };
    
    navigator.mediaDevices
    .getUserMedia(audioConfig)
    .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream); //initalize media recorder
        const audioChunks = [];
        // Start event
        start.addEventListener('click', function (ev) {
            mediaRecorder.start();
            console.log('record clicked');
            start.disabled = true;
            stop.disabled = false;
    
          })
   
          // Stop event
        stop.addEventListener('click', function (ev) {
            mediaRecorder.stop();
            console.log('stop record clicked');
            start.disabled = false;
            stop.disabled = true;
          });

        mediaRecorder.ondataavailable = (ev) => {
            console.log("got data");
            audioChunks.push(ev.data);
            saveFile(audioChunks,audioElem);

        }

    });

    


}
window.addEventListener("click", start);



/*
const audioChunks = []; 

mediaRecorder.ondataavailable = (ev) => {
    audioChunks.push(ev.data);
    console.log("got data");
    mediaRecorder.stop();
}


function saveFile(chunks,e) {
    const blob = new Blob(chunks,{'type':'audio/ogg; codecs=opus'});
    const audioUrl = window.URL.createObjectURL(blob);
    e.src = audioUrl; //set the source of the created audio object
    console.log(audioUrl);

};


async function handleAudio(chunks,e) {
    saveFile(chunks,e);
    //openAI.transcribeText(e.src,'whisper-1'); //still need to update so it stores this somewhere
};

/*
navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            console.log("streaming audio");
            const mediaRecorder = new MediaRecorder(stream); //initalize media recorder
            mediaRecorder.start();
            console.log("media reorder");
            mediaRecorder.ondataavailable = (ev) => {
                audioChunks.push(ev.data);
                console.log("got data");
                mediaRecorder.stop();
            }
            /*
            const start = document.getElementById('btnStart'); //start button
            const stop = document.getElementById('btnStop'); //stop button 
            const audioElem = document.createElement('audio'); //create an audio element of the form <audio controls = true type = audio.ogg src = audioUrl></audio>
            audioElem.controls = true; 
            audioElem.type = 'audio.ogg';

            const audioChunks = []; 


            start.onclick = e => {
                console.log('record clicked');
                start.disabled = true;
                stop.disabled = false;
                mediaRecorder.start();

            };
            stop.onclick = e => {
                console.log('record clicked');
                start.disabled = false;
                stop.disabled = true;
                mediaRecorder.stop();
            };

             start.onclick = e => {
            console.log('record clicked');
            start.disabled = true;
            stop.disabled = false;
            mediaRecorder.start();
        };
        stop.onclick = e => {
            console.log('stop record clicked');
            start.disabled = false;
            stop.disabled = true;
            mediaRecorder.stop();
            if (mediaRecorder.state == 'inactive') {
                console.log('media recorder stopped.');
            }
        };
            
 
            //mediaRecorder.onstop = handleAudio (audioChunks,audioElem);
})
.catch(function (err) {
    console.log(err.name, err.message);
});

*/