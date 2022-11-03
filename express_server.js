const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 
app.use(cookieParser()); 
app.set("view engine", "ejs");

// function that generate a string of 6 random alphanumeric characters for Urls:
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};

// function that generates random User ID
function randomUserId() {
  return Math.random().toString(36).substr(2,4);
};

// not working when it get called. Says res not defined
getUserByEmail = (userEmail) => {
  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"] ) { 
      console.log(`email exist in the database`);
    }
  };
}

const userDatabase = {
  "4pwn": {
    id: "4pwn",
    email: "johndoe@gmail.com",
    password: "1234", 
  },
  "bcnr": {
    id: "bcnr",
    email: "lhl@gmail.com",
    password: "abcd", 
  }
};

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

//homepage
app.get("/urls", (req, res) => {
  let user = req.cookies.username; 
  let userID = req.cookies.user_id; 
  console.log(userID); 
  let email = userDatabase[userID]["email"]; 
  const templateVars = {
    urls: urlDatabase,
    user: user,
    userID: userID,
    email: email,  
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let user = req.cookies.username;
  let userID = req.cookies.user_id;
  let email = userDatabase[userID]["email"];  
  const templateVars = {
    user: user,
    userID: userID,
    email: email, 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req,res) => {
  let user = req.cookies.username;
  let userID = req.cookies.user_id;
  let email = userDatabase[userID]["email"];   
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: user,
    userID: userID,
    email: email,  
  };
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


app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); 
  res.redirect("/login");
}); 

app.get("/register", (req, res) => { 
  res.render("urls_register")
});

app.post("/register", (req, res) => {
  const newUserID = randomUserId(); 
  const userEmail = req.body.email; 
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.send(`400 Bad Request`);
  };

  // not working: 
  // if (getUserByEmail(userEmail)){
  //   res.send(`400 Bad Request`);
  // }; 

  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"] ) { 
      res.send(`400 Bad Request`);
    }
  };

  userDatabase[newUserID] = {
    id: newUserID,
    email: userEmail,
    password: userPassword
  }; 
  res.cookie('user_id', newUserID); 
  res.redirect("/urls")
});

app.get("/login", (req, res) => { 
  res.render("urls_login")
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email; 
  const userPassword = req.body.password; 
  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"] && userPassword === userDatabase[id]["password"]) {
      res.cookie('user_id', id);
      res.redirect("/urls");
    }
  };
  if (userEmail === "" || userPassword === "") {
    res.send(`400 Bad Request`);
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
