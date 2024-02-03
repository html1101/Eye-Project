//for making http requests to the server
const multer  = require('multer')
const upload = multer({ dest: './public/eva/pyramid/recordings/raw/' })



const express = require('express'),
  // For joining the paths properly on different OSes
  path = require("path"),
  // For reading the user_info file
  fs = require("fs"),
  app = express(),
  port = 8080;

// Get user info by reading file
const user_info = JSON.parse(fs.readFileSync(path.join(__dirname, "user_info.json")));
const { name, email, provider, img_url, eval_state, eval_percent, eval_todo, eval_completed } = user_info;

// This lets us put in user info super easily
app.set("view engine", "ejs");

const send_dashboard = (res) => {
  res.render(
    path.join(__dirname, "public", "dashboard", "dashboard"),
    { name, email, provider, img_url }
  );
}



// Main page routes to dashboard
app.get('/', (_req, res) => {
  send_dashboard(res);
});

// Also /dashboard routes to dashboard too
app.get("/dashboard", (_req, res) => {
  // Parse information from user info JSON
  send_dashboard(res);
});

// /learn routes to the learning page!
app.get("/learn", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "learn", "learn.html"));
});

// /eval routes to the eval page
app.get("/eval", (_req, res) => {
  res.render(
    path.join(__dirname, "public", "eval", "eval"),
    { eval_state, eval_percent, eval_todo, eval_completed }
  );
});


app.post('/upload', upload.single('recording'), (req,res) => {
  console.log('upload request');
  const { buffer:recording } = req.file;
  fs.open('./public/eva/pyramid/recordings/raw/recording.ogg','w+', (err,fd) => {
    fs.writeFile(fd,recording,(err)=> {
      fs.close(fd, (err) => {
        res.status(201).send('recording.ogg');
      });
    });
  });
});

//open-ai eval routes
const { OpenAIApi } = require("openai");
const model = "whisper-1";

//when we get a request for audio, we add a transcription
app.get('/audio',(req,res) =>{
  const openAi = new OpenAIApi(new Configuration({ apiKey:"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" }));
  this.openai
    .audio
    .speech.create({
        file: './public/eva/pyramid/recordings/raw/recording.ogg',
        model: model,
        response_format: "json",
      })
      .then((response) => console.log(response.data)); //need to modify so it is saved in /recordings/transcript/transcript.json
  res.send(true);
});

app.use('/public', express.static(path.join(__dirname, 'public')));



app.listen(port, () => {
  console.log(`EyeProject has been initialized! Listening on port ${port}`);
});
