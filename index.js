const express = require('express'),
  // For joining the paths properly on different OSes
  path = require("path"),
  // For reading the user_info file
  fs = require("fs"),
  app = express(),
  port = 8080;

// Get user info by reading file
const user_info = JSON.parse(fs.readFileSync(path.join(__dirname, "user_info.json")));
let { name, email, provider, img_url, eval_state, eval_percent, eval_todo, eval_completed, eval_due } = user_info;

let existing_data = JSON.parse(fs.readFileSync(path.join(__dirname, "test_data.json")));

const change_user_info = (stuff) => {
  fs.writeFileSync(
    path.join(__dirname, "user_info.json"),
    JSON.stringify({ name, email, provider, img_url, eval_state, eval_percent, eval_todo, eval_completed, eval_due, ...stuff }, null, 4)
  );
}

// This lets us put in user info super easily
app.set("view engine", "ejs");
app.use(express.json());

const send_dashboard = (res) => {
  res.render(
    path.join(__dirname, "public", "dashboard", "dashboard"),
    { name, email, provider, img_url, eval_completed }
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

app.get("/eval/snellan_chart", (_req, res) => {
  // Parse information from user info JSON
  res.sendFile(path.join(__dirname, "public", "eval", "snellan_chart", "snellan_chart.html"));
});

app.get('/save/snellan_chart', (req, res) => {
  let { vision } = req.query;

  // Send this to the backend + info
  existing_data = { ...existing_data, vision };
  fs.writeFileSync(path.join(__dirname, "test_data.json"), JSON.stringify(existing_data, null, 4));

  console.log("Saving Snellan data...");
  eval_todo = eval_todo.filter(e => e.id != "snellan_chart");
  var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: "2-digit", minute: "2-digit"};
  var today  = new Date();

  eval_completed.push({id: "snellan_chart", completed_on: today.toLocaleDateString("en-US", options), name: "Snellan Chart Test", vision });
  // Now update the percent accordingly
  eval_percent = Math.round(eval_completed.length / (eval_completed.length + eval_todo.length) * 100);
  if(eval_percent == 100) eval_state = "done";
  else eval_state = "todo";
  change_user_info({ eval_state, eval_percent, eval_todo, eval_completed });
  console.log("Vision Level: ", vision);
  res.send("Finished request");
});

// Listen for saving info from the backend + place into test_data.json
app.get('/save/dry_eyes', (req, res) => {
  // Parse info from JSON
  let { num_blinks, bpm, mins, score } = req.query;
  num_blinks = parseFloat(num_blinks);
  bpm = parseFloat(bpm);
  score = parseFloat(score);
  mins = parseFloat(mins);
  console.log(`Estimated score:\n\tBPM: ${bpm}\n\tScore: ${score}`);
  
  // Now take test_data.json.
  existing_data = { ...existing_data, num_blinks, bpm, mins };
  fs.writeFileSync(path.join(__dirname, "test_data.json"), JSON.stringify(existing_data, null, 4));

  // This test has been completed, so now let's alter user_info to update that
  // eval_state, eval_percent, eval_todo, eval_completed
  // eval_todo - take out this test + complete
  eval_todo = eval_todo.filter(e => e.id != "dry_eyes");
  var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: "2-digit", minute: "2-digit"};
  var today  = new Date();

  eval_completed.push({id: "dry_eyes", completed_on: today.toLocaleDateString("en-US", options), name: "Dry Eyes Test", score });
  // Now update the percent accordingly
  eval_percent = Math.round(eval_completed.length / (eval_completed.length + eval_todo.length) * 100);
  if(eval_percent == 100) eval_state = "done";
  else eval_state = "todo";
  change_user_info({ eval_state, eval_percent, eval_todo, eval_completed });

  res.send("Completed request.");
})

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`EyeProject has been initialized! Listening on port ${port}`);
});
