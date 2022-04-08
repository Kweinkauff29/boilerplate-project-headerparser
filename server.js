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
  username: String,
  __id: String,
  description: String,
  duration: String,
  date: String
}, { collection: "user" } ));

var newExcersize = mongoose.model('updatesusers', new Schema({
  username: String,
  __id: String,
  description: String,
  duration: String,
  date: String}, { collection: "excersises" }))

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
    username: req.body.username,
  })

//check to see if user already Exists
  const userCheck = await newUser.find( { username: req.body.username } );

//if user already exists - tell user to use diffrent username  - Won't sync to db
  if (userCheck.length > 0) {
    console.log("User Already Exists");
    res.redirect("/");
  }

  else {

  user.save(async (err, doc) => {
  if (err) return (err);

  else {
  console.log("Url saved successfully");
  console.log(req, "<=");
  const idCheck = await newUser.findOne( { username: req.body.username } );
  console.log(idCheck);
  var id = idCheck._id;
  console.log(id);
  res.json({
    username: req.body.username,
    _id: id
  });
}

});
}
});

app.post("/api/users/:_id/exercises", async (req, res) => {

  const accCheck = await newUser.find( { username: req.params._id } );
  //console.log(req, "<=");

  var date = req.body.date;

  console.log(date);

  var today;

  let users = new newExcersize({
    username: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })


  if (accCheck.length > 0) {
    users.save(async (err, doc) => {
      if (date.length > 10 || date.length < 10) {
        today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        const excLog = await newUser.find( { username: req.params._id } );
        console.log("Excersises Saved!")

        res.json({
          username: req.params._id,
          description: req.body.description,
          duration: req.body.duration,
          date: today
        })
      }

      else {
        today = req.body.date;
        const excLog = await newUser.find( { username: req.params._id } );
        console.log("Excersises Saved!")

        res.json({
          username: req.params._id,
          description: req.body.description,
          duration: req.body.duration,
          date: today
        })
      }

    })

}

  else {
    return console.log("user doesn't exist");
    res.redirect("/");
  }
});

app.get("/api/users/:_id/logs", async(req, res) => {
  //console.log(req, "<=");
  var logs = await newExcersize.find( { username: req.params._id } );
  var count = await newExcersize.find( { username: req.params._id } ).count();
  var id = logs[0]._id
  var username = req.params._id;

  var excersiseLog = [logs];
  console.log(excersiseLog);

  res.json({
    username: req.params._id,
    count: count,
    _id: id,
    log: logs
  })
})

app.get("/api/users", async(req, res) => {
  let newTest = await newUser.find( {} );
  var logs = await newExcersize.find({});


  res.json(logs)
})

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
