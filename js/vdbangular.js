var vdbApp = angular.module('vdbApp', ['ngRoute']);

vdbApp.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'map.html'
		
	})
	
	.when('/mention', {
		templateUrl: 'mention.html',
		
	})
    
    .when('/myissues', {
		templateUrl: 'myissues.html'
		
	})
	
	 $locationProvider.html5Mode(true);
}])
