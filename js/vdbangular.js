var vdbApp = angular.module('vdbApp', ['ngRoute','angularSpinner','angularUtils.directives.dirPagination'])
var APIURL = "https://staging.verbeterdebuurt.nl/api.php/json_1_3/";
var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow();
var infoWindowContent = [];
var latlngChange;
var marker;
var map;
//define service
var issuesService = new Object();
var registerService = new Object();
var loginService  = new Object();
var reportService = new Object();
var loginService = new Object();
var commentService = new Object();
var forgotService = new Object();
var myIssuesService = new Object();
var commentSubmitService = new Object();
var profileService = new Object();
var workLogService = new Object();
var categoriesService = new Object();
var issueSubmitService = new Object();
var voteSubmitService = new Object();


//google map
window.onload = function(){
      var mainLat = 52.158367;
      var mainLng = 4.492999;
      this._map_center = {lat: mainLat , lng: mainLng};
      this._marker_positions = [{lat: 27.1959742, lng: 78.02423269999100}, {lat: 27.1959733, lng: 78.02423269999992}] ;
      var mapOptions = {
        zoom: 15,
        maxZoom:17,
        minZoom:13,
        scrollwheel: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
         },
         // initialize zoom level - the max value is 21
        disableDefaultUI: true,
        streetViewControl: false, // hide the yellow Street View pegman
        /*scaleControl: false, // allow users to zoom the Google Map*/
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center:  this._map_center,
        zoomControlOptions : { 
          position :google.maps.ControlPosition.RIGHT_BOTTOM }
      };
     map = new google.maps.Map(document.getElementById('googlemaps'), mapOptions);
     getLocation(map);
     var geocoder = new google.maps.Geocoder();
     maxlat  = 52.17899981092104;
     maxlng  = 52.15154422875919;
     minlat = 4.545096343219029;
     minlng = 4.487203543841588

     if(cityName!=null){
        geocodeAddress(geocoder, map);
        cityName=null;
     }
  	 getLatLng(map);
      //start location picker
    
}
function getLatLng (map){
	google.maps.event.addListener(map,'bounds_changed',function(){
		latlngChange = map.getCenter();
	})
}
function googleMapIssue(lat,lng){
	var location = {lat: lat , lng: lng};
	var mapOption2 = {
		center : location,
		zoom : 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
		
	}
	var markerOption2 = {
		 position : location
	}
	var map2=new google.maps.Map(document.getElementById("googleMapIssue"),mapOption2);
	map2.setOptions({draggable:false,zoomControl:false,scrollwheel: false, disableDoubleClickZoom: true,streetViewControl: false,disableDefaultUI:true});
	var marker = new google.maps.Marker(markerOption2);
	marker.setMap(map2);
}

function googleMapCreateProblem(latlng){
	var mapOption3 = {
		center : latlng,
		zoom : 17,
		maxZoom:19,
        minZoom:15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	 map3 = new google.maps.Map(document.getElementById("googleMapCreateProblem"),mapOption3);
	 marker = new google.maps.Marker();
	 marker.setMap(map3);
	 marker.setPosition(map3.getCenter());
	 marker.setOptions({draggable:true,icon:"/img/icon_2_42_42.png"});
	 map3.setOptions({draggable:true,zoomControl:true,scrollwheel: true, disableDoubleClickZoom: true,streetViewControl: false,disableDefaultUI:true});
	 markerLat = marker.getPosition().lat();
	 markerLng = marker.getPosition().lng();
	
	 sycGoogleMap3(map3);
	 markerCenter(map3,marker,"location");
	 getMarkerLocation(marker);
	 markerGetAddress(marker,"location");

	  
}
function googleMapCreateIdea(latlng){
	var mapOption4 = {
		center : latlng,
		zoom : 17,
		maxZoom:19,
        minZoom:15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	 map4 = new google.maps.Map(document.getElementById("googleMapCreateIdea"),mapOption4);
	 marker = new google.maps.Marker();
	 marker.setMap(map4);
	 marker.setPosition(map4.getCenter());
	 marker.setOptions({draggable:true,icon:"/img/icon_idea_2_42_42.png"});
	 map3.setOptions({draggable:true,zoomControl:true,scrollwheel: true, disableDoubleClickZoom: true,streetViewControl: false,disableDefaultUI:true});
	 markerLat = marker.getPosition().lat();
	 markerLng = marker.getPosition().lng();
	
	 sycGoogleMap4(map4);
	 markerCenter(map4,marker,"location2");
	 getMarkerLocation(marker);
	 markerGetAddress(marker,"location2");

	  
}

//to make other map syncronise
function sycGoogleMap3(map3){
	google.maps.event.addListener(map3,'bounds_changed',function (e){
					google.maps.event.trigger(map3,'resize')
                    map.setCenter(map3.getCenter());
                    map.setZoom(map3.getZoom());
              });
}
function sycGoogleMap4(map4){
	google.maps.event.addListener(map4,'bounds_changed',function (e){
					 google.maps.event.trigger(map4,'resize')
                    map.setCenter(map4.getCenter());
                    map.setZoom(map4.getZoom());
              });
}
//marker at center
function markerCenter (map,marker,location){
	google.maps.event.addListener(map,'bounds_changed',function (e){
				marker.setPosition(map.getCenter());
				markerLat = marker.getPosition().lat();
	 			markerLng = marker.getPosition().lng();
	 			 geocoder.geocode({'latLng': marker.getPosition()} , function (result , status){
                if (status == google.maps.GeocoderStatus.OK){

                for (var i=0; i<result[0].address_components.length; i++) {
                for (var b=0;b<result[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (result[0].address_components[i].types[b] == "route") {
                   // street name
                    streetLocation= result[0].address_components[i].short_name;
                    addressLocation = streetLocation;
					document.getElementById(location).value = addressLocation;
	                    break;
                        }
                // if (result[0].address_components[i].types[b] == "street_number") {
                //    // street number
                //     street_number= result[0].address_components[i].short_name;
                //     break;
                //         }
                    }
             
                    
                }
                }
                

               });
				
	 			
	});
}
//get location marker
function getMarkerLocation(marker){
	google.maps.event.addListener(marker,'dragend',function (e){
			markerLat = marker.getPosition().lat();
	 		markerLng = marker.getPosition().lng();
	});
}
// get location search at create issue
function geocodeAddressCreateProblem(geocoder, resultsMap, address) {
        var address = address;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
            markerLat = marker.getPosition().lat();
	 		markerLng = marker.getPosition().lng();
	 		 maxlat  = map.getBounds().getNorthEast().lat();
             maxlng  = map.getBounds().getNorthEast().lng();
             minlat = map.getBounds().getSouthWest().lat();
             minlng = map.getBounds().getSouthWest().lng();
	 		showIssue(infoWindow,infoWindowContent);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
function markerGetAddress(marker,location){
		 //first time load
		google.maps.event.addListener(marker, 'drag', function (e) {
               geocoder.geocode({'latLng': marker.getPosition()} , function (result , status){
                if (status == google.maps.GeocoderStatus.OK){

                for (var i=0; i<result[0].address_components.length; i++) {
                for (var b=0;b<result[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (result[0].address_components[i].types[b] == "route") {
                   // street name
                    street= result[0].address_components[i].short_name;
                    break;
                        }
                if (result[0].address_components[i].types[b] == "street_number") {
                   // street number
                    street_number= result[0].address_components[i].short_name;
                    break;
                        }
                    }
             
                    
                }
                }
                

               });
				address = street+" "+street_number;
				document.getElementById(location).value = address;
            });
}
//change menu selected
function menuSelected($scope,selected){
	$scope.homeSelected = "";
	$scope.mentionSelected = "";
	$scope.myIssuesSelected = "";

	switch(selected) {
		case 'home':
			$scope.homeSelected = "active"
			break;
		case 'createissue':
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
		controller : 'mainCtrl'
		
	})
	.when('/city/:cityName', {
		templateUrl: 'map.html',
		controller : 'mainCtrl' 
	})
	.when('/issues/:id',{
		templateUrl :'issuesView.html',
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
	.when('/myIssues/:id', {
		templateUrl: 'myIssueDetail.html',
		controller: 'myIssuesDetailCtrl'
	})
    
    .when('/login', {
		templateUrl: 'login.html'
		
	})
    
    .when('/register', {
		templateUrl: 'register.html'
        
    })
    
    .when('/regisconf',{
        templateUrl: 'regisconf.html',
        controller : 'regisconfCtrl'
	})
    .when('/forgotpass',{
        templateUrl: 'forgotpass.html',
        controller : 'forgotCtrl'
	})
    .when('/forgotconf',{
        templateUrl: 'forgotconf.html',
        controller : 'forgotconfCtrl'
	})
    .when('/createissue',{
        templateUrl: 'createissues.html',
        controller : 'createissueCtrl'
	})
    .when('/profile',{
        templateUrl: 'profile.html',
        controller : 'profileCtrl'
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
				return $http.post(APIURL+'comments', jsondata).success(function(data){
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


vdbApp.factory('forgotService', ['$http',function ($http) {
		return {
			getForgot : function( jsondata ){
				return $http.post(APIURL+'resetPassword', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						forgotService.data=data;
						return forgotService.data;
					}
				});
				return forgotService.data;

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

vdbApp.factory('commentSubmitService', ['$http',function ($http) {
	return {
		getCommentSubmit : function( jsondata ){
			return $http.post(APIURL+'commentSubmit' , jsondata)
			.success(function (data){
				if(angular.isObject(data)){
					commentSubmitService.data = data;
					return commentSubmitService.data;
				}
			});
			return commentSubmitService.data;
		}
	};
}])


vdbApp.factory('profileService', ['$http',function ($http) {
		return {
			getProfile : function( jsondata ){
				return $http.post(APIURL+'editSettings', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						profileService.data=data;
						return profileService.data;
					}
				});
				return profileService.data;

    			}
	};
}])

vdbApp.factory('workLogService', ['$http',function ($http) {
	return {
			getWorkLog : function( jsondata ){
				return $http.post(APIURL+'worklogs', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						workLogService.data = data;
						return workLogService.data;
					}
				});
				return workLogService.data;
			}
	};
}])

vdbApp.factory('categoriesService', ['$http',function ($http) {
	return {
			getCategories : function( jsondata ){
				return $http.post(APIURL+'categories', jsondata)
				.success(function(data){
					if(angular.isObject(data)){
						categoriesService.data = data;
						return categoriesService.data;
					}
				});
				return categoriesService.data;
			}

	};
}])
vdbApp.factory('issueSubmitService', ['$http',function ($http) {
	return {
			getIssueSubmit: function ( jsondata ){
				return $http.post(APIURL+'issueSubmit', jsondata)
				.success(function(data){
						issueSubmitService.data = data;
						return issueSubmitService.data;
				});
				return issueSubmitService.data;
			}
	};
}])

vdbApp.factory('voteSubmitService', ['$http',function ($http) {
	return {
			getvoteSummit : function ( jsondata ){
				return $http.post(APIURL+'voteSubmit', jsondata)
				.success(function(data){
					voteSubmitService.data = data;
					return voteSubmitService.data;
				});
				return voteSubmitService.data;
			}

	};
}])


vdbApp.controller('mainCtrl', ['$scope','$timeout','$window','$location','$rootScope','$routeParams','$http','issuesService','reportService',function ($scope,$timeout,$window,$location,$rootScope,$routeParams,$http,issuesService,reportService) {
						menuSelected($rootScope,'home');
						
                        $scope.userpanel=1;
    
						$timeout(function(){
							var jsondata = JSON.stringify({
							  		"coords_criterium":{
								  	"max_lat":maxlat,
								    "min_lat":minlat,
								    "max_long":maxlng,
								    "min_long":minlng
								  }
								});
						var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues;
								//initial google map marker
								if(getdata.count != 0 || !getdata){
								$window.issuesData = getdata;
								showIssue(infoWindow,infoWindowContent);
							}
						});
						},2000);
						if(!$routeParams.cityName){
							var jsoncity = JSON.stringify({"council":"Leiden"});	
						}else{
							var jsoncity = JSON.stringify({"council":""+$routeParams.cityName+""});
						}
						
						$rootScope.urlBefore = $location.path();
						$window.cityName = $routeParams.cityName;
						$scope.searchCity = $routeParams.cityName;
						$rootScope.errorSession="";

						//promise for make asyncronise data factory to be syncronis first load
						var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
						});
						
						
						//click function at map
						$scope.alrCity = function(){
							if($window.city.long_name !=null){
							
							//url change validation	
							if($location.path().includes("/city/") || $location.path().endsWith("/") ){
								$location.path("/city/"+$window.city.long_name);
								$rootScope.lastUrl = $location.path();
								$scope.searchCity = city.long_name;	
							}
							
							//Get city problem when click/drag
							var jsondata = JSON.stringify({"coords_criterium":{
														  	"max_lat":maxlat,
														    "min_lat":minlat,
														    "max_long":maxlng,
														    "min_long":minlng
														  }
														});
							
						
								var jsoncity = JSON.stringify({"council":""+$routeParams.cityName+""});
							var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
							});
							
							
							getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.newProblemList = getdata.issues; 
								if(getdata.count != 0 || !getdata){
								$window.issuesData = getdata;
								showIssue(infoWindow,infoWindowContent);
								}
								
								});
							}
							
							
						}
						//login session
						$scope.loginStatus = function(){
							if($window.sessionStorage.username == null){
								return false;
							}
							else{
								$rootScope.lusername = $window.sessionStorage.username;
                               
                                
								return true;
							}
						}
						//logOut
						$scope.logout = function(){
							$window.sessionStorage.clear();
                           // $('.dropdown-menu').hide();
                            $scope.userpanel=0;
                            
                            $location.path('/');
						}
                        
                        $scope.showuserpanel= function(){
                           
                            if($scope.userpanel==0)
                                $scope.userpanel=1;
                            
                        //    $('.dropdown-menu').show();
                            
                        }
                        
                        
						//search
						$scope.clickSearch= function(){
							console.log($scope.searchCity);
							$window.cityName = null;
							city.long_name = $scope.searchCity;
							var jsondata = JSON.stringify({"coords_criterium":{
														  	"max_lat":maxlat,
														    "min_lat":minlat,
														    "max_long":maxlng,
														    "min_long":minlng
														  }
														});
							getIssues = issuesService.getIssues( jsondata ).then(function (data){
							var getdata = data.data;
							$rootScope.newProblemList = getdata.issues;
							if(getdata.count != 0 || !getdata){
							$window.issuesData = getdata;
							showIssue(infoWindow,infoWindowContent);
							}
								});

							geocodeAddress(geocoder, map);
							var jsoncity = JSON.stringify({"council":""+city.long_name+""})
							var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
							});
							$location.path("city/"+$scope.searchCity);
						}
						//move page
						$scope.clickMenu = function(selected){
								if(selected == "myissues"|| selected == "createissue"){
									if(!$window.sessionStorage.username){
										if(selected == 'myissues'){
											menuSelected($rootScope,'myIssues');
										}
										if( selected == 'createissue'){
											menuSelected($rootScope,'createissue');
										}
										$location.path('/'+"login");
									}
									else{
										$location.path('/'+selected);	
									}
								}else{
										$location.path('/'+selected);	
								} 
								
						}


						
					}]);
//Retrieving issues




// vdbApp.controller('mainCtrl', ['$scope','issues', function ($scope,issues) {

// }]);
vdbApp.controller('issuesCtrl', ['$scope','$rootScope','$window','$routeParams','issuesService','reportService','usSpinnerService','$location','$anchorScroll','workLogService','commentService','$timeout','voteSubmitService', function ($scope,$rootScope,$window,$routeParams,issuesService,reportService,usSpinnerService,$location,$anchorScroll,workLogService,commentService,$timeout,voteSubmitService) {
	$rootScope.globaloverlay = "active";
    $scope.hide = "ng-hide";
	$scope.overlay = "overlay";
	$scope.hideStatus = "ng-hide";
	$scope.errorVote = "";
	$scope.hideError = 1;

	var jsondata = JSON.stringify({"issue_id":$routeParams.id});
	
		if($rootScope.lastUrl==null){
			$rootScope.lastUrl=='/';
		}
	$rootScope.urlBefore = $location.path();
	var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.problemIdList = getdata.issues;
								$scope.hide = "";
								usSpinnerService.stop('spinner-1');
                                $rootScope.globaloverlay = "";
      //                           var jsoncity = JSON.stringify({"council":""+getdata.issues[0].council+""});
						// 		var getReport = reportService.getReport( jsoncity ).then(function (data){
						// 		var getdata = data.data;
						// 		$rootScope.reportList = getdata.report;
                                                               
						// });
						
						});

	$scope.id = function(){
		return $routeParams.id;
	}

	//validity must login when comment
	$scope.sessionValid = function(){
		if(!$window.sessionStorage.username){
			$location.path("/login");
			$scope.stemModal = "";
			$rootScope.errorSession="je moet ingelogd zijn om commentaar te geven of de snelheid"
		}
		else{
			$scope.stemModal = "#StemModal";
		}	
	};

	//validation for submit vote
	$scope.voteSubmit = function(){
		if(!$window.sessionStorage.username){
			$location.path("/login");
			$rootScope.errorSession="je moet ingelogd zijn om commentaar te geven of de snelheid"
		}
		else{
			$rootScope.globaloverlay = "active";
			var jsonVoteSubmit = JSON.stringify({"user":{
														"username":""+$window.sessionStorage.username+"",
													    "password_hash":""+window.sessionStorage.password_hash+""
													  },
													  "issue_id":$routeParams.id});
			var getvoteSummit = voteSubmitService.getvoteSummit( jsonVoteSubmit ).then(function(data){
				var getvoteSummit = data.data;
				console.log(getvoteSummit);
				if(!getvoteSummit.success){
					$scope.hideError = 0;
					$scope.errorVote = ""+getvoteSummit.error+"";
				}else {
					var jsondata = JSON.stringify({"issue_id":$routeParams.id});
				    var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.problemIdList = getdata.issues;
						});

				}
				//vote reload
				
				$rootScope.globaloverlay = "";
			});
		}	
	}
	
	//close the detail;
	$scope.close = function(){
		$scope.hide = "ng-hide";
	}

	//googlemap
	$scope.googleMapIssue = function(lat,lng){
		googleMapIssue(lat,lng);
	}
	//hide log Status
	if($window.sessionStorage.username){
		var logjsondata = JSON.stringify({"user":{
											"username":""+$window.sessionStorage.username+"",
											"password_hash":""+$window.sessionStorage.password_hash+""
										},
											"issue_id":""+$routeParams.id+""	
									});
		var getWorkLog = workLogService.getWorkLog( logjsondata ).then(function (data){
				var getdata = data.data;
				if(!getdata.success){
					$scope.hideLogStatus = "ng-hide";
				}else if(getdata.success&&getdata.count==0){
					$scope.hideLogStatus = "ng-hide";
				}else{
					$scope.hideLogStatus = "";
					$scope.WorkLogList = getdata.worklogs;
				}
		});
	}
	else{
	$scope.hideLogStatus = "ng-hide";
	}
					
	//to hide and show log status
	$scope.logStatus = function(){
		if($scope.hideStatus=="ng-hide"){
			$scope.hideStatus="";
		}
		else{
			$scope.hideStatus="ng-hide";
		}
	}
	//show Comment
	var commentjsondata = JSON.stringify({"issue_id" : ""+$routeParams.id+""});
	var getComment = commentService.getComment( commentjsondata ).then(function (data){
		var getComment = data.data;
		$rootScope.commentList = getComment.comments;
	});
	//close error
	$scope.closeError = function(){
		$scope.hideError = 1;
		$scope.errorVote = "";
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
		$scope.hide = "";
		menuSelected($rootScope,'myIssues');

		$rootScope.currentPage = 1;
  		$scope.totalPage = 3;
		if($window.sessionStorage.username==null){
				$rootScope.urlBefore = $location.path();
				$location.path('/login');
		}
		var jsondata = JSON.stringify({"user":{ "username":""+$window.sessionStorage.username+"",
												"password_hash":""+$window.sessionStorage.password_hash+""

											}});
		//to get hash password
		// console.log(jsondata);
		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			$scope.count = getdata.count;
			$scope.myIssuesList = getdata.issues;
		})
		


}])

vdbApp.controller('myIssuesDetailCtrl', ['$scope','$routeParams','$http','$rootScope','$location','$window','myIssuesService','usSpinnerService','workLogService','commentService','voteSubmitService', function ($scope,$routeParams,$http,$rootScope,$location,$window,myIssuesService,usSpinnerService,workLogService,commentService,voteSubmitService) {
		$scope.hide = "";
		$scope.hideStatus="ng-hide";
		$scope.errorVote = "";
		$scope.hideError = 1;
		
		$rootScope.globaloverlay = "active";
		$scope.id = function(){
			return $routeParams.id;
		}
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
			$scope.myIssuesList = getdata.issues;
			$rootScope.globaloverlay = "";
		})
		$scope.id = function(){
		return $routeParams.id;
		}

		//call googlemap
		$scope.googleMapIssue = function(lat,lng){
		googleMapIssue(lat,lng);
		}

		//hidelog
		if($window.sessionStorage.username){
		var logjsondata = JSON.stringify({"user":{
											"username":""+$window.sessionStorage.username+"",
											"password_hash":""+$window.sessionStorage.password_hash+""
										},
											"issue_id":""+$routeParams.id+""	
									});
		var getWorkLog = workLogService.getWorkLog( logjsondata ).then(function (data){
				var getdata = data.data;
				if(!getdata.success){
					$scope.hideLogStatus = "ng-hide";
				}else if(getdata.success&&getdata.count==0){
					$scope.hideLogStatus = "ng-hide";
				}else{
					$scope.hideLogStatus = "";
					$scope.WorkLogList = getdata.worklogs;
				}
		});
		}
		else{
		$scope.hideLogStatus = "ng-hide";
		}

		//to hide and show log
		//to hide and show log status
		$scope.logStatus = function(){
			if($scope.hideStatus=="ng-hide"){
				$scope.hideStatus="";
			}
			else{
				$scope.hideStatus="ng-hide";
			}
		}
		//comment
		//validity must login when comment
		$scope.sessionValid = function(){
		if(!$window.sessionStorage.username){
			$location.path("/login");
			$scope.stemModal = "";
			$rootScope.errorSession="je moet ingelogd zijn om commentaar te geven of de snelheid"
		}
		else{
			$scope.stemModal = "#StemModal";
		}	
		};

		//voteSubmit
		$scope.voteSubmit = function(){
		if(!$window.sessionStorage.username){
			$location.path("/login");
			$rootScope.errorSession="je moet ingelogd zijn om commentaar te geven of de snelheid"
		}
		else{
			$rootScope.globaloverlay = "active";
			var jsonVoteSubmit = JSON.stringify({"user":{
														"username":""+$window.sessionStorage.username+"",
													    "password_hash":""+window.sessionStorage.password_hash+""
													  },
													  "issue_id":$routeParams.id});
			var getvoteSummit = voteSubmitService.getvoteSummit( jsonVoteSubmit ).then(function(data){
				var getvoteSummit = data.data;
				console.log(getvoteSummit);
				if(!getvoteSummit.success){
					$scope.hideError = 0;
					$scope.errorVote = ""+getvoteSummit.error+"";
				}else {
					var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
						var getdata = data.data;
						$scope.myIssuesList = getdata.issues;
					});

				}
				//vote reload
				
				$rootScope.globaloverlay = "";
			});
		}	
	}
		//show comment
		var commentjsondata = JSON.stringify({"issue_id" : ""+$routeParams.id+""});
		var getComment = commentService.getComment( commentjsondata ).then(function (data){
		var getComment = data.data;
		$rootScope.commentList = getComment.comments;
	});
		//close error
		$scope.closeError = function(){
		$scope.hideError = 1;
		$scope.errorVote = "";
	}

}])

vdbApp.controller('loginCtrl', ['$scope','$rootScope','$window','loginService','$location','usSpinnerService', function ($scope,$rootScope,$window,loginService,$location,usSpinnerService) {
	$scope.hide = "ng-hide";
    $scope.lusername="";
    $scope.lpassword="";
    
    
	//$scope.overlay ACTIVE WHENclick and overlay when no event
	$scope.overlay="overlay";
	
	
	if($rootScope.urlBefore==null || $rootScope.urlBefore == '/login'){
			$rootScope.urlBefore='/' ;
	}
	if($window.sessionStorage.username !=null){
			$location.path('/');
	}
	//error session
	if($rootScope.errorSession){
		$scope.hide = "";
	}
	$scope.login = function(){
		//usSpinnerService.spin('spinner-1');
        $rootScope.globaloverlay = "active";
		//$scope.overlay = "overlayactive";
		var jsondata = JSON.stringify({"user":{"username":""+$scope.lusername+"","password":""+$scope.lpassword+""}});
		var getLogin = loginService.getLogin(jsondata).then(function (data){
				var getLogin = data.data;
				if(!getLogin.success){
					$scope.errorMessage = getLogin.error;
					//usSpinnerService.stop('spinner-1');
					//$scope.overlay = "overlay";
					$scope.hide = "";
                    $rootScope.globaloverlay = "";
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
                    $rootScope.globaloverlay = "";
					//usSpinnerService.stop('spinner-1');
					//$scope.overlay = "overlay";
					$rootScope.errorSession="";
					if($rootScope.urlBefore == '/register'){
						$location.path('/map');
					}
					else{
						$location.path($rootScope.urlBefore);
					}
					
				}	
		})
		
	}
	$scope.close = function(){
		$scope.hide="ng-hide";
		$rootScope.errorSession="";
	}
	//move to register page
	$scope.register = function(){
		$location.path('/register');
	}
    
      $scope.forgotpass=function()
    {
        $location.path('/forgotpass');
        
    }
    
}])

vdbApp.controller('registerCtrl', ['$scope','$rootScope','$window','registerService','usSpinnerService','$location', function ($scope,$rootScope,$window,registerService,usSpinnerService,$location) {
    $scope.home = function(){
		        $location.path('/');
	                                   
                }
    
	$scope.hide = "ng-hide";
    //$scope.overlay="overlay";
    $scope.email="";
    $scope.username="";
    $scope.password="";
    $scope.initials="";
    $scope.tussenvoegsel="";
    $scope.surname="";
    $scope.sex="";
    $scope.address="";
    $scope.address_number="";
    $scope.address_suffix="";
    $scope.postcode="";
    $scope.city="";
    $scope.phone="";
    $scope.sexoption = [
        {'name': 'Dhr.',
         'value': 'm'},
        {'name': 'Mw.',
         'value': 'f'}
    ];
    $scope.sex = $scope.sexoption[0].value;
    
	$scope.register = function(){
        $rootScope.errorSession ="";

        $rootScope.globaloverlay = "active";
        //usSpinnerService.spin('spinner-1');
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
        
          

        $rootScope.tempemail=$scope.email;
        console.log($rootScope.tempemail);
        
        
        
                                   
       console.log(jsondata)
		var getRegister = registerService.getRegister(jsondata).then(function (data){
				var getRegister = data.data;
                console.log(getRegister.errors);
                $scope.errorPassword = ""
                
        
                
                
            if($scope.password != $scope.password2)
                {
                    $scope.errorPassword = "Wachtwoord niet overeen"
                    $scope.hide = "";
                }
          
            if (!getRegister.success){
                      
//            if(getRegister.errors.sex !== " "){
//                    $scope.errorSex = "Gender "+getRegister.errors.sex;
//                    $scope.red="border-color:red";
//                
//                    }else if(getRegister.success) {
//                    $scope.errorSex="";
//                    $scope.red="";
//                    }
//            
                   
					$scope.errorEmail = getRegister.errors.email;
                    $scope.errorNewPassword =  getRegister.errors.password;
                    $scope.errorPassword1= getRegister.errors.password_repeat;
                    $scope.errorNewUsername = getRegister.errors.username;
                    $scope.errorSurname = getRegister.errors.surname;
                    $scope.errorAddress = getRegister.errors.address;
                    $scope.errorAddressN = getRegister.errors.address_number;
                    $scope.errorPost= getRegister.errors.postcode;
                    $scope.errorCity = getRegister.errors.city;
                    $scope.errorMiddle = getRegister.errors.tussenvoegsel;
                    $scope.errorPost = getRegister.errors.postcode;
                    $scope.errorInitials = getRegister.errors.initials;
                
                    //usSpinnerService.stop('spinner-1');
					$scope.hide = "";
					//$scope.overlay="overlay";
                    $rootScope.globaloverlay = "";
                
                   
                    $(window).scrollTop(0);
            
    
                
				}	
            
            if(getRegister.success)
                {
                    $location.path('/regisconf');
                    
                    //usSpinnerService.stop('spinner-1');
					//$scope.overlay = "overlay";
                    $rootScope.globaloverlay = "";
                    
                    console.log(jsondata);
                }
		});
		
	}
  
    
}])


vdbApp.controller('regisconfCtrl', ['$scope','$rootScope','$window','usSpinnerService','$location', function ($scope,$rootScope,$window,usSpinnerService,$location) {
	
            	$scope.home = function(){
		        $location.path('/');
	                                   
                }
                                       
                                       
                                      }]);
 vdbApp.controller('commentSubmitCtrl', ['$scope','$route','$rootScope','$window','$routeParams','$location','usSpinnerService','commentSubmitService','commentService', function ($scope,$route,$rootScope,$window,$routeParams,$location,usSpinnerService,commentSubmitService,commentService) {
 	//comment Service :v
	$scope.commentSubmit = function( issueType ){
			// validation for issue type
			if(issueType == "problem"){
				$scope.tempIssueType = "problem";
			}
			else {
				$scope.tempIssueType = "reaction";
			}
			usSpinnerService.spin('spinner-2');
			var jsondata = JSON.stringify(
				{"user":{"username":""+$window.sessionStorage.username+"",
				"password_hash":""+$window.sessionStorage.password_hash+""
				},
				"issue_id":""+$routeParams.id+"",
				"type":""+$scope.tempIssueType+"",
				"body":""+$scope.comment+""
			});

			var getCommentSubmit = commentSubmitService.getCommentSubmit( jsondata ).then(function (data){
				var getCommentSubmit = data.data;
				if(!getCommentSubmit.success){
				usSpinnerService.stop('spinner-2');
				}
				else{
				usSpinnerService.stop('spinner-2');
				$scope.dissmissModal="modal";
				//bad practice hide modal
				$('#StemModal').modal('hide');
				$('.modal-backdrop').hide();
				var commentjsondata = JSON.stringify({"issue_id" : ""+$routeParams.id+""});
				var getComment = commentService.getComment( commentjsondata ).then(function (data){
					var getComment = data.data;
					$rootScope.commentList = getComment.comments;
	});
				}

			})
			
	}
	$scope.close = function(){
		$scope.hide="ng-hide";
	}
 }])

vdbApp.controller('forgotCtrl', ['$scope','$rootScope','$window','forgotService','usSpinnerService','$location', function ($scope,$rootScope,$window,forgotService,usSpinnerService,$location) { 
    $scope.hide = "ng-hide";
    $scope.overlay="overlay";
    
    
        
    
    $scope.forgotpass = function(){
//        usSpinnerService.spin('spinner-1');
//        $scope.overlay = "overlayactive";
        $rootScope.globaloverlay = "active";
        
         $scope.overlay = "overlayactive";
		var jsondata = JSON.stringify({"email":""+$scope.femail+""});
        
        $rootScope.tempemail1=$scope.femail;
        console.log($rootScope.tempemail1);
      
    
     var getForgot = forgotService.getForgot(jsondata).then(function (data){
         
				var getForgot = data.data;
                console.log(getForgot.error);
                $scope.errorFEmail = ""
                console.log(getForgot)
                
                
                if (getForgot.success=="false"){
                $scope.errorFEmail = getForgot.error;
                usSpinnerService.stop("spinner-1");
                $scope.overlay="overlay";
                $scope.hide = "";
                }

                else{
                        
                        $location.path('/forgotconf');
                        
                    }
               

                
//         usSpinnerService.stop('spinner-1');
//					$scope.overlay = "overlay";
         $rootScope.globaloverlay = "";
         });
        
        
    }
    
    $scope.close = function(){
		$scope.hide="ng-hide";
        
         
	}
  
}])
	
                            
 
vdbApp.controller('forgotconfCtrl', ['$scope','$rootScope','$window','usSpinnerService','$location', function ($scope,$rootScope,$window,usSpinnerService,$location) {
	
            	$scope.home = function(){
		        $location.path('/');
	                                   
                }
                        
}]);



    
vdbApp.controller('profileCtrl', ['$scope','$rootScope','$window','profileService','loginService','$location','usSpinnerService', function ($scope,$rootScope,$window,profileService,loginService,$location,usSpinnerService) {
	    $scope.hide = "ng-hide";
        $scope.overlay="overlay";
	
                    
    
    
     $scope.home = function(){
		        $location.path('/');
	                                   
                }
	
	//error session
	if($rootScope.errorSession){
		$scope.hide = "";
	}
    
    $scope.username = $window.sessionStorage.username ;
    $scope.email = $window.sessionStorage.email;
    if($window.sessionStorage.sex == 'man')
        {
            $scope.selected1=1;
            $scope.selected2=0;
        }
    else{
            
            $scope.selected2=1;
            $scope.selected1=0;
        
    }
    
    $scope.initials = $window.sessionStorage.initials;
    if($window.sessionStorage.tussenvoegsel == 'null')
        { 
            $scope.tussenvoegsel="";
        }
    else{
        $scope.tussenvoegsel = $window.sessionStorage.tussenvoegsel;
        }
    
    $scope.surname = $window.sessionStorage.surname;
    $scope.address = $window.sessionStorage.address;
    $scope.address_number = $window.sessionStorage.address_number;
    $scope.postcode = $window.sessionStorage.postcode;
    $scope.city = $window.sessionStorage.city;
    $scope.phone = $window.sessionStorage.phone;
    
   
    
    //console.log({user,password,user_profile});
	$scope.profile = function(){
    usSpinnerService.spin('spinner-1');
    $scope.overlay = "overlayactive";
    $scope.errorEmail ="";
    $scope.errorOldPassword =  "";
                    $scope.errorNewPassword = "";
                    $scope.errorInitials = "";
                    $scope.errorSurname = "";
                    $scope.errorAddress = "";
                    $scope.errorAddressN = "";
                    $scope.errorPostcode = "";
                    $scope.errorCity = "";
                    $scope.errorSex = "";
                    $scope.errorPasshash = "";
        
    $scope.hide = "ng-hide";
    
    var user={};
    user.username = $scope.username;
    user.password_hash = $window.sessionStorage.password_hash;
    
    var password={}
    if($scope.password_old!= null)
        {
            password.password_old = $scope.password_old;        
        }
    if($scope.password_new!= null)
        {
            password.password_new = $scope.password_new;        
        }
    
    var user_profile ={}
    
    if($scope.initials!=null)
        {
            user_profile.initials = $scope.initials;
        }
    if($scope.tussenvoegsel!=null)
        {
            user_profile.tussenvoegsel = $scope.tussenvoegsel;
        }
    if($scope.surname!=null)
        {
            user_profile.surname = $scope.surname;
        }
    if($scope.email!=null)
        {
            user_profile.email = $scope.email;
        }
    if($scope.sex!=null)
        {
            user_profile.sex = $scope.sex;
        }
    if($scope.address_old!=null)
        {
            user_profile.address_old = $scope.address_old;
        }
    if($scope.address!=null)
        {
            user_profile.address = $scope.address;
        }
    if($scope.address_number!=null)
        {
            user_profile.address_number = $scope.address_number;
        }
    if($scope.address_suffix!=null)
        {
            user_profile.address_suffix = $scope.address_suffix;
        }
    if($scope.postcode!=null)
        {
            user_profile.postcode = $scope.postcode;
        }
    if($scope.city!=null)
        {
            user_profile.city = $scope.city;
        }
    if($scope.phone!=null)
        {
            user_profile.phone = $scope.phone;
        }
    
    
    
        
        
		var jsondata = JSON.stringify({user,password,user_profile});
        console.log(jsondata)
		var getProfile = profileService.getProfile(jsondata).then(function (data){
            
                var getProfile = data.data;
            
            
            
				if (getProfile.success==false){
                    
                    $scope.errorEmail = getProfile.errors.email;
                    $scope.errorOldPassword =  getProfile.errors.password_old;
                    $scope.errorNewPassword = getProfile.errors.password_new;
                    $scope.errorInitials = getProfile.errors.initials;
                    $scope.errorSurname = getProfile.errors.surname;
                    $scope.errorAddress = getProfile.errors.address;
                    $scope.errorAddressN = getProfile.errors.address_number;
                    $scope.errorPostcode = getProfile.errors.postcode;
                    $scope.errorCity = getProfile.errors.city;
                    $scope.errorSex = getProfile.errors.sex;
                    $scope.errorPasshash = getProfile.errors.password_hash;
                                    
                    usSpinnerService.stop('spinner-1');
					$scope.hide = "";
                    $scope.successAlert = "";
                    $scope.successClass = "";
					$scope.overlay="overlay";
                     $(window).scrollTop(0);

				}	

            
            
            else if(getProfile.success)
                
                {
                    
                    if($scope.password_old !=null && $scope.password_new !=null ){
                        var password = $scope.password_new;
                        var jsondatalogin = JSON.stringify({"user":{"username":""+$window.sessionStorage.username+"",password}});
                    }else{
                        var password_hash = $window.sessionStorage.password_hash;
                        var jsondatalogin = JSON.stringify({"user":{"username":""+$window.sessionStorage.username+"",password_hash}});
                    }
                    console.log($window.sessionStorage.password_hash)
                    
                    console.log(jsondatalogin);
                    var getLogin = loginService.getLogin(jsondatalogin).then(function (data){
				    var getLogin = data.data;
                    
                    console.log(getLogin);
                    $window.sessionStorage.sex = getLogin.user_profile.sex;
                    $window.sessionStorage.initials = getLogin.user_profile.initials;
                    $window.sessionStorage.tussenvoegsel = getLogin.user_profile.tussenvoegsel;
                    $window.sessionStorage.surname = getLogin.user_profile.surname;
                    $window.sessionStorage.address = getLogin.user_profile.address;
                    $window.sessionStorage.address_number = getLogin.user_profile.address_number;
                    $window.sessionStorage.postcode = getLogin.user_profile.postcode;
                    $window.sessionStorage.city = getLogin.user_profile.city;
                    $window.sessionStorage.phone = getLogin.user_profile.phone;
                    usSpinnerService.stop('spinner-1');
					$scope.overlay = "overlay";
                    
                    $(window).scrollTop(0);
                    $scope.successAlert = "Profiel geüpdatet";
                    $scope.successClass = "successAlert";
                    $scope.hide = "";
                        
//                    $location.path('/profile');
                    
                    //console.log(jsondata);
                })
            
            }
//                         usSpinnerService.stop('spinner-1');
//                         $scope.overlay = "overlayactive";
            
		});
		
        $scope.close = function(){
		$scope.hide="ng-hide";
        }
	}
  
    
}])

vdbApp.controller('createissueCtrl', ['$scope','$rootScope','$window','$timeout','categoriesService','issueSubmitService','myIssuesService','$location','issuesService', function ($scope,$rootScope,$window,$timeout,categoriesService,issueSubmitService,myIssuesService,$location,issuesService) {	
		$scope.hide = "ng-hide";
		$scope.issueName = "Probleem"
		$scope.hideProblem = ""
		$scope.hideIssue = 1;
		$scope.slide = "";
		
		menuSelected($rootScope,'createissue');
		
		if(!$window.sessionStorage.username){
			$location.path("/login");
		}
		$scope.hideMyIssue = "ng-hide";
		//show my issue
		var jsondata = JSON.stringify({"user":{ "username":""+$window.sessionStorage.username+"",
												"password_hash":""+$window.sessionStorage.password_hash+""

											}});
		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			var count = getdata.count;
			$scope.myIssuesList = getdata.issues;
		})
		//first initial
		$timeout(function(){
			if(latlngChange){
			googleMapCreateProblem(latlngChange);
			googleMapCreateIdea(latlngChange);
			latlngChange = null;
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
			});

			}else{
			latlngChange = {lat: 52.158367,lng: 4.492999};
			googleMapCreateProblem(latlngChange);
			googleMapCreateIdea(latlngChange);
			latlngChange = null;
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
			});
		}
		},1200);
		
		$scope.categoriesData = function(){
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			$timeout(function(){
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
			});	
			},0)
		}


		if($window.sessionStorage.username){
			$scope.hideNonLogin = "ng-hide"
		}
		$scope.clickSearchCreateIssue= function(){
			geocodeAddressCreateProblem(geocoder, map3, $scope.searchCityCreate);
			geocodeAddressCreateProblem(geocoder, map4, $scope.searchCityCreate);
			city.long_name = $scope.searchCityCreate;
	 		var latitude = markerLat;
			var longitude = markerLng;

			var jsondataCity = JSON.stringify({latitude,longitude});
			$timeout(function(){
				var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
				});
				var jsondata = JSON.stringify({"coords_criterium":{
														  	"max_lat":maxlat,
														    "min_lat":minlat,
														    "max_long":maxlng,
														    "min_long":minlng
														  }
														});
			getIssues = issuesService.getIssues( jsondata ).then(function (data){
			var getdata = data.data;
			if(getdata.count != 0 || !getdata){
			$window.issuesData = getdata;
			showIssue(infoWindow,infoWindowContent);
			}
			});
		},1000)
			 

		}
		$scope.createIssue = function(){
			$rootScope.globaloverlay = "active";
			$scope.errorTitle = "";
			$scope.errorDescription = "";
			$scope.errorId = "";
			$scope.errorIdStyle = "";
			//initial data for request
			var user = {};
			var issue = {};
			var location = {};

			//login
			user.username = $window.sessionStorage.username;
			user.password_hash = $window.sessionStorage.password_hash;

			//description
			issue.type = "problem";
			if($scope.categoryId){
			issue.category_id = $scope.categoryId;	
			}else{
			issue.category_id = -1;	
			}
			
			if($scope.title){
				issue.title = $scope.title;
			}
			else {
				issue.title = "";
			}
			if($scope.description){
				issue.description = $scope.description;
			}
			else{
				issue.description = "";
			}
			//location
			location.latitude = markerLat;
			location.longitude = markerLng;
			console.log(location.latitude);
			console.log(location.longitude);
			
			var jsondataSubmit = JSON.stringify({user,issue,location});
			
			var getIssueSubmit = issueSubmitService.getIssueSubmit( jsondataSubmit ).then(function (data){
				var issueData = data.data;
				console.log(issueData);
				if(!issueData.success){
					$scope.hide = "";
					if(issueData.errors.title){
						$scope.errorTitle ="Onderwerp "+issueData.errors.title;
					}
					if(issueData.errors.description){
						$scope.errorDescription ="Beschrijving "+issueData.errors.description;
					}
					if(issueData.errors.category_id){
						$scope.errorId = issueData.errors.category_id;
						$scope.errorIdStyle = 'border-color: #a94442';
						console.log($scope.errorIdStyle);
					}
					if(issueData.errors.location){
						$scope.errorLocation =issueData.errors.location;
					}
					$rootScope.globaloverlay = "";
					

				}
				else{
					//success
					var issueId = issueData.issue_id;
					$location.path(/myIssues/+issueId);
					$rootScope.globaloverlay = "";

				}

			});
			
			
		}
		$scope.createIdea = function(){
			$rootScope.globaloverlay = "active";
			$scope.errorTitle = "";
			$scope.errorDescription = "";
			$scope.errorId = "";
			$scope.errorIdStyle = "";
			//initial data for request
			var user = {};
			var issue = {};
			var location = {};

			//login
			user.username = $window.sessionStorage.username;
			user.password_hash = $window.sessionStorage.password_hash;

			//description
			issue.type = "idea";
			if($scope.ideaRealization){
				issue.realization = $scope.ideaRealization;
			}
			else{
				issue.realization = "";
			}
			
			if($scope.ideaTitle){
				issue.title = $scope.ideaTitle;
			}
			else {
				issue.title = "";
			}
			if($scope.ideaDescription){
				issue.description = $scope.ideaDescription;
			}
			else{
				issue.description = "";
			}
			//location
			location.latitude = markerLat;
			location.longitude = markerLng;
			console.log(location.latitude);
			console.log(location.longitude);
			var jsondataSubmit = JSON.stringify({user,issue,location});
			console.log(jsondataSubmit);
			var getIssueSubmit = issueSubmitService.getIssueSubmit( jsondataSubmit ).then(function (data){
				var issueData = data.data;
				console.log(issueData);
				if(!issueData.success){
					$scope.hide = "";
					if(issueData.errors.title){
						$scope.errorTitle ="Onderwerp "+issueData.errors.title;
					}
					if(issueData.errors.description){
						$scope.errorDescription ="Beschrijving "+issueData.errors.description;
					}
					if(issueData.errors.category_id){
						$scope.errorRealization ="Realisatie "+issueData.errors.realization;
					}
					if(issueData.errors.location){
						$scope.errorLocation =issueData.errors.location;
					}
					
					$rootScope.globaloverlay = "";

				}
				else{
					//success
					var issueId = issueData.issue_id;
					$location.path(/myIssues/+issueId);
					$rootScope.globaloverlay = "";

				}

			});
			
			
		}
		$scope.close = function(){
			$scope.hide = "ng-hide";
		}
		$scope.reset = function(){
			$scope.title = "";
			$scope.description = "";
		}
		//switch bar change
		$scope.switchButton = function (){
			if($scope.hideIssue ==1 ){
				$scope.hideIssue = 0;
				$scope.issueName = "Idee";
				$scope.slide = "toggle-button-selected";
			}else{
				$scope.hideIssue = 1;
				$scope.issueName = "Probleem";
				$scope.slide = "";
				}
			$timeout(function(){
				google.maps.event.trigger(map4,'resize');
				google.maps.event.trigger(map3,'resize');
			},0)
			
		}
				
		

}])

	

