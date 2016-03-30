var vdbApp = angular.module('vdbApp', ['ngRoute']);

vdbApp.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'map.html'
		
	})

	.when('/city/Leiden', {
		templateUrl: 'login.html',
		// controller: 'cityCtrl'
	})
	
	.when('/mention', {
		templateUrl: 'mention.html',
		
	})

    .when('/myissues', {
		templateUrl: 'myissues.html'
		
	})
    
    .when('/login', {
		templateUrl: 'login.html'
		
	})
    
    .when('/register', {
		templateUrl: 'register.html'
		
	})
    
    
	
	 $locationProvider.html5Mode(true);
}]);



function getLocation(map) {
            
            // get the data from center of map
               google.maps.event.addListener(map, 'dragend', function (e) {
               geocoder = new google.maps.Geocoder();
               geocoder.geocode({'latLng': map.getCenter()} , function (result , status){
                if (status == google.maps.GeocoderStatus.OK){

                for (var i=0; i<result[0].address_components.length; i++) {
                for (var b=0;b<result[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                   // name of city
                    city= result[0].address_components[i];
                    break;
                        }
                    }
                }
                     console.log(city.long_name);
                     // var url = document.location.href+'city/'+city.long_name; 
                     // window.location = url;
                    }
                

               });

            });

        }