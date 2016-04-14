var vdbApp = angular.module('vdbApp', ['ngRoute'])
var APIURL = "http://staging.​verbeterdebuurt.nl/api.php/json_1_3/";

var issuesService = new Object();
var registerService = new Object();
var loginService  = new Object();
var reportService = new Object();
var loginService = new Object();

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

vdbApp.config(['$routeProvider','$locationProvider','$httpProvider','$sceDelegateProvider', function ($routeProvider,$locationProvider,$httpProvider,$sceDelegateProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'map.html',
		controller: 'cityCtrl'
		
	})
	.when('/city/:cityName', {
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
	 $sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self'
	]);
}]);


vdbApp.factory('issuesService', ['$http',function ($http) {
			return {
				getIssues : function( jsondata){
					return $http.post(APIURL+'issues',jsondata)
					.success(function(data){
						if(angular.isObject(data)){
						issuesService.data = data;
						return issuesService.data;
						}	
												
					});
					return issuesService.data;					
				}

			}

}]);

vdbApp.factory('reportService', ['$http',function ($http) {
		return {
			getReport : function ( jsondata ){
				return $http.post(APIURL+'reports',jsondata)
					.success(function(data){
						if(angular.isObject(data)){
						reportService.data =data;
						return reportService.data;
						}
					});
					return reportService.data;
				
			}
		}

}]);
vdbApp.factory('loginService', ['$http',function ($http) {
		return {
			getLogin : function( jsondata ){
				return $http.post(APIURL+'login', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						loginService.data=data;
						return loginService.data;
					}
				});
				return loginService.data;
			}
	};
}])




vdbApp.controller('cityCtrl', ['$scope','$window','$location','$rootScope','$routeParams','$http','issuesService','reportService', function ($scope,$window,$location,$rootScope,$routeParams,$http,issuesService,reportService) {
						var jsondata = JSON.stringify({"council" : "Groningen"});
						
						//promise for make asyncronise data factory to be syncronis
						var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues;
								// console.log(getdata.data.issues); 
						});
						var getReport = reportService.getReport( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
						});
						
						
						//click function
						$scope.alrCity = function(){
						if(city.long_name != null){
							//Get city problem when click/drag
							jsondata = JSON.stringify({"council" : "Groningen"});
							$location.path("/city/"+city.long_name);
							getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues; 
								
								});
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

vdbApp.controller('loginCtrl', ['$scope','$rootScope','$window','loginService', function ($scope,$rootScope,$window,loginService) {
	$scope.hide = "ng-hide";

	$scope.login = function(){
		var jsondata = JSON.stringify({"user":{"username":""+$scope.username+"","password":""+$scope.password+""}});
		var getLogin = loginService.getLogin(jsondata).then(function (data){
				var getLogin = data.data;
				if(!getLogin.success){
					$scope.errorMessage = getLogin.error;
					$scope.hide = "";
				}	
		})
		
	}
	$scope.close = function(){
		$scope.hide="ng-hide";
	}
}])