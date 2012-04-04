// Can be used to grab a random item from any array.
Array.prototype.randomItem = function ()
{
	var len = this.length;
	var randIndex = Math.floor(len * Math.random());
	return this[randIndex];
};

var Utilities = function () { };

Utilities.fn = Utilities.prototype;

// the initialize method accepts API keys in order they are:
// Bing Search API Key
// Last.FM API Key
// Netlfix Search API Key
Utilities.fn.Initialize = function (BingAPIKey, LastFMAPIKey, NetflixAPIKey)
{
	this.SetAPIKeys(BingAPIKey, LastFMAPIKey, NetflixAPIKey);

	this.BingRequestURL = "http://api.bing.net/json.aspx";
	this.YouTubeRequestURL = "http://gdata.youtube.com/feeds/api/videos";
	this.iTunesSearchURL = "http://itunes.apple.com/search";
	this.LastFMSearchURL = "http://ws.audioscrobbler.com/2.0/";
	this.IMDBAPIURL = "http://www.imdbapi.com/";
	this.TwitterSearchAPIURL = "http://search.twitter.com/search.json";
	this.NetflixSearchAPIURL = "http://api.netflix.com/catalog/titles/autocomplete";
	this.MadLibAPIURL = "http://dev.markitondemand.com/Meetup/MadLib/GetMadLib";
	this.MadLibDictionaryAPIURL = "http://dev.markitondemand.com/Meetup/MadLib/GetMadLibWords";

	this.SetupMadLib(true);
};

Utilities.fn.SetAPIKeys = function (BingAPIKey, LastFMAPIKey, NetflixAPIKey)
{
	this.BingAppID = BingAPIKey || "";
	this.LastFMAPIKey = LastFMAPIKey || "";
	this.NetflixAPIKey = NetflixAPIKey || "";
};

Utilities.fn.GetMadLibHTML = function ()
{
	var context = this;

	$.ajax({
		type: "POST",
		dataType: "JSONP",
		url: context.MadLibAPIURL,
		success: function (Response)
		{
			madLibEngine.templateHTML = Response.MadLib;
			context.SetupMadLib(false);
		},
		error: function ()
		{
			Alert("Failed to get MadLib.");
		}
	});
};

Utilities.fn.GetMadLibDictionary = function ()
{
	var context = this;

	$.ajax({
		type: "POST",
		dataType: "JSONP",
		url: context.MadLibDictionaryAPIURL,
		success: function (Response)
		{
			madLibEngine.wordCollection = Response.MadLibWords;
			context.SetupMadLib(false);
		},
		error: function ()
		{
			Alert("Failed to get MadLib.");
		}
	});
};

Utilities.fn.FireJSONPRequestsToSetupMadLib = function ()
{
	this.GetMadLibHTML();
	this.GetMadLibDictionary();
};

Utilities.fn.IsMadLibIsReadyToBeSetup = function ()
{
	var bReturn = false;

	if (madLibEngine.templateHTML && madLibEngine.templateHTML != "" && typeof (madLibEngine.templateHTML) == "string")
	{
		bReturn = true;
	}
	else
	{
		return false;
	}

	var itemCount = 0;

	if (madLibEngine.wordCollection)
	{
		for (var key in madLibEngine.wordCollection)
		{
			if (itemCount > 0)
			{
				break;
			}

			itemCount++;
		}

		if (itemCount > 0 && bReturn)
		{
			return true;
		}
		else
		{
			bReturn = false;
		}
	}
	else
	{
		bReturn = false;
	}

	return bReturn;
};

Utilities.fn.SetupMadLib = function (AllowJSONPRequests)
{
	var readyToSetup = this.IsMadLibIsReadyToBeSetup();

	// we don't want to initialize the MadLib until it is 100% ready.
	if (!readyToSetup && AllowJSONPRequests)
	{
		this.FireJSONPRequestsToSetupMadLib();
		return;
	}
	else if (!readyToSetup)
	{
		return;
	}

	this.SetupMadLibOverrides();

	// kick this off to setup the word collection
	madLibEngine.setupWordCollection();

	madLibEngine.addAndFillTemplate();
};

Utilities.fn.SetupMadLibOverrides = function ()
{
	var context = this;

	madLibEngine.preFillHandler = function (element, currentWord, wordCategory)
	{
		return context.HandleWordPreFill(element, currentWord, wordCategory);
	};

	// the post fil isn't going to do anything since we are using API calls.
	madLibEngine.postFillHandler = function (element)
	{
		return context.HandleWordPostFill(element);
	};
};

// this is where you handle what happens after the word fills.
// called immediately after prefill.
Utilities.fn.HandleWordPostFill = function (Element)
{
	setTimeout(function(){madLibEngine.fillNextWord()}, 1000);
};
	
// this is where you will choose what types of prefill searches you'd like to do.
Utilities.fn.HandleWordPreFill = function (Element, CurrentWord, WordCategory)
{
	var context = this;

	if (CurrentWord)
	{
		// below are sample API calls that you can use. You will need to specify your own success and error function,
		// but we have gone ahead and gotten the API calls plugged in for you ahead of time.

		// this.BingImageSearch(Element, CurrentWord, context.BingImageSearchCompleted, function () { madLibEngine.fillNextWord(); });
		// this.YouTubeVideoSearch(Element, CurrentWord, context.YouTubeVideoSearchCompleted, function () { madLibEngine.fillNextWord(); });
		// this.iTunesSeachAPI(Element, CurrentWord, function(Element, CurrentWord, Response){console.log(arguments); madLibEngine.fillNextWord();}, function(){ madLibEngine.fillNextWord(); });
		// this.IMDBSearchAPI(Element, CurrentWord, function(Element, CurrentWord, Response){console.log(arguments); madLibEngine.fillNextWord();}, function(){ madLibEngine.fillNextWord(); });
		// this.TwitterSearch(Element, CurrentWord, context.TwitterSearchCompleted, function(){ madLibEngine.fillNextWord(); });
		// this.NetflixSearchAPI(Element, CurrentWord, functionElement, CurrentWord, Response(){console.log(arguments); madLibEngine.fillNextWord();}, function(){ madLibEngine.fillNextWord(); });
		// this.LastFMAPISearch(Element, CurrentWord, function (Element, CurrentWord, Response) { console.log(arguments); madLibEngine.fillNextWord(); }, function () { madLibEngine.fillNextWord(); });
	}
	else
	{
		return true;
	}

	// return true to just add the word as text.
	// WARNING: if using a preprocess search API make sure you return false in this method.
	// return false so it doesn't just automatically add the word and not do preprocessing.
	// this means it will not do anything to the span so you will need to handle the replacement yourself.
	return false;
};

Utilities.fn.BingImageSearch = function (Element, CurrentWord, Callback, ErrorCallback)
{
	if (!this.BingAppID || this.BingAppID == "")
	{
		throw ("You cannot use the Bing Image Search API without setting the API Key. Please check Util.BingAppID and try again.");
	}

	var context = this;

	var apiData = {
		"AppId": this.BingAppID,
		"Query": CurrentWord,
		"Sources": "Image",
		"Version": "2.0",
		"Market": "en-us",
		"Adult": "Moderate",
		"Image.Count": 10,
		"Image.Offset": 0,
		"Image.Filters": "Size:Small",
		"JsonType": "callback"		
	};

	$.ajax({
		url: context.BingRequestURL + "?jsonCallback=?", // the bing api uses this weird jsonCallback with question mark
		dataType: "jsonp",
		type: "POST",
		data: apiData,
		success: function (Response)
		{
			Callback(Element, CurrentWord, Response);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.YouTubeVideoSearch = function (Element, CurrentWord, Callback, ErrorCallback)
{
	var context = this;	

	var ajaxData = {
		"vq": CurrentWord,
		"max-results": 10,
		"alt": "json-in-script"
	};

	$.ajax({
		url: context.YouTubeRequestURL,
		dataType: "jsonp",
		type: "POST",
		data: ajaxData,
		success: function (Response)
		{
			Callback(Element, CurrentWord, Response);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.iTunesSeachAPI = function (Element, CurrentWord, Callback, ErrorCallback)
{
	var context = this;

	$.ajax({
		type: "GET",
		dataType: "JSONP",
		url: context.iTunesSearchURL,
		data: "explicit=No&term=" + CurrentWord,
		success: function (Response)
		{
			Callback(Element, CurrentWord, Response);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.IMDBSearchAPI = function (Element, CurrentWord, Callback, ErrorCallback)
{
	var context = this;

	$.ajax({
		type: "GET",
		dataType: "JSONP",
		url: context.IMDBAPIURL,
		data: { "t": CurrentWord },
		success: function (Response)
		{
			Callback(Element, CurrentWord, [Response]);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.TwitterSearch = function (Element, CurrentWord, Callback, ErrorCallback)
{
	var context = this;

	$.ajax({
		type: "GET",
		dataType: "JSONP",
		url: context.TwitterSearchAPIURL,
		data: { "q": CurrentWord },
		success: function (Response)
		{
			Response = context.TwitterFilterResponse(Response);

			Callback(Element, CurrentWord, Response);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.TwitterFilterResponse = function (Response)
{
	try
	{
		// regex for cleanup
		var repl = /(((?:)@\w+))|(((?:)#\w+))|(((?:)http\w+))/gim;

		for (var i in Response.results)
		{
			Response.results[i].text = Response.results[i].text.replace(repl, " ");
		}
	}
	catch(error)
	{
	
	}
	
	return Response;
};

Utilities.fn.LastFMAPISearch = function (Element, CurrentWord, Callback, ErrorCallback)
{
	if (!this.LastFMAPIKey || this.LastFMAPIKey == "")
	{
		throw ("You cannot use the Last.FM Track Search API without setting the API Key. Please check Util.LastFMAPIKey and try again.");
	}

	var context = this;

	$.ajax({
		type: "POST",
		dataType: "JSONP",
		url: context.LastFMSearchURL,
		data: { method: "track.search", format: "json", api_key: context.LastFMAPIKey, track: CurrentWord },
		success: function (Response)
		{
			Callback(Element, CurrentWord, Response);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

Utilities.fn.NetflixSearchAPI = function (Element, CurrentWord, Callback, ErrorCallback)
{
	if (!this.NetflixAPIKey || this.NetflixAPIKey == "")
	{
		throw ("You cannot use the Netflix Search API without setting the API Key. Please check Util.NetflixAPIKey and try again.");
	}

	var context = this;

	$.ajax({
		type: "GET",
		dataType: "XML",
		url: this.NetflixSearchAPIURL,
		data: { "oauth_consumer_key": context.NetflixAPIKey, "term": CurrentWord },
		success: function (xml)
		{
			var jTitles = $(xml).find("title");
			var arTitles = [];

			jTitles.each(function ()
			{
				arTitles.push($(this).attr("short"));
			});

			Callback(Element, CurrentWord, arTitles);
		},
		error: function ()
		{
			ErrorCallback(Element, CurrentWord);
		}
	});
};

/*
	Search Complete Examples
*/

Utilities.fn.BingImageSearchCompleted = function (Element, CurrentWord, Response)
{	
	$(Element).html(CurrentWord);

	var Image = Response.SearchResponse.Image.Results.randomItem();

	$(Element).html("<img title='" + Image.Title + "' src='" + Image.MediaUrl + "' />");	
};

Utilities.fn.YouTubeVideoSearchCompleted = function (Element, CurrentWord, Response)
{
	$(Element).html(CurrentWord);

	var videoID = Response.feed.entry.randomItem().id.$t;

	var arID = videoID.split("/");

	var cleanID = arID[(arID.length - 1)];

	$(Element).html('<object width="100" height="100">\
	<param name="movie" value="http://www.youtube.com/v/' + cleanID + '&hl=en&fs=1"></param>\
	<param name="allowFullScreen" value="true"></param>\
	<embed src="http://www.youtube.com/v/' + cleanID + '&hl=en&fs=1" type="application/x-shockwave-flash"\
	allowfullscreen="true" width="100" height="100"></embed>\
	</object>');
};

Utilities.fn.TwitterSearchCompleted = function(Element, CurrentWord, Response)
{
	$(Element).html(CurrentWord);
	
	try
	{
		var tweet = Response.results.randomItem();

		$(Element).html(tweet.text);
	}
	catch(e)
	{
	
	}
};

var Util = new Utilities();