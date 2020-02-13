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
const Handlebars = require('handlebars')
const hbs = require("express-handlebars");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

app.engine("handlebars", hbs({ defaultLayout: "main", handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set("view engine", "handlebars");


// Connect to Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true }, function () {
    console.log("mongo connected")
});

//Routes
app.get("/", function (req, res) {
    db.Article.find({}, function (err, found) {
        if (err) {
            console.log(err);
        }
        res.render("index", { found });
    });
});
//GET route for scraping the jazztimes site
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://jazztimes.com/features/columns/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article.listing").each(function (i, element) {
            // Save an empty result object
            const result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .find("h2 a")
                .text();
            result.link = $(this)
                .find("h2 a")
                .attr("href");
            result.excerpt = $(this)
                .find("div.entry-excerpt p")
                .text();

            // console.log(result);


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

//GET route 





//start server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
