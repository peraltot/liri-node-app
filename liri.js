//variables to call the information from the keys.js file which stores the twitter access keys needed for the twitter option of this app
var keys = require('./keys.js');
var twitterKeys = keys.twitterKeys;
var spotifyKeys = keys.spotifyKeys;
//sets up the variables of all of the different things required to properly run this node app
var fs = require('fs');
var prompt = require('prompt');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var colors = require("colors/safe");

//takes in the user input that calls the option you want
var userInput = '';

// //takes in the user input for the spotify & movie options
var userSelection = '';

//options that the user can choose from
var myTweets = 'my-tweets';
var songs = 'spotify-this-song';
var movies = 'movie-this';
var doWhat = 'WHAZ-UP';

//prompt start

prompt.message = colors.red("");
// prompt.delimiter = colors.cyan("\n");

prompt.start();

//asks the user what option they have chosen from the information given in the prompt message
prompt.get({
	properties: {
		userInput: {
			description: colors.green("Type one of the following: my-tweets, spotify-this-song, movie-this, or WHAZ-UP" + "\n" + 'Tell me want you want, what you really, really want?')
		}
	}
}, function (err, result) {
	userInput = result.userInput;
	//based on what the user inputs different things are done

	//if user enters tweets it will run the myTwitter function
	if (userInput == myTweets) {
		myTwitter();
	}
	//if the user enters spotify-this-song it will prompt you and ask for the song you want to look up and then it will run the mySpotify function based on those results. if the user doesnt enter a song it defaults to whats my age again and gets that information
	else if (userInput == songs) {
		prompt.get({
			properties: {
				userSelection: {
					description: colors.green('What song do you want to look up?')
				}
			}
		}, function (err, result) {

			if (result.userSelection === "") {
				userSelection = "album:The%20Sign%20artist:Ace%20of%20Base";
			} else {
				userSelection = result.userSelection;
			}
			mySpotify(userSelection);
		});
	}
	// if the user selects movie it will prompt the user to state what movie they want to look up and then it will get that information from omdb api if the prompt is left blank the function will default and look up Mr Nobody and reutrn that information
	else if (userInput == movies) {
		prompt.get({
			properties: {
				userSelection: {
					description: colors.green('What movie do you want to look up?')
				}
			}
		}, function (err, result) {
			if (result.userSelection === "") {
				userSelection = "Mr. Nobody";
			} else {
				userSelection = result.userSelection;
			}
			myMovies(userSelection);
		});
		//if the user chooses 'WHAZ-UP' then the function lastOption is run using the information from the random.txt file
	} else if (userInput == doWhat) {
		lastOption();
	};
});



//twitter function
function myTwitter() {
	//this assigns the variable client to get the information from the twitterKeys variable set above so we can access twitters information
	var client = new Twitter({
		consumer_key: twitterKeys.consumer_key,
		consumer_secret: twitterKeys.consumer_secret,
		access_token_key: twitterKeys.access_token_key,
		access_token_secret: twitterKeys.access_token_secret,
	});
	//this sets the variable params to search the username kellsbellslovee and only return back the last 20 tweets and then it doesn't trim the username so the username information will come up instead of the twitter id#
	var params = {
		screen_name: 'tomperalto',
		count: '20',
		trim_user: false,
	}

	// this is the call to twitter, it gets the statuses/user timeline from twitter based on the params set above
	client.get('statuses/user_timeline', params, function (error, timeline, response) {
		if (!error) {
			for (tweet in timeline) {
				//this creates the variable tdate which will store the result of the date from the twitter call for easier access later
				var tDate = new Date(timeline[tweet].created_at);

				//console.log all of the tweets organizing them by tweet# followed by the date of the tweet and finally the text of the tweet itself
				console.log("Tweet #: " + (parseInt(tweet) + 1) + " ");
				console.log(tDate.toString().slice(0, 24) + " ");
				console.log(timeline[tweet].text);
				console.log("\n");
			}
			//append all of this information to the txt file 
			fs.appendFile('log.txt', "Tweet #: " + (parseInt(tweet) + 1) + "\n"+ timeline[tweet].text + "\n",genericCallback);
		}
		function genericCallback(err) {
			if (err) throw err;
		};

	})

}

//spotify function

function mySpotify(userSelection) {
	//this starts the search within spotify for the track and the query based on the userselection set in the if/else statement above.  if there is an error it throws the error and continues getting the information.  
	var spotify = new Spotify({
		id: spotifyKeys.id,
		secret: spotifyKeys.secret
	});

	spotify.search({
		type: 'track',
		query: userSelection,
		limit: 1
	}, function (err, data) {
		if (err) {
			console.error('Something went wrong', err.message);
			return;
		}

		// if (err) throw err;
		//this sets the variable music to get the initial information from the object, just so it's easier to call in the for loop below
		var music = data.tracks.items;
		//this loops through the object that we get from spotify and then loops through each objects information to get what we need from spotify
		for (var i = 0; i < music.length; i++) {
			for (j = 0; j < music[i].artists.length; j++) {
				console.log(colors.green("Artist: ") + music[i].artists[j].name);
				console.log(colors.green("Song Name: ") + music[i].name);
				console.log(colors.green("Preview Link of the song from Spotify: ") + music[i].preview_url);
				console.log(colors.green("Album Name: ") + music[i].album.name + "\n");
				//this appends the data we receive from the spotify API to the log.txt file
				fs.appendFile('log.txt', "\n" + "Artist: " + music[i].artists[j].name + "\n" + "Song Name: " + music[i].name + "\n" + "Preview Link of the song from Spotify: " + music[i].preview_url + "\n" + "Album Name: " + music[i].album.name + "\n", genericCallback);
			}
		}

		function genericCallback(err) {
			if (err) throw err;
		};

	});
}

//movie omdb


function myMovies(movietitle) {
	//use request to access the omdb api and input the movietitle variable that is defined above as the movie we are searching for
	request('http://www.omdbapi.com/?t=' + movietitle + '&y=&plot=short&tomatoes=true&r=json&apikey=40e9cece', function (error, response, body) {
		if (error) throw error;
		//JSON.parse the body of the result and store it in the variable json for easier access
		json = JSON.parse(body);
		//console.log each of the different things we need to get from the omdb api and add a title for each item and use the colors npm to make the title name a different color than the result for better user access
		console.log(colors.green('Title: ') + json.Title);
		console.log(colors.green('Year: ') + json.Year);
		console.log(colors.green('imdbRating: ') + json.imdbRating);
		console.log(colors.green('Country: ') + json.Country);
		console.log(colors.green('Language: ') + json.Language);
		console.log(colors.green('Actors: ') + json.Actors);
		console.log(colors.green('Plot: ') + json.Plot);
		console.log(colors.red('Rotten Tomatoes URL: ') + json.tomatoURL);

		//append the results to the log.txt file
		fs.appendFile("log.txt", "\n" + "Title: " + json.Title + "\n" + "Year: " + json.Year + "\n" + "imdbRating: " + json.imdbRating + "\n" + "Country: " + json.Country + "\n" + "Language: " + json.Language + "\n" + "Actors: " + json.Actors + "\n" + "Plot: " + json.Plot + "\n" + "Rotten Tomatoes URL: " + json.tomatoURL + "\n", genericCallback);
	});

	function genericCallback(err) {
		if (err) throw err;
	};

};


//final option aka surprise
var lastOption = function (last) {
	//reads the information from the random.txt file to get the information needed for this function
	fs.readFile('random.txt', 'utf-8', function (err, data) {
		//split the data by the comma so you can access the first part which is which type of search we are doing and the second part which is the userSelection of what we are looking up
		var things = data.split(',');
		//pass this information into the spotify function and run the userSelection through to get the results.  this will automatically console.log the info and then append the info into the txt file
		if (things[0] === songs) {
			userSelection = things[1];
			mySpotify(userSelection);
		}
	})
}