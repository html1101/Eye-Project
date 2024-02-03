//stream audio 
//(#) event listener for audio to be playable, call fxn 
//(#) when playable --> async helper fxn to record file and save it a particular fp 
//(#) res (in the form of field name name) = await helper fxn finishes results 
// (#)call whipser speech to text on file name with a certain model
// (#)save results a json file somewhere 

import {OpenAI} from "./openai.js";
const openAI = new OpenAI();

function saveFile(chunks,e) {
    const blob = new Blob(chunks,{'type':'audio/ogg; codecs=opus'});
    const audioUrl = window.URL.createObjectURL(blob);
    e.src = audioUrl; //set the source of the created audio object
    console.log(audioUrl);

};

async function handleAudio(chunks,e) {
    saveFile(chunks,e);
    openAI.transcribeText(e.src,'whisper-1'); //still need to update so it stores this somewhere
};

navigator.mediaDevices
        .getUserMedia({audio:true})
        .then(function (stream) {
            let start = document.getElementById('btnStart'); //start button
            let stop = document.getElementById('btnStop'); //stop button 
            let mediaRecorder = new MediaRecorder(stream); //initalize media recorder

            const audioElem = document.createElement('audio'); //create an audio element of the form <audio controls = true type = audio.ogg src = audioUrl></audio>
            audioElem.controls = true; 
            audioElem.type = 'audio.ogg';
            audioChunks = []; 

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

            mediaRecorder.ondataavailable = (ev) => {
                audioChunks.push(ev.data);
            }
 
            mediaRecorder.onstop = handleAudio (audioChunks,audioElem);
})
.catch(function (err) {
    console.log(err.name, err.message);
});

