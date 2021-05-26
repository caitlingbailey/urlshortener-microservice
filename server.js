require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');


// Connect to database
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
  original_url: { 
    type: String, 
    required: true },
  short_url: {
    type: String, 
    default: () => nanoid(5)},
  clicks: {
    type: Number, 
    default: 0}
});


// Create instance of new schema
const URL = mongoose.model("URL", urlSchema);

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// Create URL Shortener

app.post("/api/shorturl", async (req, res) => {
  const REPLACE_REGEX = /^https?:\/\//i
  const original_url = req.body.url;
  const url_lookup = original_url.replace(REPLACE_REGEX, '');

  if (validUrl.isWebUri(original_url)) {
    console.log('Looks like an URI');
    createShortURL(original_url);

    let query = await URL.findOne({original_url : original_url});
    const shortURL = query.short_url;

    res.json({ 
      original_url : original_url,
      short_url : shortURL});
  } else {
    console.log('Not a URI');
    res.json({ error: 'invalid url' });
    };
});

app.get("/api/shorturl/:short_id", async (req, res) => {
  // Mongoose call to find long URL
  shortId = req.params.short_id;

  let query = await URL.findOne({short_url : shortId});
  const redirectURL = query.original_url;

  // If null, throw error
  if (!query) return res.sendStatus(404);

  // If not null, increment click count in database
  URL.findOneAndUpdate({$inc : {clicks: 1}}).exec((err, clicksUpdated) => {
    if (err) return console.log(err);
  })

  // Redirect user to original link
  res.redirect(redirectURL)

  res.json({output: "looks good"});
})


// Method to create new URL
const createShortURL = async (original_url, done) => {
  const new_url = new URL({ original_url : original_url });
  await new_url.save();
};

// Redirect to personal website

app.get("/https://caitlingbailey.herokuapp.com/", async (req, res) => {
  const portfolio_url = "https://caitlingbailey.herokuapp.com/";
  res.redirect(portfolio_url);
});