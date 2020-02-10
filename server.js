const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = 3000;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Set Handlebars
var hbs = require("express-handlebars");

app.engine("handlebars", hbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Connect to Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true }, function () {
    console.log("mongo connected")
});

//Routes

//GET route for scraping the jazztimes site
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://jazztimes.com/features/columns/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            console.log(result);


            // Create a new Article using the `result` object built from scraping
            db.Article.create(result).then(function (dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});






//start server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
