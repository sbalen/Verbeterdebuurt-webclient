var vdbApp = angular.module('vdbApp', ['ngRoute'])
var APIURL = "http://staging.​verbeterdebuurt.nl/api.php/json_1_2/";

var issuesService = new Object();

//change menu selected
function menuSelected($scope,selected){
	$scope.homeSelected = "";
	$scope.mentionSelected = "";
	$scope.myIssuesSelected = "";

	switch(selected) {
		case 'home':
			$scope.homeSelected = "active"
			break;
		case 'mention':
			$scope.mentionSelected = "active"
			break;
		case 'myIssues':
			$scope.myIssuesSelected = "active"
			break;
	}
};

vdbApp.config(['$routeProvider','$locationProvider','$httpProvider', function ($routeProvider,$locationProvider,$httpProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'map.html',
		controller: 'mainCtrl'
		
	})
	.when('/city', {
		templateUrl: 'map.html',
		controller: 'cityCtrl'
	})
	.when('/city/:id', {
		templateUrl: 'map.html',
		controller: 'cityCtrl'
	})
	
	.when('/mention', {
		templateUrl: 'mention.html',
		controller : 'mentionCtrl'
	})

    .when('/myissues', {
		templateUrl: 'myissues.html',
		controller : 'myIssuesCtrl'	
	})
    
    .when('/login', {
		templateUrl: 'login.html'
		
	})
    
    .when('/register', {
		templateUrl: 'register.html'
		
	})
    
    
	
	 $locationProvider.html5Mode(true);
	 
}]);
// Service
vdbApp.factory('issuesService', ['$http',function ($http) {
			
			var message;
			issuesService.data = {};

			 issuesService.getIssues = function( jsondata ){
				 $http.post(APIURL+'issues',jsondata)
						.success(function(data){
							issuesService.data.message = data;
							console.log(issuesService.data.message);
						})
						.error(function(data){
							alert("error");
						});
						return issuesService.data;


		 }
		return issuesService;

}]);


vdbApp.controller('cityCtrl', ['$scope','$window','$location','$rootScope','$routeParams','$http','issuesService', function ($scope,$window,$location,$rootScope,$routeParams,$http,issuesService) {
					if($routeParams.id) {
						// alert($routeParams.id);
						}
					$scope.alrCity = function(){
						if(city.long_name != null){
							// console.log("controller:"+city.long_name);
							$location.path("city/"+city.long_name)
							var jsondata = JSON.stringify({"council" : ""+$routeParams.id+""});
							issuesService.getIssues(jsondata);
						}		
					}
					}]);
//Retrieving issues




// vdbApp.controller('mainCtrl', ['$scope','issues', function ($scope,issues) {

// }]);
vdbApp.controller('mainCtrl', ['$scope','$rootScope', function ($scope,$rootScope) {
	menuSelected($rootScope,'home');
}])
vdbApp.controller('mentionCtrl', ['$scope','$rootScope', function ($scope,$rootScope) {
	menuSelected($rootScope,'mention');
}])
vdbApp.controller('myIssuesCtrl', ['$scope','$rootScope', function ($scope,$rootScope) {
	menuSelected($rootScope,'myIssues');
}])