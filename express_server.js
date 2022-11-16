// --- Requirements
const express = require("express");
const cookieSession = require("cookie-session");
const {
  findUserByEmail,
  generateRandomString,
  randomUserId,
} = require("./helper");
const { userDatabase, urlsDatabase } = require("./database");
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

app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;

  // if user is not logged in, redirects to error code.
  if (!userID) {
    return res.redirect("/login");
  }

  //Displays users urls and renders homepage
  let email = userDatabase[userID]["email"];
  let userURLs = [];
  for (const url of urlsDatabase) {
    if (userID === url.userId) {
      userURLs.push([url.id, url.url]);
    }
  }
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

  if (!userID) {
    return res.redirect("/login");
  }

  let urlID = req.params.id;
  let email = userDatabase[userID]["email"];

  // Prevents user to edit other users url
  for (const url of urlsDatabase) {
    if (urlID === url.id) {
      if (userID !== url.userId) {
        return res.status(404).send(`You can't edit url that you don't own.`);
      }
    }
  }

  // Allows users to edit their url
  for (const url of urlsDatabase) {
    if (userID === url.userId) {
      if (urlID === url.id) {
        const longURL = url.url;
        const templateVars = {
          id: req.params.id,
          longURL: longURL,
          userID: userID,
          email: email,
        };
        return res.render("urls_show", templateVars);
      }
    }
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  let longURL = "";

  for (const url of urlsDatabase) {
    if (id === url.id) {
      longURL = url.url;
    }
  }

  // Send error code if url doesn't exist in database
  if (!longURL) {
    res.status(404).send(`Url shortener does not exist.`);
  }

  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;

  if (!userID) {
    return res.send(`Please log in`);
  }

  //Generates a short URL, saves it, associates it with the user and redirects to /urls/:id
  const newID = generateRandomString();
  const newUrl = req.body.longURL;
  let newUrlEntry = {
    id: newID,
    url: newUrl,
    userId: userID,
  };
  urlsDatabase.push(newUrlEntry);
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;

  if (!userID) {
    return res.send(`Please log in`);
  }

  //User deletes url, redirects to /Urls
  const id = req.params.id;
  const indexOfElementToBeDeleted = urlsDatabase.findIndex(
    (urlObject) => urlObject.id === id
  );
  if (indexOfElementToBeDeleted > -1) {
    urlsDatabase.splice(indexOfElementToBeDeleted, 1);
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = req.body.longURL;

  for (const url of urlsDatabase) {
    if (id === url.id) {
      url.url = longUrl;
    }
  }
  res.redirect(`/urls`);
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
    return res.status(400).send(`Please provide email and password!`);
  }

  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"]) {
      return res.status(400).send(`Email already exists!`);
    }
  }

  userDatabase[newUserID] = {
    id: newUserID,
    email: userEmail,
    password: hashedPassword,
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
      res.status(403).send(`Wrong password.`);
    }
  } else {
    res.status(403).send(`Email does not exist`);
  }
});

// --- Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
