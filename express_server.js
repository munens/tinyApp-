"use strict";

require('dotenv').config();
const express = require("express");
const connect = require('connect');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Mongo       = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8080;

let db;
MongoClient.connect(MONGODB_URI, (err, database) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }
  console.log('Connected to the database!');
  db = database;
});

var app = express();

app.use(bodyParser.urlencoded());
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

function generateRandomString() {
  var rString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for(var i = 0; i < 6; i++){
    result += rString.charAt(Math.floor(Math.random() *  (32 - 0) + 0));
  }
  return result;
}

app.get("/urls", (req, res) => {
  
  db.collection('urls').find().toArray((err, results) => {
    if(err){
      console.log('failed to retrieve information from the database')
      throw err;
    }
    res.render("urls_index", { urls: results });
  });

});

app.get("/urls/new", (req, res) => {

  res.render("urls_new");

});

app.post("/urls", (req, res) => {
  
  let newURLObj = {
    shortURL : generateRandomString(),
    longURL : req.body.longURL
  };

  db.collection('urls').insert(newURLObj, (err, result)=> {
    if(err){ 
      console.log('failed to add to database');
      throw err;
    }
    res.redirect('/urls');
  });

});

app.delete("/urls/:shortURL", (req, res) => {

  let filter = {shortURL: req.params.shortURL}

  db.collection('urls').deleteOne(filter, (err, result) => {
    if(err){
      console.log('Object not deleted from database');
      throw err;
    }
    res.redirect('/urls');
  });

})

app.put("/urls/:shortURL", (req, res) => {
  
  let filter = {shortURL: req.params.shortURL};
  let replace = {shortURL: req.params.shortURL,
                 longURL: req.body.newURL };

  db.collection('urls').findOneAndReplace(filter, replace, (err, result) => {
    if(err){
      console.log("unable to replace URL");
    }
    res.redirect('/urls');
  });

});

app.get("/urls/:shortURL/edit", (req, res) => {
  
  let filter = {shortURL : req.params.shortURL}

  db.collection('urls').findOne(filter, (err, result) => {
    if(err){ throw err }
    res.render('urls_show',  {url : result});
  });

});

app.get("/u/:shortURL", (req, res) => {
  
  let filter = {shortURL : req.params.shortURL}

  db.collection('urls').findOne(filter, (err, result) => {
    if(err){ throw err }

    res.redirect(result.longURL);
  });

});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


