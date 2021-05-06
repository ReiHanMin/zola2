const fetch = require('node-fetch');
const cheerio = require('cheerio');
const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
const movieUrl = 'https://www.imdb.com/title/';

const movieCache = {};
const searchCache = {};

function searchMovies(searchTerm){
    if (searchCache[searchTerm]) {
        console.log('Serving from cache:', searchTerm);
        return Promise.resolve(searchCache[searchTerm]);
    }
    return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
        const movies = [];
        const $ = cheerio.load(body);
        $('.findResult').each(function (index, element) {
            const $element = $(element);
            const $image = $element.find('td a img');
            const $title = $element.find('td.result_text a');

            const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];

            const movie = {
               image:  $image.attr('src'),
               title:  $title.text(),
               imdbID
        };
        movies.push(movie)
     });

     searchCache[searchTerm] = movies;

     return movies;
});

}

function getMovie(imdbID) {
    if (movieCache[imdbID]) {
        console.log('Serving from cache:', imdbID);
        return Promise.resolve(movieCache[imdbID]);
    }
    return fetch(`${movieUrl}${imdbID}`)
    .then(response => response.text())
    .then(body => {
        const $ = cheerio.load(body);
        const $title = $('.title_wrapper h1');

        const title = $title.first().contents().filter(function() {
            return this.type === 'text';
        }).text().trim();
        const rating = $('.subtext').text().substring(20,24).trim();
        const runtime = $('.subtext').text().substring(73,80).trim();
        const genres = [];
        $('.subtext a').each(function(index, element) {
            const genre = $(element).text().trim();
            genres.push(genre);
        });
        genres.pop();
        const datePublished = $('.subtext a').slice(-1).text().trim();
        const imbdRating = $('span[itemProp="ratingValue"]').text();
        const poster = $('div.poster a img').attr('src');
        const summary = $('div.summary_text').text().trim()
        const director = $('.credit_summary_item a').eq(0).text()
        const writer = $('.credit_summary_item a').eq(1).text()
          

        const movie = { 
            title, 
            rating, 
            runtime,
            genres,
            datePublished,
            imbdRating,
            poster,
            summary,
            director,
            writer 
        };

        movieCache[imdbID] = movie;  
        console.log(movieCache);  
        return movie;
    });
}

module.exports = { searchMovies, getMovie }