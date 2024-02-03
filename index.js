const express = require('express'),
  // For joining the paths properly on different OSes
  path = require("path"),
  // For reading the user_info file
  fs = require("fs"),
  app = express(),
  port = 8080;

// Get user info by reading file
const user_info = JSON.parse(fs.readFileSync(path.join(__dirname, "user_info.json")));
const { name, email, provider, img_url, eval_state, eval_percent, eval_todo, eval_completed, eval_due } = user_info;

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

// Return a random BBC article
app.get("/random_text", (_req, res) => {
  // Read CSV file
  fs.readFile(path.join(__dirname, "monologues.txt"), (err, data) => {
    if(err) res.sendStatus(404);
    else {
      // Parse the text + get a random story
      let lines = data.toString().split("\r\n\r\n\r\n");
      res.send(lines[Math.floor(Math.random() * lines.length)]);
    }
  })
})

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
    { eval_state, eval_percent, eval_todo, eval_completed, eval_due }
  );
});

app.get("/eval/dry_eyes", (_req, res) => {
  // Parse information from user info JSON
  res.sendFile(path.join(__dirname, "public", "eval", "dry_eyes", "dry_eyes.html"));
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`EyeProject has been initialized! Listening on port ${port}`);
});
