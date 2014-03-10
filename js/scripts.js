var movieApp = {};

movieApp.api_key = "52f9d260df3456e267b10b5b7a4645eb";

movieApp.init = function(){
	movieApp.grabConfig();

	movieApp.getSessionId();

	movieApp.genres();

	//listen for a click on our star ratings
	$('body').on('change','input[type = radio]', function(){
		var rating = $(this).val();
		var movieId = $(this).attr('id').split('-')[0].replace('movie','');
		movieApp.ratingHandler(rating, movieId);
		$('.modalDialog').addClass('visible');
	});

	$('body').on('change', 'select', function(){
		var selectedGenre = $(this).val();
		var genreName = $(this).find(':selected').text();
		$('h2').text(genreName + " Movies");
		movieApp.grabTopRated(selectedGenre);

	});//end selected



};//end movie app.init

movieApp.genres = function() {
	var genreList = "http://api.themoviedb.org/3/genre/list";
	$.ajax(genreList, {
		type : 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key
			},
			success : function(data) {
			console.log(data.genres);
			for (var i = 0; i < data.genres.length; i++) {
			$('<option>').attr('value',data.genres[i].id).text(data.genres[i].name).appendTo('select');
			
			};
		}
	}); // end genres
};

// this funciton will go to the movie db api and get all the config data that we require.
// When it finished, it will put the data it gets onto movieApp.config
movieApp.grabConfig = function(){
	var configUrl = "http://api.themoviedb.org/3/configuration";

	$.ajax(configUrl, {
		type : 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key
		},
		success : function(config){
			movieApp.config = config;
			movieApp.grabTopRated();//Call the next thing to do
		}
	});//end config ajax
};//end of grabConfig function


movieApp.grabTopRated = function(selectedGenre){
	var topRatedURL = 'http://api.themoviedb.org/3/genre/' + selectedGenre + '/movies';
	$.ajax(topRatedURL,{
		type: 'GET',
		dataType : 'jsonp',
		data : {
			api_key : movieApp.api_key,
			page : 5
		},
		success : function(data){
		// console.log(data);
			// run the displayMovies method to put them on the page
			movieApp.displayMovies(data.results);
		}
	}); // end top-rated ajax
};

movieApp.displayMovies = function(movies){
	$('.allMovies').empty();
	for (var i = 0; i < movies.length; i++) {
		var image = $('<img>').attr('src', movieApp.config.images.base_url + 'w500' + movies[i].poster_path);
		var title = $('<h3>').text(movies[i].title);

		//grab the one existing rating field 
		var rating = $('fieldset.rateMovie')[0].outerHTML;
		rating = rating.replace(/star/g,'movie'+movies[i].id+'-star');
		rating = rating.replace(/rating/g, 'rating-' +movies[i].id);

		var movieWrap = $('<div>').addClass('movie');

		//Call the movieWrap function and pass it the variables 
		movieWrap.append(image,title,rating);
		
		$('.allMovies').append(movieWrap);
	};
}

movieApp.ratingHandler = function(rating,movieId){
	//movie rating post ajax request
	$.ajax('http://api.themoviedb.org/3/movie/' + movieId + '/rating', {
		type : 'POST',
		data: {
			api_key : movieApp.api_key,
			guest_session_id : movieApp.session_id,
			value : rating * 2
		},
		success : function(response){


			$('a.close').on('click', function(){
				$('.modalDialog').removeClass('visible');
			});
		}		
	});
};

movieApp.getSessionId = function(){
	$.ajax('http://api.themoviedb.org/3/authentication/guest_session/new', {
		data : {
			api_key : movieApp.api_key
		},
		type : 'GET',
		dataType : 'jsonp',
		success : function(session){

			//store the session id for later use
			movieApp.session_id = session.guest_session_id;
			// console.log(session);
		}
	});
};//end of getSessionId function


//Load the "select another genre box"
var startY = 450;

$(window).scroll(function(){
    checkY();
});

function checkY(){
    if( $(window).scrollTop() > startY ){
        $('.top').slideDown();
    }else{
        $('.top').slideUp();
    }
}
checkY();// Do this on load just in case the user starts half way down the page



//document ready
$(function(){
	movieApp.init();

	//smoothscroll
				$('a.top').smoothScroll({
					offset: -80,
				});//end of smoothscroll

});//end doc ready