// --- Requirements
const express = require("express");
const cookieSession = require("cookie-session");
const {
  findUserByEmail,
  generateRandomString,
  randomUserId,
} = require("./index");
const userDatabase = require("./database");
const bcrypt = require("bcryptjs");

// --- Setup and Middlewares
const app = express();
const PORT = 8080;
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// --- Routes and Endpoints

// Read - GET

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
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
  let userID = req.session.user_id;
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
  let userID = req.session.user_id;
  let email = userDatabase[userID]["email"];
  let userUrls = userDatabase[userID].urls;
  let longURL = "";
  for (const index of userUrls) {
    if (index.id === req.params.id) {
      longURL = index.url;
    }
  }
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    userID: userID,
    email: email,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let userID = req.session.user_id;
  const id = req.params.id;
  let longURL = "";
  let userUrls = userDatabase[userID].urls;
  for (const index of userUrls) {
    if (index.id === id) {
      longURL = index.url;
    }
  }
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

// Create - POST

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  const newID = generateRandomString();
  const newUrl = req.body.longURL;
  let userURls = userDatabase[userID]["urls"];
  let newUrlEntry = {
    id: newID,
    url: newUrl,
  };
  userURls.push(newUrlEntry);
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  const id = req.params.id;
  let userUrls = userDatabase[userID].urls;
  userDatabase[userID].urls = userUrls.filter(function (urlObject) {
    if (urlObject.id === id) {
      return false;
    }
    return true;
  });
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  const id = req.params.id;
  const longUrl = req.body.longURL;
  let userUrls = userDatabase[userID].urls;
  for (const index of userUrls) {
    if (index.id === id) {
      index.url = longUrl;
    }
  }
  res.redirect(`/urls/${id}`);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Authentication routes 
app.post("/register", (req, res) => {
  const newUserID = randomUserId();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  if (userEmail === "" || userPassword === "") {
    return res
      .status(400)
      .send(`Please provide email and password!`);
  }

  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"]) {
      return res
        .status(400)
        .send(`Email already exists!`);
    }
  }

  userDatabase[newUserID] = {
    id: newUserID,
    email: userEmail,
    password: hashedPassword,
    urls: [],
  };
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (findUserByEmail(userDatabase, userEmail)) {
    const user = findUserByEmail(userDatabase, userEmail);
    if (bcrypt.compareSync(user.password, hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res
      .status(403)
      .send(`Wrong password.`);
    }
  } else {
    res
      .status(403)
      .send(`Email does not exist`);
  }
});

// --- Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
