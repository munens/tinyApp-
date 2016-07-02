"use strict";

var express = require("express");
var connect = require('connect');
var methodOverride = require('method-override');
const Mongo       = require("mongodb")
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

let db;
MongoClient.connect(MONGODB_URI, (err, database) => {

  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }

  console.log('Connected to the database!');
  //let collection = db.collection("test");
  
  db = database;

  //console.log('Retreiving documents for the "test" collection...');
  // 	collection.find().toArray((err, results) => {
  //   console.log('results: ', results);

  //   console.log('Disconnecting from Mongo!');
  //   db.close();
  // });
});


const bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.urlencoded());
app.use(methodOverride('_method'))
app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

 var urlDatabase = {
   "b2xVn2": "http://www.lighthouselabs.ca",
   "9sm5xK": "http://www.google.com"
 };

function generateRandomString() {
	var rString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for(var i = 0; i < 6; i++){
		result += rString.charAt(Math.floor(Math.random() *  (32 - 0) + 0));
	}
    return result;
}

var randomString = generateRandomString();

app.get("/urls", (req, res) => {
  
  db.collection('urls').find().toArray((err, results) => {
  	if(err){
  		console.log('failed to retrieve information from the database')
  		throw err;
  	}

  	console.log(results);
  	let templateVars = { urls: results };
  	res.render("urls_index", templateVars);

  });
  
  
  
});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id,
//   						urls: urlDatabase };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  
  let newURLObj = {
  	shortURL : randomString,
  	longURL : req.body.longURL
  };


  console.log("from post:" + newURLObj);

  db.collection('urls').insert(newURLObj, (err, result)=> {
  	if(err){ 
  		console.log('failed to add to database');
  	 	throw err;
  	}

  	console.log(result);
  	res.redirect('/urls');

  });

});

app.delete("/urls/:shortURL", (req, res) => {

	let filter = {shortURL: req.params.shortURL}

	console.log(filter);

	db.collection('urls').deleteOne(filter, (err, result) => {
		if(err){
			console.log('Object not deleted from database');
			throw err;
		}

		res.redirect('/urls');
	});

})

app.put("/urls/:shortURL", (req, res) => {
	
	// console.log("new url? " + req.body.newURL);
	// urlDatabase[req.params.shortURL] = req.body.newURL;

	// let templateVars = { shortURL: req.params.shortURL,
 //   							 urls: urlDatabase };
	// res.render('urls_index', templateVars);


	
	let filter = {shortURL : req.params.shortURL};
	let replace = { shortURL : req.params.shortURL,
					longURL : req.body.newURL };


	db.collection('urls').findOneAndReplace(filter, replace, (err, result) => {
		if(err){
			console.log("unable to replace URL")
		}

		console.log(result)

		res.redirect('/urls')
	})
})


app.get("/urls/u/:shortURL/edit", (req, res) => {
	
	let filter = {shortURL : req.params.shortURL}

	db.collection('urls').findOne(filter, (err, result) => {
		if(err){ throw err}
		console.log("is this it: ", result)
		let templateVars = {url : result};
		res.render('urls_show', templateVars);
	})

});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get('/hello', (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


