// server.js
// where your node app starts

var database_uri = "mongodb+srv://zetterburg40:Goalie29@cluster0.xbmwh.mongodb.net/url-shortener?retryWrites=true&w=majority";

// init project
//require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
const mongoose = require("mongoose");
const mongo = require('mongodb');
var Schema = mongoose.Schema;
var cors = require('cors');

mongoose.connect(database_uri, { useNewURLParser: true });

const connection = mongoose.connection;

let test;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', async function () {
  const collection  = connection.db.collection("urldatas");
  collection.find({}).toArray(function(err, data){
      test = data;
      return test;
  });
  //console.log(test);
});

/*let test1  = connection.db.collection("urldatas");
let test = test1.find({}).toArray();

console.log(test);
*/
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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//build a schema and model to store saved UrlShorten
var urlData = mongoose.model('urldatas', new Schema({
  short_url: String,
  original_url: String,
  url: String
}, { collection: "urldatas"}));

//build schema and model for user storage
var newUser = mongoose.model('newusers', new Schema({
  user: String
}, { collection: "user" } ));

app.get("/api/whoami", function (req, res) {
  let ip = req.ip;
  const env = process.env;
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];
  res.json({
    ipaddress: ip,
    language: language,
    software: software
  });
})

let urlArray = [];
let number;

app.post("/api/users", async (req, res) => {
  //console.log(req.body.username);

  let user = new newUser({
    user: req.body.username
  })

//check to see if user already Exists
  const userCheck = await newUser.find( { user: req.body.username } );
  //console.log(userCheck);

//if user already exists - tell user to use diffrent username  - Won't sync to db
  if (userCheck.length > 0) {
    console.log("User Already Exists");
    res.redirect("/");
  }

  else {

  user.save((err, doc) => {
  if (err) return (err);

  else {
  console.log("Url saved successfully");
  res.json({
    user: req.body.username
  });
}

});
}
});

app.post("/api/users/:_id/exercises", (req, res) => {
  console.log(req.params._id, "<=");
  console.log(req.params.description, "<=");
  console.log(req.params.duration, "<=");
  console.log(req.params.date, "<=");
});

app.post("/api/shorturl/", async (req, res) => {
  //console.log(req.body.url, "<=");
  let httpTest = req.body.url;

  if (httpTest.includes("http")) {

    urlArray.push(req.body.url);

    const urlTest = await urlData.find();
    number = urlTest.length + 1;

    let newUrl = new urlData({
      original_url: req.body.url,
      url: number,
      short_url: number
    })

  newUrl.save((err, doc) => {
    if (err) return (err);
    console.log("Url saved successfully");
    res.json({
      original_url: req.body.url,
      url: __dirname + "/api/shorturl" + number,
      short_url: number
    });
  }
  );
}

  else {
    res.json({
     error: 'invalid url'
    })
  }
})

app.get("/api/shorturl/:number", (req, res) => {
  let userGeneratedShortLink = req.params.number;
  console.log(userGeneratedShortLink);
  urlData.find( {url: userGeneratedShortLink} ).then(foundUrls => {
    let urlsToChange = foundUrls[0];
    console.log(urlsToChange, "<=");
    res.redirect(urlsToChange.original_url);
  });
});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
