const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("models");

const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app, use(express.json());

app.use(express.static("public"));

// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Connect to Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true })
