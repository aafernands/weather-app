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
	var $welcome = $("#welcome");
	var $message = $("#message");
	var $result = $("#result");
	var $historybox = $("#historybox");
	var $uvIndex = $("#index-uv");

	// open weather api key
	var apiKey = "dc8a1a80fcf0deb6a1fe694830d0507a";

	// =====================================================
	function handleSearchResult(response) {
		console.log(response);
		var temp = response.main.temp;
		var humidity = response.main.humidity;
		var speed = response.wind.speed;
		var feelsLike = response.main.feels_like;
		var cityName = response.name;

		$temp.html("Temperature: " + temp + " &#8457;");
		$humd.text("Humidity: " + humidity + "%");
		$wind.text("Speed Limit: " + speed + " MPH");
		$feels.html("Feels like: " + feelsLike + " &#8457;");

		var unixTime = response.dt * 1000;

		$CityName.html(
			"Today's Forecast for " +
				cityName +
				" (" +
				new Date(unixTime).toLocaleDateString() +
				") " +
				'<img src="http://openweathermap.org/img/wn/' +
				response.weather[0].icon +
				'@2x.png"/>'
		);

		// api to get the UV and update the UI
		getUV(response.coord.lat, response.coord.lon, function (response) {
			$uvIndex.html('UV Index: <span class="uv">' + response.value + "</span>");
		});
	}

	function handleErrorResult(response) {
		console.log("here", response);
		$message.show();
		$message.text("Error finding city");
		$result.hide();
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
					new Date(forcast.dt_txt).toLocaleDateString() +
					" <br/><img src='http://openweathermap.org/img/wn/" +
					forcast.weather[0].icon +
					"@2x.png'/>" +
					"<br>" +
					"Temp: " +
					forcast.main.temp +
					" &#8457;" +
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

			var cityHtml = "";
			cityHistory.forEach(function (city) {
				cityHtml += "<li>" + city + "</li>";
			});
			$historyList.html(cityHtml);

			$historybox.show();
		}
	}

	function getCityWeater(cityName) {
		$message.hide();
		$welcome.empty();
		$result.show();
		$welcome.hide();

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
		});

		$historyList.on("click", "li", function (event) {
			getCityWeater($(this).text());
		});

		$("#search-button").on("click", function (event) {
			// remove welcome message
			var cityName = $("#city-input").val().toLowerCase();

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

	// load recent history
	loadRecentHistory();

	attachEvent();
	// attacheClearHistoryevent();
}

$(init);
