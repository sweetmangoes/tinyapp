const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

app.use(cookieParser()); 

// function that returns a string of 6 random alphanumeric characters:
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req,res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  console.log()
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString()
  const newUrl = req.body.longURL;
  urlDatabase[newID] = newUrl;
  res.redirect(`/urls/${newID}`)
});

app.get("/u/:id", (req, res) => { 
  const id = req.params.id; 
  const longURL = urlDatabase[id]; 
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls"); 
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id; 
  const longUrl = req.body.longURL;
  urlDatabase[id] = longUrl;
  res.redirect(`/urls/${id}`)
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls");
}); 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
