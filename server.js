const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express()
const PORT= 3000
const path = require('path');

const DIR = './uploads';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
        console.log(file)
      cb(null, file.originalname);
    }
});
let upload = multer({storage: storage});

// mongo db
var mongodb = require("mongodb");

// getting id
var ObjectID = mongodb.ObjectID;

let db;

Posts = "posts"


// const mongoUrl = 'mongodb://<dbuser>:<dbpassword>@ds145463.mlab.com:45463/movies'
const mongoUrl = 'mongodb://ahmadyassin:12345ahmad@ds145463.mlab.com:45463/movies'

// let Movies

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(mongoUrl, function (err, database) {
    if (err) {
      console.log(err);
    }

    // Save database object from the callback for reuse.
    db = database.db('movies');
    // Movies = db.collection('movies')
    console.log("Database connection ready");

    var server = app.listen(process.env.PORT || PORT, function () {
        console.log("App now running on port", PORT);
    });

})

  // for parsing and delevering the json
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}) );

  // for google auth and allowing passing headers from server to app
  app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
  });

  app.use('/uploads',express.static('./uploads'))


  
app.get('/', (req, res) => {
    res.send({
        msg: 'Welcome to Movies Backend'
    })
})

app.get('/movies', (req, res) => {
    let movies = db.collection("movies").find({}).toArray((err, doc) => res.send(doc))
})
app.get('/getMovie/:id', (req, res) => {
    const movie = db.collection("movies").find( { _id: ObjectID(req.params.id) } ).toArray((err, doc) => res.send(doc[0]))
})

app.post('/addMovie', upload.single('photo'), (req, res) => {
    console.log(req.body)
    let movie = {
        name: req.body.name,
        genre: req.body.genre,
        length: req.body.length,
        image: req.body.image,
    }
    db.collection("movies").insertOne(movie, function(err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
        }
    });
})

app.post('/addPhoto', upload.single('photo'), (req, res) => {
    res.send('photo uploaded')
})

app.put('/updateMovie/:id', (req, res) => {
    console.log(req.body)
    let myQuery =  { _id: ObjectID(req.params.id) }

    let movie = {
        "name": req.body.name,
        "genre": req.body.genre,
        "length": req.body.length,
    }

    let newValue = {$set: req.body}
    db.collection("movies").findOneAndUpdate( myQuery, {$set: movie} )
})

app.delete('/deleteMovie/:id', (req, res) => {
    const movie = db.collection("movies").remove( { _id: ObjectID(req.params.id) } )
})