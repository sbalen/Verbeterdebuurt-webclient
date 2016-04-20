var vdbApp = angular.module('vdbApp', ['ngRoute','angularSpinner','angularUtils.directives.dirPagination'])
var APIURL = "https://staging.​verbeterdebuurt.nl/api.php/json_1_3/";

var issuesService = new Object();
var registerService = new Object();
var loginService  = new Object();
var reportService = new Object();
var loginService = new Object();
var commentService = new Object();
var myIssuesService = new Object();

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
		controller: 'mainCtrl'
		
	})
	.when('/city/:cityName', {
		templateUrl: 'map.html',
		controller: 'mainCtrl'
	})
	.when('/issues/:id',{
		templateUrl :'issues.html',
		controller : 'issuesCtrl'
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
    
    .when('/regisconfirmation',{
        templateUrl: 'regisconfirmation.html'
        
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

vdbApp.factory('commentService', ['$http',function ($http) {
		return {
			getComment : function( jsondata ){
				return $http.post(APIURL+'"comments').success(function(data){
					if(angular.isObject){
						commentService.data = data;
						return commentService.data;
					}
				});
				return commentService.data;
			}
		};
}])

vdbApp.factory('registerService', ['$http',function ($http) {
		return {
			getRegister : function( jsondata ){
				return $http.post(APIURL+'register', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						registerService.data=data;
						return registerService.data;
					}
				});
				return registerService.data;
			}
	};
}])

vdbApp.factory('myIssuesService', ['$http',function ($http) {
	return {
			getMyIssues  : function( jsondata ){
				return $http.post(APIURL+'myIssues', jsondata)
				.success(function (data){
					if(angular.isObject(data)){
						myIssuesService.data = data ; 
						return myIssuesService.data;
					}
				});
				return myIssuesService.data;
			}
	};
}])




vdbApp.controller('mainCtrl', ['$scope','$window','$location','$rootScope','$routeParams','$http','issuesService','reportService','commentService', function ($scope,$window,$location,$rootScope,$routeParams,$http,issuesService,reportService,commentService) {
						menuSelected($rootScope,'home');
						var jsondata = JSON.stringify({"council" : "Groningen"});
						$rootScope.urlBefore = $location.path();
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
						
						//click function at map
						$scope.alrCity = function(){
							if(city.long_name !=null){
							
							//url change validation	
							if($location.path().includes("/city/") || $location.path().endsWith("/") ){
								$location.path("/city/"+city.long_name);
								$rootScope.lastUrl = $location.path();	
							}
							
							//Get city problem when click/drag
							jsondata = JSON.stringify({"council" : "Groningen"});
							getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues; 
								
								});
							}
							
						}
						//login session
						$scope.loginStatus = function(){
							if($window.sessionStorage.username == null){
								return false;
							}
							else{
								$rootScope.username = $window.sessionStorage.username;
								return true;
							}
						}
						//logOut
						$scope.logout = function(){
							$window.sessionStorage.clear();
							$location.path('/');
						}
						//search
						$scope.clickSearch= function(){
							$window.searchCity = $scope.searchCity;
						}
						//validate session user

						
					}]);
//Retrieving issues




// vdbApp.controller('mainCtrl', ['$scope','issues', function ($scope,issues) {

// }]);
vdbApp.controller('issuesCtrl', ['$scope','$rootScope','$routeParams','issuesService','reportService','usSpinnerService','$location','$anchorScroll', function ($scope,$rootScope,$routeParams,issuesService,reportService,usSpinnerService,$location,$anchorScroll) {
	$scope.hide = "ng-hide";
	var jsondata = JSON.stringify({"council" : "Groningen"});
		if($rootScope.lastUrl==null){
			$rootScope.lastUrl=='/';
		}
	$rootScope.urlBefore = $location.path();
	var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues;
								$scope.hide = "";
								usSpinnerService.stop('spinner-1');
								var temp = $location.hash();
								$location.hash('main-main-content');
								$anchorScroll();
								
								// console.log(getdata.data.issues); 
						});

	var getReport = reportService.getReport( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
						});
	$scope.id = function(){
		return $routeParams.id;
	}

}])


vdbApp.controller('mentionCtrl', ['$scope','$rootScope','$window','$location', function ($scope,$rootScope,$window,$location) {
	menuSelected($rootScope,'mention');
		if($window.sessionStorage.username==null){
				$rootScope.urlBefore = $location.path();
				$location.path('/login');
		}
}])

vdbApp.controller('myIssuesCtrl', ['$scope','$rootScope','$window','$location','myIssuesService', function ($scope,$rootScope,$window,$location,myIssuesService) {
	menuSelected($rootScope,'myIssues');
  		$scope.totalPage = 3;
		if($window.sessionStorage.username==null){
				$rootScope.urlBefore = $location.path();
				$location.path('/login');
		}
		var jsondata = JSON.stringify({"user":{ "username":""+$window.sessionStorage.username+"",
												"password_hash":""+$window.sessionStorage.password_hash+""

												}});

		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			$scope.count = getdata.count;
			$scope.myIssuesList = getdata.issues
		})

}])

vdbApp.controller('loginCtrl', ['$scope','$rootScope','$window','loginService','$location','usSpinnerService', function ($scope,$rootScope,$window,loginService,$location,usSpinnerService) {
	$scope.hide = "ng-hide";
	//$scope.overlay ACTIVE WHENclick and overlay when no event
	$scope.overlay="overlay";
	
	
	if($rootScope.urlBefore==null || $rootScope.urlBefore == '/login'){
			$rootScope.urlBefore='/' ;
	}
	if($window.sessionStorage.username !=null){
			$location.path('/');
	}

	$scope.login = function(){
		usSpinnerService.spin('spinner-1');
		$scope.overlay = "overlayactive";
		var jsondata = JSON.stringify({"user":{"username":""+$scope.lusername+"","password":""+$scope.lpassword+""}});
		var getLogin = loginService.getLogin(jsondata).then(function (data){
				var getLogin = data.data;
				if(!getLogin.success){
					$scope.errorMessage = getLogin.error;
					usSpinnerService.stop('spinner-1');
					$scope.overlay = "overlay";
					$scope.hide = "";
				}else if(getLogin.success){
					//temp for data session
					$window.sessionStorage.username = getLogin.user.username;
					$window.sessionStorage.email = getLogin.user.email;
					$window.sessionStorage.password_hash = getLogin.user.password_hash;
					$window.sessionStorage.name = getLogin.user_profile.name;
					$window.sessionStorage.initials = getLogin.user_profile.initials;
					$window.sessionStorage.surname = getLogin.user_profile.surname;
					$window.sessionStorage.tussenvoegsel = getLogin.user_profile.tussenvoegsel;
					$window.sessionStorage.sex = getLogin.user_profile.sex;
					$window.sessionStorage.address = getLogin.user_profile.address;
					$window.sessionStorage.address_number = getLogin.user_profile.address_number;
					$window.sessionStorage.address_suffix = getLogin.user_profile.address_suffix;
					$window.sessionStorage.postcode = getLogin.user_profile.postcode;
					$window.sessionStorage.city = getLogin.user_profile.city;
					$window.sessionStorage.phone = getLogin.user_profile.phone;
					$rootScope.loginStatus = function(){
						return true;
					}
					usSpinnerService.stop('spinner-1');
					$scope.overlay = "overlay";
					$location.path($rootScope.urlBefore);
				}	
		})
		
	}
	$scope.close = function(){
		$scope.hide="ng-hide";
	}
}])

vdbApp.controller('registerCtrl', ['$scope','$rootScope','$window','registerService','usSpinnerService', function ($scope,$rootScope,$window,registerService,usSpinnerService) {
	$scope.hide = "ng-hide";
    $scope.overlay="overlay";

	$scope.register = function(){
        usSpinnerService.spin('spinner-1');
        $scope.overlay = "overlayactive";
		var jsondata = JSON.stringify({"user":{"username":""+$scope.username+""
                                               ,"password":""+$scope.password+""
                                               ,"email":""+$scope.email+""},
                                       
                                       "user_profile":{"initials":""+$scope.initials+""
                                                      ,"tussenvoegsel":""+$scope.tussenvoegsel+""
                                                      ,"surname":""+$scope.surname+""
                                                      ,"sex":""+$scope.sex+""
                                                      ,"address":""+$scope.address+""
                                                      ,"address_number":""+$scope.address_number+""
                                                      ,"address_suffix":""+$scope.address_suffix+""
                                                      ,"postcode":""+$scope.postcode+""
                                                      ,"city":""+$scope.city+""
                                                      ,"phone":""+$scope.phone+""}
                                      
        
                                       
                                       
                                      });
                                   
        
       
		var getRegister = registerService.getRegister(jsondata).then(function (data){
				var getRegister = data.data;
                console.log(getRegister.errors);
                $scope.errorPassword = ""
        
                
                
            if($scope.password != $scope.password2)
                {
                    $scope.errorPassword = "Wachtwoord niet overeen"
                    $scope.hide = "";
                }
            
            if(getRegister.errors.sex !=null){
                    $scope.errorSex = "sex "+getRegister.errors.sex;
                    }else{
                    $scope.errorSex="";
                    }
            
            if (!getRegister.success){
                
                   
					$scope.errorEmail = getRegister.errors.email;
                    $scope.errorNewPassword = getRegister.errors.password;
                    $scope.errorPassword1= getRegister.errors.password_repeat;
                    $scope.errorNewUsername = getRegister.errors.username;
                    $scope.errorSurname = getRegister.errors.surname;
                    $scope.errorAddress = getRegister.errors.address;
                    $scope.errorAddressN = getRegister.errors.address_number;
                    $scope.errorPost= getRegister.errors.postcode;
                    $scope.errorCity = getRegister.errors.city;
                    $scope.errorMiddle = getRegister.errors.tussenvoegsel;
                    $scope.errorPost = getRegister.errors.postcode;
                    $scope.errorCity = getRegister.errors.city;
                    $scope.errorInitials = getRegister.errors.initials;
                
                    usSpinnerService.stop('spinner-1');
					$scope.hide = "";
					$scope.overlay="overlay";

				}	
		});
		
	}
	$scope.close = function(){
		$scope.hide="ng-hide";
	}
}])