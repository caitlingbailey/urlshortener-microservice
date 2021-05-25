require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create new schema instance
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: {type: Number}
});

// Create instance of new schema
const URL = mongoose.model("URL", urlSchema);

// Method to create new URL
const createShortURL = (original_url, done) => {
  let current_url = new URL({original_url: original_url});
  
  current_url.save(function(err, data) {
    if (err) return console.error(err);
    console.log(data);
    done(null, data)
  });
};

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Create URL Shortener

app.get("/api/shorturl", (req, res) => {
  res.json({output: req});
})

app.post("/api/shorturl", (req, res) => {
  // console.log(req);
  console.log(req.body.url);
  
  dns.lookup(req.body.url, (err, address, family) => {
    if (err) return 1;
  });

  createShortURL(req.body.url);

  res.json({ original_url : req.body.url,
  short_url : 1});
});