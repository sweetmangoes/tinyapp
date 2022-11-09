const express = require("express");
const cookieParser = require("cookie-parser");
const {
  findUserByEmail,
  generateRandomString,
  randomUserId,
} = require("./index");
const app = express();
const PORT = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");

//store database in a seperate file.
const userDatabase = {
  "4pwn": {
    id: "4pwn",
    email: "johndoe@gmail.com",
    password: "1234",
    urls: [
      {
        id: "544k7Ky",
        url: "http://www.apple.com",
      },
    ],
  },
  bcnr: {
    id: "bcnr",
    email: "lhl@gmail.com",
    password: "abcd",
    urls: [
      { 
        id: "9sm5xK", 
        url: "http://www.google.com",
      }, 
      { 
        id: "K0be24", 
        url: "http://www.nba.com",
      }, 
    ],
  },
};

//store database in a seperate file.
// not needed anymore.
// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "7sm6xK": "http://www.apple.com",
//   "3sm4xK": "http://www.nba.com",
// };

app.use(express.urlencoded({ extended: true }));

// GET 

app.get("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  let email = userDatabase[userID]["email"];
  let userURLs = userDatabase[userID].urls;
  const templateVars = {
    urls: userURLs,
    userID: userID,
    email: email,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  let email = userDatabase[userID]["email"];
  const templateVars = {
    userID: userID,
    email: email,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies.user_id;
  let email = userDatabase[userID]["email"];
  let userUrls = userDatabase[userID].urls
  let longURL = ''; 
  for (const index of userUrls) {
    console.log(index.id); 
    console.log(req.params.id);
    if (index.id === req.params.id) {
      longURL = index.url
    } 
  }
  console.log(`longUrl: ${longURL}`)
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    userID: userID,
    email: email,
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  let userID = req.cookies.user_id;
  const id = req.params.id;
  let longURL ='';
  let userUrls = userDatabase[userID].urls
  for (const index of userUrls) {
    console.log(id); 
    console.log(index);
    if (index.id === id) {
      longURL = index.url
    } 
  }
  console.log(`longUrl: ${longURL}`)
  if (!longURL) {
    return res.send("404 not found");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

// POST

app.post("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  const newID = generateRandomString();
  const newUrl = req.body.longURL;
  let userURls = userDatabase[userID]["urls"]; 
  console.log(`userURls: ${userURls}`)
  let newUrlEntry = {
    id: newID,
    url: newUrl,
  };
  userURls.push(newUrlEntry);
  console.log(userURls); 
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies.user_id;
  const id = req.params.id;
  let userUrls = userDatabase[userID].urls;
  for (const index of userUrls) {
    if (index.id === id) {
      delete index.id
      delete index.url

    }}
  console.log(userUrls); 
  res.redirect("/urls");
}); 

app.post("/urls/:id", (req, res) => {
  let userID = req.cookies.user_id;
  const id = req.params.id;
  const longUrl = req.body.longURL;
  let userUrls = userDatabase[userID].urls
  console.log(`id: ${id}, longUrl: ${longUrl}`);
  for (const index of userUrls) {
    console.log(index);
    console.log(id);  
    if (index.id === id) {
      index.url = longUrl
    } 
  }
  console.log(`new longUrl: ${longUrl}`)

  res.redirect(`/urls/${id}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const newUserID = randomUserId();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    return res.send(`400 Bad Request`);
  }

  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"]) {
      return res.send(`400 Bad Request`);
    }
  }

  userDatabase[newUserID] = {
    id: newUserID,
    email: userEmail,
    password: userPassword,
    urls: [],
  };
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (findUserByEmail(userDatabase, userEmail)) {
    const user = findUserByEmail(userDatabase, userEmail);
    if (userPassword === user.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.send(`403 Forbidden`);
    }
  } else {
    res.send(`403 Forbidden`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
