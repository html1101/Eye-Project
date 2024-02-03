const express = require('express'),
// For joining the paths properly on different OSes
path = require("path"),
// For reading the user_info file
fs = require("fs"),
app = express(),
port = 8080;

// Main page routes to dashboard
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard", "dashboard.html"));
});

// Also /dashboard routes to dashboard too
app.get("/dashboard", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard", "dashboard.html"));
});

// /learn routes to the learning page!
app.get("/learn", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "learn", "learn.html"));
});

// /eval routes to the eval page
app.get("/eval", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "eval", "eval.html"));
});

app.use('/public/static', express.static(path.join(__dirname, 'public', 'static')));

app.listen(port, () => {
  console.log(`EyeProject has been initialized! Listening on port ${port}`);
});
