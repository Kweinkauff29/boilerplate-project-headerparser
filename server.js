// server.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/whoami", function (req, res) {
  console.log(req, "<=");
  let test = req.headers['x-forwarded-for'] ||
     req.socket.remoteAddress ||
     null;
  const env = process.env;
  const language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
  const software = req.headers['user-agent'];
  console.log(test);
  console.log("test");
  res.json({
    "ipaddress": test,
    "language": language,
    "software": software
  });
})



// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
