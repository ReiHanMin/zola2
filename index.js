const express = require ('express');

const scraper = require('./scraper');

const app = express();

app.get('/', (req, res, next) => {
    res.json({ message: 'Scraping is fun!' });
});


//  /search/star wars
app.get('/search/:title', (req, res, next) => {
    scraper
    .searchMovies(req.params.title)
    .then(movies => {
        res.json(movies);
    })
});

app.get('/movie/:imdbID', (req, res, next) => {
    scraper
    .getMovie(req.params.imdbID)
    .then(movie => {
        res.json(movie);
    })
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});