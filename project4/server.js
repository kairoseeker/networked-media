const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer')
const nedb = require("@seald-io/nedb");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
const uploadProcessor = multer( {dest: 'assets/upload/' })
const encodedParser = bodyParser.urlencoded( {extended: true });
app.use(encodedParser)

app.set('view engine', 'ejs')

const database = new nedb({
  filename: "database.txt",
  autoload: true,
});

app.get('/add', (req, res)=>{

  let query = {}  
  let sortQuery = {
    timestamp: -1 
  }
  database.find(query).sort(sortQuery).exec( (err, dataInDB)=>{
    console.log(dataInDB)
    if(err){
      res.render('form.ejs', {})
    }
    res.render('form.ejs', { posts: dataInDB })
  })
})

app.post('/post', uploadProcessor.single('image'), (req, res)=>{
  let currentTime = new Date()

  console.log(req.body)

  let postToBeAddedToDB = {
    date: currentTime.toLocaleString(),
    text: req.body.text,
    timestamp: currentTime.getTime()
  }

  database.insert(postToBeAddedToDB, (err, dataThatHasBeenAdded)=>{
    if(err){
      console.log(err)
      res.redirect('/add')
    } else {
      console.log(dataThatHasBeenAdded)
      res.redirect('/add')
    }
  })
})

app.get("/all-posts", (req, res) => {
  // let allPosts = [
  //     {text: "post 1"},
  //     {text: "post 2"},
  //     {text: "post 3"},
  // ]

  let query = {}; 

  database.find(query).exec((err, data) => {
    res.json({ posts: data });
  });
});

app.listen(7001, () => {
  console.log("server running on http://127.0.0.1:7001");
});