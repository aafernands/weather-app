function init() {
	var $temp = $("#temperature");
	var $humd = $("#humidity");
	var $wind = $("#wind-speed");
	var $feels = $("#feels-like");
	var $CityName = $("#city-name");
	var $forcastList = $("#forcast-list");
	var currentDate = moment().format("MM/DD/YYYY");
	// var apiKey = "dc8a1a80fcf0deb6a1fe694830d0507a";
	// var apiKey = "54fde0117f020fcb0b735dc6ca121412";
	var apiKey = "37b522b3c25de2e7e8e30739dd835d39";

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
		// $uv.html('UV Index: <span class="uv">' + ui + '</span>');
		$CityName.html(
			cityName +
				" (" +
				currentDate +
				") " +
				'<img src="http://openweathermap.org/img/wn/' +
				response.weather[0].icon +
				'@2x.png"/>'
		);

		// api to get the UV
		// getUV(response.coord.lat, response.coord.lon)
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
		}).then(handleSearchResult);
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

	function getUV(lat, lon) {
		// https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}
	}

	function handleForcastResult(response) {
		console.log("forcast result", response);

		var forcastBox = "";
		response.list.forEach(function (forcast) {
			if (forcast.dt_txt.indexOf("00:00:00") !== -1) {
				forcastBox +=
					"<div class='forcast'>" +
					moment(forcast.dt_txt).format("MM/DD/YYYY") +
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

	function attacheClearHistoryevent() {
		// clear data in local storage/
		// clear the history list
	}

	function loadRecentHistory() {
		// get data out of the local storage
		// append to the history list
	}

	function attachSearchEvent() {
		var $historyList = $("#history");

		$("#search-button").on("click", function (event) {
			var cityName = $("#city-input").val();
			$historyList.append("<li>" + cityName + "</li>");

			// update local storage history

			getCurrentWeather(cityName);
			get5DayForcast(cityName);
		});
	}

	// load recent history

	attachSearchEvent();
	// attacheClearHistoryevent();
}

$(init);
