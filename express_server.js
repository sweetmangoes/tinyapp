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
    urls: [{ id: "5sm7Ky", url: "http://www.apple.com" }],
  },
  bcnr: {
    id: "bcnr",
    email: "lhl@gmail.com",
    password: "abcd",
    urls: [{ id: "9sm5xK", url: "http://www.google.com" }],
  },
};

//store database in a seperate file. 
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "7sm6xK": "http://www.apple.com",
  "3sm4xK": "http://www.nba.com",
};

app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

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
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userID: userID,
    email: email,
  };
  console.log();
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.post("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  const newID = generateRandomString();
  const newUrl = req.body.longURL;
  userDatabase[userID].urls[newID] = {
    id: newID,
    url: newUrl,
  };
  console.log(userDatabase[userID].urls[newID]); // overwrites stored data for some reason. 
  res.redirect(`/urls/${newID}`);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.send("404 not found");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = req.body.longURL;
  urlDatabase[id] = longUrl;
  res.redirect(`/urls/${id}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
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
  };
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
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
