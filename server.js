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
  duration: Number,
  date: String,
  versionKey: false
}, { collection: "user" }, { versionKey: false } ));

var newExcersize = mongoose.model('updatesusers', new Schema({
  username: String,
  __id: String,
  description: String,
  duration: Number,
  date: String,
  versionKey: false}, { collection: "excersises" }, { versionKey: false }))

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
    versionKey: false
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

  const accCheck = await newUser.find( { _id: req.params._id } );
  //console.log(req, "<=");

  console.log(accCheck);

  var date = req.body.date;

  console.log(date);

  var today;


  if (accCheck.length > 0) {
      if (date.length > 10 || date.length < 10) {

        today = new Date();
        var testStr = today.toDateString();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        //var todayStr = today.toString().toDateString()
        console.log(todayStr, "this");

        const excLog = await newUser.find( { _id: req.params._id } );
        //await user.insertOne( { username: req.params._id}, {$set: {description: req.body.description,
        //duration: req.body.duration,
        //date: today}} )
        console.log("Excersises Saved! - Today's Date")

        let userName = excLog[0].username;

        var duration = req.body.duration;
        var newDuration = parseInt(duration);

        let userExc = new newExcersize ({
          username: userName,
          description: req.body.description,
          duration: newDuration,
          date: today,
          versionKey: false
        })

        userExc.save({
          username: userName,
          description: req.body.description,
          duration: newDuration,
          date: today
        })

        res.json({
          username: userName,
          description: req.body.description,
          duration: newDuration,
          date: testStr,
          _id: req.params._id
        })
      }

      else {

        const excLog = await newUser.find( { _id: req.params._id } );

        today = req.body.date
        var date = new Date(today)
        var todayStr = date.toDateString()

        var duration = req.body.duration;
        var newDuration = parseInt(duration);

        let userName = excLog[0].username;

        let userExc = new newExcersize ({
          username: userName,
          description: req.body.description,
          duration: newDuration,
          date: today,
          versionKey: false
        })

        console.log(today, "that");

        console.log("Excersises Saved! - Custom Date")

        userExc.save({
          description: req.body.description,
          username: userName,
          duration: newDuration,
          date: today
        })

        res.json({
          username: userName,
          description: req.body.description,
          duration: newDuration,
          date: todayStr,
          _id: req.params._id
        })
      }

}

  else {
    return console.log("user doesn't exist");
    res.redirect("/");
  }
});

app.get("/api/users/:_id/logs", async(req, res) => {

  const { from, to, limit } = req.query;

  let userExc = new newExcersize ({
    username: req.params.username,
    _id: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date,
    versionKey: false
  })

  var user = await newUser.find( { _id: req.params } );

  //console.log(user);

  var userTest = user[0].username;
  //console.log(user[0].username);

  let filter = {
    username: userTest
  }

  //console.log(filter);

  let dateObj = {}

  let newFrom = new Date(from)
  let newTo = new Date(to)

  if(from) {
    dateObj["$gte"] = newFrom.toISOString()
  }
  if(to){
    dateObj["$lte"] = newTo.toISOString()
  }

  if(from || to) {
    filter.date = dateObj;
  }

  let nonNullLimit = limit ?? 500;

  console.log(dateObj)
  console.log(filter, "<= filter");
  console.log(newFrom.toDateString())
  console.log(newTo.toDateString())


  var logs = await newExcersize.find( filter ).limit(+nonNullLimit);
  var count = await newExcersize.find( filter ).count();
  var id = req.params._id
  var username = req.params.username;

  console.log(logs, "<= this is logs");
  //console.log(req.params);

  var fullLog = [];

  for(let i = 0; i < count; i++){

    var newLog = logs.map( (obj) => ({
        description: obj.description,
        duration: obj.duration,
        date: obj.date
    }))
  }

  //console.log(newLog);

  //var count = newLog.length;
  var newCount = parseInt(count);
  //console.log(newLog);



  res.json({
    username: userTest,
    count: newCount,
    _id: req.params._id,
    log: newLog
  })
})

app.get("/api/users", async(req, res) => {
  let newTest = await newUser.find( {} );
  var logs = await newUser.find({});


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
