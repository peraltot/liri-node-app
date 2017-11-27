"use strict";

const keys = require('./keys');
const io = require('fs');
const readline = require('readline');
const path = require('path');
const req = require('request');
const Twitter = require('twitter');
const colors = require('colors');
const moment = require('moment');
const Spotify = require('node-spotify-api');

const twitterKeys = keys.twitterKeys;

const randomTextFile = path.join(__dirname, 'random.txt');

const file = readline.createInterface({
    input: io.createReadStream(randomTextFile),
    output: process.stdout,
    terminal: false
});

let command = process.argv[2];
let commandString = process.argv[3];

let preventWrite = false;

const twitter = new Twitter(twitterKeys);

//----------------------------------------------------------------------
/**
 * Application entry point.
 */
const main = () => {
    if (!command) {
        console.warn('A valid command is needed to run this program.'.red);
        console.warn('\n1. my-tweets - This will show your last 20 tweets and when they were created at in your terminal/bash window.\n2. spotify-this-song [song name] [optional list count] - This will show song information in your terminal/bash window.\n3. movie-this [movie name] - This will show movie information in your terminal/bash window.\n4. do-what-it-says - This will run commands from random.txt file.'.green);
        return;
    }

    return runCommand(command);
};

/**
 * Commands to be ran.
 * @param command
 */
const runCommand = (command) => {
    switch (command) {
        case "my-tweets":
            myTweets();
            logCommand('my-tweets', '', '');
            break;

        case "spotify-this-song":
            searchSpotifySong(commandString);
            logCommand('spotify-this-song', `${commandString}`);
            break;

        case "movie-this":
            searchMovieAPI(commandString);
            logCommand('movie-this', commandString ? commandString : '', '');
            break;

        case "do-what-it-says":
            readRandomTextFile();
            break;

        default:
            console.warn(`Unable to find the command ${command}`.red);
            return;
    }
};

/**
 * Get tweets from the selected user.
 * @param username
 */
const myTweets = (username = 'tomperalto') => {
    twitter.get('statuses/user_timeline', {
        screen_name: username.trim(),
        count: 20
    }, function (error, tweets) {
        if (error)
            throw error;

        let i = 0;
        tweets.forEach(function () {
            let time = moment(tweets[i].created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').format('MM/DD/YYYY hh:mm A');

            console.log(`${time}: ${tweets[i].text}`);
            i++;
        });

        i = 0;
    });
};

/**
 * Get information about a song from the Spotify API.
* @param song
* @param listLimit
 */
// var Spotify = new SpotifyWebApi({
//     clientId : 'df3d08264bd14007a71b3aec9c7b9196',
//     clientSecret : 'f0c72e1499b6408d93a9c602d5f0b230'
//   });
//spotify function

const searchSpotifySong = (song = "album:The%20Sign%20artist:Ace%20of%20Base", listLimit = 1) => {

var spotify = new Spotify({
  id: "df3d08264bd14007a71b3aec9c7b9196",
  secret: "f0c72e1499b6408d93a9c602d5f0b230"
});

spotify.search({ type: 'track', query: song }, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }

//   console.log(data); 
  console.log(colors.green(data.tracks.items[0].name)); 
  console.log(colors.green(data.tracks.items[0].album.artists[0].name));
  console.log(colors.green(data.tracks.items[0].preview_url));
  console.log(colors.green(data.tracks.items[0].album.name));

});
}


/**
 * Searching the movie API for information.
 * @param movie
 */
const searchMovieAPI = (movie = 'mr nobody') => {
    /* Title of the movie.
     Year the movie came out.
     IMDB Rating of the movie.
     Country where the movie was produced.
     Language of the movie.
     Plot of the movie.
     Actors in the movie.
     Rotten Tomatoes Rating.
     Rotten Tomatoes URL.*/

    req(`http://www.omdbapi.com/?t=${movie}&plot=short&r=json&tomatoes=true&apikey=40e9cece`, function (err, res) {
        const json = JSON.parse(res.body);

        const title = json.Title;
        const year = json.Year;
        const imdbRating = json.imdbRating;
        const plot = json.Plot;
        const actors = json.Actors;
        const tomatoRating = json.tomatoRating;
        const tomatoURL = json.tomatoURL;

        console.log(`Title: ${title}\nYear: ${year}\nIMDB Rating: ${imdbRating}\nPlot: ${plot}\nActors: ${actors}\nTomato Rating: ${tomatoRating}\nTomato URL ${tomatoURL}`);
    });
};

/**
 * Read the random.txt file.
 */
const readRandomTextFile = () => {
    preventWrite = true;

    file.on('line', function (data) {
        let split = data.split(',');

        command = split[0];
        commandString = split[1];

        runCommand(command);
    });
};

/**
 * Log the command to file.
 * @param command
 * @param commandValue
 * @param callback
 */
const logCommand = (command, commandValue, callback) => {
    if (preventWrite === true)
        return;

    if (command == null || commandValue == null)
        throw new TypeError('Missing params');

    if (command == 'do-what-it-says')
        throw new Error('Command will result in a loop');

    else
        io.appendFile(randomTextFile, `\n${command},${commandValue}`, function (err) {
            if (err)
                throw err;
        });

    if (callback)
        callback();
};

// Runs when the program is started.
main();