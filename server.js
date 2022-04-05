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

/*mongoose.connect('mongodb://localhost:3000/url-shortener', { useNewURLParser: true })
.then(() => {
  let urlArray = [];

  app.post("/api/shorturl/", function (req, res) {
    //console.log(req, "<=");
    urlArray.push(req.body.url);
    let number = urlArray.length;
    console.log(urlArray);
    console.log(number);
    res.send({
      original: req.body.url,
      url: "/api/shorturl/" + number
    });
  })

})
.catch(() => {
  console.log("Database connection failed")
});*/

mongoose.connect(database_uri, { useNewURLParser: true });

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
var urlData = mongoose.model('urlData', new Schema({
  short_url: String,
  original_url: String,
  url: String
}));

app.get("/api/whoami", function (req, res) {
  console.log(req, "<=");
  let ip = req.ip;
  const env = process.env;
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];
  //console.log(test);
  //console.log("test");
  res.json({
    ipaddress: ip,
    language: language,
    software: software
  });
})

let urlArray = [];

app.post("/api/shorturl/", function (req, res) {
  let number;
  console.log(req.body.url, "<=");
  let httpTest = req.body.url;

  if (httpTest.includes("https://www.")) {
    urlArray.push(req.body.url);
    number = urlArray.length;
    console.log(urlArray);
    console.log(number);

    let newUrl = new urlData({
      original_url: req.body.url,
      url: number,
      short_url: __dirname + "/api/shorturl/" + number
    })

    newUrl.save(function(err, doc) {
      if (err) return console.log(err);
      console.log("Url saved successfully");
    });

    res.json({
      original_url: req.body.url,
      url: number
    });
  }

  else {
    res.json({
      status: "not a url"
    })
  }
})

app.get("/api/shorturl/:number", function(req, res) {
  let userGeneratedShortLink = req.params.number;
  console.log(userGeneratedShortLink);
  urlData.find( {url: userGeneratedShortLink} ).then(function(foundUrls) {
    let urlsToChange = foundUrls[0];
    console.log(urlsToChange, "<=");
    res.redirect(urlsToChange.original_url);
  })
  //console.log(urlsToChange);
    /*res.json({
      url: req.params.number,
      userUrl: urlsToChange.short_url
    })*/
});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
