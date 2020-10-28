function init() {
	var cityHistory = []; // store city search

	// jquery dom element link to the html
	var $temp = $("#temperature");
	var $humd = $("#humidity");
	var $wind = $("#wind-speed");
	var $feels = $("#feels-like");
	var $CityName = $("#city-name");
	var $forcastList = $("#forcast-list");
	var $historyList = $("#history");
	var $welcome = $(".welcomeContainer");
	var $errorMessage = $("#errorMessage");
	var $todayForecastContainer = $("#todayForecastContainer");
	var $historybox = $("#historybox");
	var $uvIndex = $("#index-uv");
	var $digitalClock = $("#DigitalCLOCK");
	var $greeting = $("#greeting");

	// open weather api key
	var apiKey = "dc8a1a80fcf0deb6a1fe694830d0507a";

	function handleSearchResult(response) {
		console.log(response);
		var temp = response.main.temp;
		var humidity = response.main.humidity;
		var speed = response.wind.speed;
		var feelsLike = response.main.feels_like;
		var cityName = response.name;
		var unixTime = response.dt * 1000;
		console.log("unix time", unixTime);
		$temp.html(Math.round(temp) + "<span class='temp'>&#8457; </span>");
		$humd.text("Humidity: " + humidity + "%");
		$wind.text("Speed Limit: " + speed + " mph");
		$feels.html("Feels like: " + Math.round(feelsLike) + " &#8457;");
		//$uvIndex.html('UV Index: <span class="uv">' + response.value + "</span>");

		$CityName.html(
			"<span class='messageCity'>Today's Forecast for </span>" +
				cityName +
				'<img class= "imgHeader" src="http://openweathermap.org/img/wn/' +
				response.weather[0].icon +
				'@2x.png"/>'
		);

		// api to get the UV and update the UI
		getUV(response.coord.lat, response.coord.lon, function (response) {
			$uvIndex.html('UV Index: <span id="uv">' + response.value + "</span>");

			console.log(response.value);
			if (response.value < 3) {
				//low
				$("#uv").addClass("uvLow");
			} else if (response.value > 2 || response.value < 6) {
				//moderate
				$("#uv").addClass("uvModerate");
			} else if (response.value === 6 || response.value === 7) {
				//high
				$("#uv").addClass("uvHigh");
			} else if (response.value > 7 || response.value < 11) {
				//very high
				$("#uv").addClass("uvVeryHigh");
			} else {
				//extreme
				$("#uv").addClass("uvExtremelyHigh");
			}
		});
	}

	function handleErrorResult(response) {
		console.log("here", response);
		$errorMessage.show();
		$errorMessage.text("Couldn't finding city please try again");
		$todayForecastContainer.hide();
		$historybox.hide();
	}

	function getCurrentWeather(cityName) {
		var queryURL =
			"https://api.openweathermap.org/data/2.5/weather?q=" +
			cityName +
			"&appid=" +
			apiKey +
			"&units=imperial";

		$.ajax({
			url: queryURL,
			method: "GET",
		}).then(handleSearchResult, handleErrorResult);
	}

	function get5DayForcast(cityName) {
		var url =
			"https://api.openweathermap.org/data/2.5/forecast?q=" +
			cityName +
			"&units=imperial&appid=" +
			apiKey;

		$.ajax({
			url: url,
			method: "GET",
		}).then(handleForcastResult);
	}

	function getUV(lat, lon, handleUVResult) {
		var url =
			"https://api.openweathermap.org/data/2.5/uvi?lat=" +
			lat +
			"&lon=" +
			lon +
			"&appid=" +
			apiKey;

		$.ajax({
			url: url,
			method: "GET",
		}).then(handleUVResult);
	}

	function handleForcastResult(response) {
		console.log("forecast result", response);

		var forcastBox = "";
		response.list.forEach(function (forcast) {
			if (forcast.dt_txt.indexOf("00:00:00") !== -1) {
				forcastBox +=
					"<div class='forcast'>" +
					forcast.dt_txt.split(' ')[0].replaceAll('-', '/') +
					" <br/><img src='http://openweathermap.org/img/wn/" +
					forcast.weather[0].icon +
					"@2x.png'/>" +
					"<br>" +
					"Temp: " +
					forcast.main.temp +
					"&#8457;" +
					"<br>" +
					"Humidity: " +
					forcast.main.humidity +
					"%" +
					"</div>";
			}
		});

		$forcastList.html(forcastBox);
	}

	function loadRecentHistory() {
		// get data out of the local storage and set cityHistory
		var storage = localStorage.getItem("cityHistory");

		if (storage) {
			cityHistory = JSON.parse(storage);
			getCityWeater(cityHistory[cityHistory.length - 1]);

			var cityHtml = "";
			cityHistory.forEach(function (city) {
				cityHtml += "<li>" + city + "</li>";
			});
			$historyList.html(cityHtml);

			$historybox.show();
		}
	}

	function getCityWeater(cityName) {
		$errorMessage.hide();
		$welcome.empty();
		$todayForecastContainer.show();

		$welcome.hide();
		$forcastList.show();
		getCurrentWeather(cityName);
		get5DayForcast(cityName);
	}

	function attachEvent() {
		$("#clear-history").on("click", function (event) {
			// clear local storage
			localStorage.clear("cityHistory");
			// update the UI city list
			$historyList.empty();
			cityHistory = [];
			$historybox.hide();
			$errorMessage.hide();
		});

		$historyList.on("click", "li", function (event) {
			getCityWeater($(this).text());
		});

		$("#search-button").on("click", function (event) {
			// remove welcome message
			var cityName = $("#city-input").val().toLowerCase();

			console.log("what is cityName", cityName);

			if (cityName === "") {
				$errorMessage.show();
				$errorMessage.text("Couldn't finding city please try again");
				$welcome.hide();
				$todayForecastContainer.hide();
				return;
			}

			// check if city is in history
			if (cityHistory.indexOf(cityName) === -1) {
				$historyList.append("<li>" + cityName + "</li>");
				cityHistory.push(cityName);
			}
			// save city to local storage
			localStorage.setItem("cityHistory", JSON.stringify(cityHistory));

			if (cityHistory.length > 0) {
				// has history
				$historybox.show();
			}

			getCityWeater(cityName);
		});
	}

	function getGreeting(hourNow, session) {
		if (session === "AM") {
			return "Good morning";
		} else {
			if (hourNow > 12 || hourNow < 7) {
				return "Good afternoon";
			}
			return "Good Evening";
		}
	}

	function updateTime() {
		var currentTime = moment();
		var greeting = getGreeting(
			currentTime.format("hh"),
			currentTime.format("A")
		);

		// update the html view
		$digitalClock.text(currentTime.format("hh:mm:ss A"));
		$greeting.text(greeting);
	}



	$(document).ready(function() {
		$.ajax({
			url: "https://api.nasa.gov/planetary/apod?api_key=gYo6aP2v2kURjJFrRdzO4eOvx79sGG3ngPwy2USO"
		}).then(function(data) {
			console.log(data.hdurl);
			$('#img').append('<img src="' + data.hdurl + '">');
			console.log(data.hdurl);
		});
	});



	
	// load greeting and moment clock
	setInterval(updateTime, 1000);

	// load recent history
	loadRecentHistory();

	// attacheClearHistoryevent();
	attachEvent();






}
$(init);
