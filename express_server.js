"use strict";

var express = require("express");
var connect = require('connect');
var methodOverride = require('method-override');

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  console.log(req.body)
  
  urlDatabase[randomString]=req.body.longURL;
  console.log("from post:" + urlDatabase);
  res.redirect("/urls");         
});

app.delete("/urls/:shortURL", (req, res) => {
	
	delete urlDatabase[req.params.shortURL];
	console.log(urlDatabase)

	let templateVars = { shortURL: req.params.shortURL,
   							 urls: urlDatabase };
   	console.log("deleted?", urlDatabase);
	res.render('urls_index', templateVars);
})

app.put("/urls/:shortURL", (req, res) => {
	
	// urlDatabase[req.params.shortURL] = 
	// console.log(urlDatabase)
	console.log("new url? " + req.body.newURL);
	urlDatabase[req.params.shortURL] = req.body.newURL;

	let templateVars = { shortURL: req.params.shortURL,
   							 urls: urlDatabase };
	res.render('urls_index', templateVars);
})


app.get("/urls/u/:shortURL/edit", (req, res) => {
	
	let templateVars = { shortURL: req.params.shortURL,
   							 urls: urlDatabase };
   	console.log(templateVars.shortURL)
	res.render("urls_show", templateVars);
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