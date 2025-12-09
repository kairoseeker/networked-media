/*********************************************
library imports
*********************************************/
const express = require("express")
const multer = require("multer")
const bodyParser = require("body-parser")
const nedb = require("@seald-io/nedb")
/// NEW LIBRARIES FOR TODAY
const cookieParser = require("cookie-parser")
const expressSession = require("express-session")
const nedbSessionStore = require("nedb-promises-session-store")
const bcrypt = require("bcrypt")

/*********************************************
library configurations:
- setting up express server via app
- setting up how the parser interprets data
- setting up where multer stores images
- setting up database files
*********************************************/
const app = express()
const urlEncodedParser = bodyParser.urlencoded({ extended: true })
const upload = multer({
  dest: "public/uploads",
})
let database = new nedb({
  filename: "database.txt",
  autoload: true,
})
//// NEW LIBRARY CONFIGURATIONS
app.use(cookieParser())

// setting up the session db creation
const nedbSessionInit = nedbSessionStore({
  connect: expressSession,
  filename: "sessions.txt",
})
// linking app to use session db
app.use(
  expressSession({
    store: nedbSessionInit,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, 
    },
    secret: "thisismysecretkey",
  })
)
let userdb = new nedb({
  filename: "userdb.txt",
  autoload: true,
})

let stickerdb = new nedb({
  filename: "stickerdb.txt",
  autoload: true,
})

/*********************************************
middleware setup
*********************************************/
app.use(express.static("public"))
app.use(express.json())
app.use(urlEncodedParser)
app.set("view engine", "ejs")

/*********************************************
ROUTES: determining what locations are accessible via URL
*********************************************/
app.get("/", (request, response) => {
  let hundredyears = 1000 * 60 * 60 * 24 * 365 * 100
  // NEW COOKIE: CHECK IF COOKIE EXSISTS
  if (request.cookies.visits) {
    let updatedVisits = parseInt(request.cookies.visits) + 1
    response.cookie("visits", updatedVisits, {
      expires: new Date(Date.now() + hundredyears),
    })
  } else {
    // NEW COOKIE SETUP
    // 3 parameters:
    // 1. name of the cookie
    // 2. value we are setting it to
    // 3. object: {} when the cookie "dies"/expires
    response.cookie("visits", 1, {
      expires: new Date(Date.now() + hundredyears),
    })
  }

  if (request.session.loggedInUser) {
    response.render("index.ejs", { 
      loggedIn: true, 
      username: request.session.loggedInUser 
    })
  } else {
    response.render("index.ejs", { 
      loggedIn: false 
    })
  }
})

app.post("/upload", upload.single("theimage"), (req, res) => {
  let currentDate = new Date()

  let data = {
    text: req.body.text,
    date: currentDate.toLocaleString(),
    timestamp: currentDate.getTime(),
    likes: 0,
  }

  if (req.file) {
    data.image = "/uploads/" + req.file.filename
  }

  database.insert(data, (err, newData) => {
    console.log(newData)
    res.redirect("/")
  })
})

app.post("/like", (req, res) => {
  let retrievedId = req.body.postId

  if (req.cookies[retrievedId] == "liked!") {
    res.redirect("/")
  } else {
    let query = {
      _id: retrievedId,
    }
    let update = {
      $inc: { likes: 1 },
    }
    res.cookie(retrievedId, "liked!", {
      expires: new Date(Date.now() + 100000000),
    })
    database.update(query, update, {}, (err, numUpdated) => {
      res.redirect("/")
    })
  }
})

/////////////////////////////////////////////////
//        add new routes below this line!      //
/////////////////////////////////////////////////
app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.post("/signup", (req, res) => {
  let hashedPassword = bcrypt.hashSync(req.body.password, 10)

  let newUser = {
    username: req.body.username,
    fullname: req.body.fullname,
    password: hashedPassword,
  }

  userdb.insert(newUser, (err, insertedData) => {
    res.redirect("/login")
  })
})

app.get("/welcome", (req, res) => {
  if (req.session.loggedInUser) { 
    res.redirect('/')
  } else {
  res.render("welcome.ejs")
  }
})

app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/")
  })
})

app.get("/12", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("12.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.get("/34", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("34.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.get("/56", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("56.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.get("/78", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("78.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.get("/910", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("910.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.get("/1112", (req, res) => {
  if (req.session.loggedInUser) {
    res.render("1112.ejs", { username: req.session.loggedInUser })
  } else {
    res.redirect("/login")
  }
})

app.post("/authenticate", (req, res) => {
  let loginAttempt = {
    username: req.body.username,
    password: req.body.password,
  }

  let searchUser = {
    username: loginAttempt.username,
  }

  userdb.findOne(searchUser, (err, foundUser) => {
    if (foundUser == null || err) {
      console.log("username not found")
      res.redirect("/login?user=null")
    } else {
      let encPass = foundUser.password
      if (bcrypt.compareSync(loginAttempt.password, encPass)) {
        let session = req.session
        session.loggedInUser = foundUser.username
        res.redirect("/")
      } else {
        res.redirect("/login?password=invalid")
      }
    }
  })
})

app.post("/save-sticker", (req, res) => {
  console.log("=== SAVE STICKER REQUEST ===");
  console.log("Session user:", req.session.loggedInUser);
  console.log("Request body:", req.body);
  
  if (!req.session.loggedInUser) {
    console.log("ERROR: Not logged in");
    return res.status(401).json({ error: "Not logged in" })
  }

  let newSticker = {
    userId: req.session.loggedInUser,
    monthPage: req.body.monthPage,
    stickerType: req.body.stickerType,
    stickerSrc: req.body.stickerSrc,
    xPosition: req.body.xPosition,
    yPosition: req.body.yPosition,
    timestamp: Date.now()
  }

  console.log("Saving sticker:", newSticker);

  stickerdb.insert(newSticker, (err, insertedSticker) => {
    if (err) {
      console.log("ERROR inserting sticker:", err);
      return res.status(500).json({ error: "Database error" })
    }
    console.log("Sticker saved successfully:", insertedSticker);
    res.json({ success: true, sticker: insertedSticker })
  })
})

app.get("/load-stickers/:month", (req, res) => {
  if (!req.session.loggedInUser) {
    return res.status(401).json({ error: "Not logged in" })
  }

  let query = {
    userId: req.session.loggedInUser,
    monthPage: req.params.month
  }

  stickerdb.find(query, (err, stickers) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json({ stickers: stickers })
  })
})

app.delete("/delete-sticker/:id", (req, res) => {
  if (!req.session.loggedInUser) {
    return res.status(401).json({ error: "Not logged in" })
  }

  let query = {
    _id: req.params.id,
    userId: req.session.loggedInUser
  }

  stickerdb.remove(query, {}, (err, numRemoved) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json({ success: true, numRemoved: numRemoved })
  })
})

app.delete("/clear-stickers/:month", (req, res) => {
  if (!req.session.loggedInUser) {
    return res.status(401).json({ error: "Not logged in" })
  }

  let query = {
    userId: req.session.loggedInUser,
    monthPage: req.params.month
  }

  stickerdb.remove(query, { multi: true }, (err, numRemoved) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json({ success: true, numRemoved: numRemoved })
  })
})

/*********************************************
server listener for when requests are made 
to the server
- we don't really need to modify this
- needs to go at the end
*********************************************/
app.listen(6007, () => {
  console.log("server started on port 6007")
})
