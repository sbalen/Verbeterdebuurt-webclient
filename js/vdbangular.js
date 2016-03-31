var vdbApp = angular.module('vdbApp', ['ngRoute']);


vdbApp.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'map.html'
		
	})
	.when('/city', {
		templateUrl: 'map.html',
		controller: 'cityCtrl'
	})
	.when('/city:id', {
		templateUrl: 'map.html',
		controller: 'cityCtrl'
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
vdbApp.controller('cityCtrl', ['$scope','$window','$location','$routeParams', function ($scope,$window,$location,$routeParams) {
					$scope.city = city.long_name;
					$scope.alrCity = function(){
					//console.log(city.long_name);
					if(city.long_name != null){
						$scope.id = city.long_name;
						$location.path("city/").search(city.long_name);
						//$routeParams.id = $scope.city;

					}
					}
					}]);



