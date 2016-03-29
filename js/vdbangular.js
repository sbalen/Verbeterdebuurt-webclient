var vdbApp = angular.module('vdbApp', ['ngRoute']);

vdbApp.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider

	.when('/home.html', {
		templateUrl: 'homes.html'
		
	})
	.when('/home', {
		templateUrl: 'homes.html'
		
	})
	.when('/mention', {
		templateUrl: 'mention.html',
		
	})
	
	 $locationProvider.html5Mode(true);
}])
