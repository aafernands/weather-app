function init() {
	var currentDate = moment().format("MM/DD/YYYY");
	var apiKey = "dc8a1a80fcf0deb6a1fe694830d0507a";
		var lat = response.city.coord.lat;
		var lon = response.city.coord.lon;	

	var $temp = $("#temperature");
	var $humd = $("#humidity");
	var $wind = $("#wind-speed");
	var $feels = $("#feels-like");
	var $CityName = $("#city-name");
	var $forcastList = $("#forcast-list");
	var $indexUV = $("#index-uv");

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
		$CityName.html(
			"Today's Forecast for " +
				cityName +
				" (" +
				currentDate +
				") " +
				'<img src="http://openweathermap.org/img/wn/' +
				response.weather[0].icon +
				'@2x.png"/>'
		);

		$indexUV.html(
			'UV Index: <span class="uv">' + lat + "&lon=" + lon + "</span>"
		);
	}







	function getUV(lat, lon) {
	
		var lat = response.city.coord.lat;
		var lon = response.city.coord.lon;	
	
		var indexUV = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
	
		$.ajax({
			url: indexUV,
			method: "GET",
		}).then(function (res) {
			var uvI = res.value;
			$(".uvIndex").text("UV Index: " + uvI);
		});

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
			getUV(cityName);
		});
	}

	// load recent history

	attachSearchEvent();
	// attacheClearHistoryevent();
}

$(init);
