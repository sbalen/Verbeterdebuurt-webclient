var vdbApp = angular.module('vdbApp', ['ngRoute','angularSpinner','angularUtils.directives.dirPagination','ngFacebook','ngCookies','naif.base64','satellizer'])
var APIURL = "https://staging.verbeterdebuurt.nl/api.php/json_1_3/";
var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow();
var infoWindowContent = [];
var latlngChange;
var marker;
var map;
postalcode = null;
//define service
var issuesService = new Object();
var registerService = new Object();
var loginService  = new Object();
var reportService = new Object();
var commentService = new Object();
var forgotService = new Object();
var myIssuesService = new Object();
var commentSubmitService = new Object();
var profileService = new Object();
var workLogService = new Object();
var categoriesService = new Object();
var issueSubmitService = new Object();
var voteSubmitService = new Object();
var syncFBService = new Object();
var loginFBService = new Object();
var statusChangeService = new Object();
var issueLogService = new Object();
var newsletterService = new Object();
var agreementSevice = new Object();
var duplicateIssuesService = new Object();
var getIssueService = new Object();




//google map
window.onload = function(){
	var browserSupportFlag =  new Boolean();
	//SUPPORT GEOLOCATION
	if(navigator.geolocation) {
    	browserSupportFlag = true;
    	navigator.geolocation.getCurrentPosition(function(position){
					      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
					      console.log(initialLocation);
   							});
					  		}
  // Browser doesn't support Geolocation
							  else {
					
							  }
      var mainLat = 52.158367;
      var mainLng = 4.492999;
      this._map_center = {lat: mainLat , lng: mainLng};
      //this._marker_positions = [{lat: 27.1959742, lng: 78.02423269999100}, {lat: 27.1959733, lng: 78.02423269999992}] ;
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
          position :google.maps.ControlPosition.RIGHT_BOTTOM },
        styles: [
				    {
				        featureType: "poi",
				        elementType: "labels",
				        stylers:[
				              { visibility: "off" }
				        		]
				    }
			    ]

      };
     map = new google.maps.Map(document.getElementById('googlemaps'), mapOptions);
     getLocation(map);
     var geocoder = new google.maps.Geocoder();
     maxlat  = 52.17899981092104;
     maxlng  = 52.15154422875919;
     minlat = 4.545096343219029;
     minlng = 4.487203543841588;
		

     if(cityName!=null){
        geocodeAddress(geocoder, map);
        cityName=null;
     }
     else if(postalcode!=null){
     	geocodeAddress(geocoder, map);
        postalcode=null;
     }
  	 getLatLng(map);
      //start location picker
    
}
function getLatLng (map){
	google.maps.event.addListener(map,'bounds_changed',function(){
		latlngChange = map.getCenter();
	})
}
function googleMapIssue(lat,lng,type){
	var location = {lat: lat , lng: lng};
	var iconImg = "";
	
	console.log(type);
	if(type==="problem"){
        iconImg = "/img/icon_2_42_42.png";
    }else if(type==="idea"){
        iconImg = "/img/icon_idea_2_42_42.png";
    }

	var mapOption2 = {
		center : location,
		zoom : 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
				    {
				        featureType: "poi",
				        elementType: "labels",
				        stylers:[
				              { visibility: "off" }
				        		]
				    }
			    ]
		
	}
	var markerOption2 = {
		 position : location,
		 icon : iconImg
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
		mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
				    {
				        featureType: "poi",
				        elementType: "labels",
				        stylers:[
				              { visibility: "off" }
				        		]
				    }
			    ]
	}
	 map3 = new google.maps.Map(document.getElementById("googleMapCreateProblem"),mapOption3);
	 marker = new google.maps.Marker();
	 marker.setMap(map3);
	 marker.setPosition(map3.getCenter());
	 marker.setOptions({draggable:true,icon:"/img/icon_2_42_42.png"});
	 map3.setOptions({draggable:true,zoomControl:true,scrollwheel: false, disableDoubleClickZoom: true,streetViewControl: false,disableDefaultUI:true});
	 markerLat = marker.getPosition().lat();
	 markerLng = marker.getPosition().lng();
	 console.log("problem"+map3.getCenter().lat()+" "+map3.getCenter().lng());
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
		mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
				    {
				        featureType: "poi",
				        elementType: "labels",
				        stylers:[
				              { visibility: "off" }
				        		]
				    }
			    ]
	}
	 map4 = new google.maps.Map(document.getElementById("googleMapCreateIdea"),mapOption4);
	 marker = new google.maps.Marker();
	 marker.setMap(map4);
	 marker.setPosition(map4.getCenter());
	 marker.setOptions({draggable:true,icon:"/img/icon_idea_2_42_42.png"});
	 map4.setOptions({draggable:true,zoomControl:true,scrollwheel: false, disableDoubleClickZoom: true,streetViewControl: false,disableDefaultUI:true});
	 markerLat = marker.getPosition().lat();
	 markerLng = marker.getPosition().lng();
	 console.log("idea"+map4.getCenter().lat()+" "+map4.getCenter().lng());
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
        geocoder.geocode({'latLng': marker.getPosition()} , function (result , status) {
			if (status == google.maps.GeocoderStatus.OK) {
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


vdbApp.config(['$routeProvider','$locationProvider','$httpProvider','$sceDelegateProvider','$authProvider', function ($routeProvider,$locationProvider,$httpProvider,$sceDelegateProvider,$authProvider) {


    $authProvider.facebook({
      clientId: '1622145028109341'
    });

	$routeProvider
	.when('/', {
		templateUrl: 'map.html',
		controller : 'mainCtrl'
	})
	// .when('/:cityNameClone',{
	// 	templateUrl: 'map.html',
	// 	controller : 'mainCtrl'
	// })
    .when('/gemeente/:cityName', {
		templateUrl: 'map.html',
		controller : 'mainCtrl' 
	})
	.when('/plaats/:cityNameplaats',{
		templateUrl: 'map.html',
		controller : 'mainCtrl'
	})
	.when('/postcode/:postalcode', {
		templateUrl: 'map.html',
		controller:  'mainCtrl'
	})
    .when('/melding/:id',{
		templateUrl :'issuesView.html',
		controller : 'issuesCtrl'
	})
	.when('/mention', {
		templateUrl: 'mention.html',
		controller : 'mentionCtrl'
	})

    .when('/mijn-meldingen', {
		templateUrl: 'myissues.html',
		controller : 'myIssuesCtrl'	
	})
    .when('/mijn-meldingen/:id', {
		templateUrl: 'myIssueDetail.html',
		controller: 'myIssuesDetailCtrl'
	})
    .when('/login', {
		templateUrl: 'login.html'
		
	})
    .when('/registreren', {
		templateUrl: 'register.html'
    })
	.when('/ondernemingsdossier_landingpage', {
		templateUrl: 'ondernemingsdossier.html'
	})    
    .when('/bevestiging-registratie',{
        templateUrl: 'regisconf.html',
        controller : 'regisconfCtrl'
	})
    .when('/wachtwoord',{
        templateUrl: 'forgotpass.html',
        controller : 'forgotCtrl'
	})
    .when('/bevestiging-wachtwoord-vergeten',{
        templateUrl: 'forgotconf.html',
        controller : 'forgotconfCtrl'
	})
    .when('/nieuwe-melding',{
        templateUrl: 'selectproblem.html',
        controller : 'createissueCtrl'
	})
     .when('/nieuwe-probleem',{
        templateUrl: 'createissues.html',
        controller : 'createissueCtrl'
	})
	.when('/nieuwe-idea',{
		templateUrl: 'createIdea.html',
		controller : 'createIdeaCtrl'
	})
    .when('/mijn-verbeterdebuurt',{
        templateUrl: 'profile.html',
        controller : 'profileCtrl'
	})
    //handle the hash sessions
    
    //confirm the vote
    .when('/stem/bevestigen/:hashkey',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "confirm_vote";
                return true; 
            }
        }
    })
    //confirm the issue
    //melding/new/34811/45a608c242f9a1e1f1f1e019909d5ac7a1317d9f
    .when('/melding/bevestigen/hash/:hashkey',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "confirm_issue";
                return true; 
            }
        }
    })
    //delete the issue
    //melding/verwijderen/0c0cf551ffc5ade859457961cfbd54af505300f0
    .when('/melding/verwijderen/:hashkey',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "delete_issue";
                return true; 
            }
        }
    })
    //resolve issue with no comment
    //melding/is-opgelost/e9db97963ab54a5a508455d9c43e7b842e865b62/methode/afwijzen
    .when('/melding/is-opgelost/:hashkey/methode/afwijzen',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "resolve_issue_with_comment_no";
                return true; 
            }
        }
    })
    //resolve issue with comment yes
    ///melding/is-opgelost/e9db97963ab54a5a508455d9c43e7b842e865b62/methode/oplossen
    .when('/melding/is-opgelost/:hashkey/methode/oplossen',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "resolve_issue_with_comment_yes";
                return true; 
            }
        }
    })
    //close issue
    ///melding/afsluiten/8f83b0a2992c059248f5f938baa780739ec2952a
    .when('/melding/afsluiten/:hashkey',{
        templateUrl: 'map.html',
        controller : 'hashCtrl',
        resolve: {
            targetAction: function($rootScope) { 
                $rootScope.targetAction = "close_issue";
                return true; 
            }
        }
    })
    
	 $locationProvider.html5Mode(true);
	 $sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self'
	]);
}]);

vdbApp.directive('imgUpload', ['$parse',function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			 var model = $parse(attrs.imgUpload);
             var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
			
		}
	};
}])

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

vdbApp.factory('newsletterService', ['$http',function ($http) {
		return {
			getNewsletter : function( jsonnewsletter ){
				return $http.post(APIURL+'subscribeNewsletter', jsonnewsletter)
				.success(function(data){
					if(angular.isObject(data)){
						newsletterService.data=data;
						return newsletterService.data;
					}
				});
				return newsletterService.data;
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

vdbApp.factory('syncFBService', ['$http',function ($http) {
    return {
        getFBSync : function( jsondata ){
            return $http.post(APIURL+'connectFacebook', jsondata)
                .success(function(data){
                if(angular.isObject(data)){
                    syncFBService.data=data;
                    return syncFBService.data;
                }
            });
            return syncFBService.data;
        }
    };
}])

vdbApp.factory('loginFBService', ['$http',function ($http) {
    return {
        getFBLogin : function( jsondata ){
            return $http.post(APIURL+'connectFacebook', jsondata)
                .success(function(data){
                if(angular.isObject(data)){
                    loginFBService.data=data;
                    return loginFBService.data;
                }
            });
            return loginFBService.data;
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
						console.log(data);
						issueSubmitService.data = data;
						return issueSubmitService.data;
				});
				return issueSubmitService.data;
			}
	};
}])

vdbApp.factory('issueSubmitServiceWithImage', ['$http',function ($http) {
	return{
		getIssueSubmit : function(jsondata,img){
			var dataForm = new FormData();
			dataForm.append('json',jsondata);
			dataForm.append('image',img);
			return $http.post(APIURL+'issueSubmit',dataForm,{
				transformRequest: angular.identity,
				headers:{'Content-Type' : undefined}
			})
			.success(function(data,headers){
				console.log(data);
				console.log(headers);
			})
		}

	}
}]);

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

vdbApp.factory('statusChangeService', ['$http',function ($http) {
	return {
			getStatusChange : function (jsondata){
				return $http.post(APIURL+'statusChange',jsondata)
				.success(function (data){
					statusChangeService.data = data;
					return statusChangeService.data;
				})
				return statusChangeService.data;
			}
	};
}])

vdbApp.factory('issueLogService', ['$http',function ($http) {
	return {
			getIssueLog : function (jsondata){
				return $http.post(APIURL+'issueLog',jsondata)
				.success(function (data){
					issueLogService.data = data;
					return issueLogService.data;
				});
				return issueLogService.data;
			}
	};
}])

vdbApp.factory('agreementSevice', ['$http',function ($http) {
	return {
			getAgreement : function(jsondata){
				return $http.post(APIURL+'agreement',jsondata)
				.success(function (data){
					agreementSevice.data = data;
					return agreementSevice.data;
				});
				return agreementSevice.data;
			}
	};
}])

vdbApp.factory('duplicateIssuesService', ['$http',function ($http) {
	return {
			getDuplicateIssue : function(jsondata){
				return $http.post(APIURL+'duplicateIssues',jsondata)
				.success(function (data){
					duplicateIssuesService.data = data;
					return duplicateIssuesService.data;
				});
				return duplicateIssuesService.data;
			}
	};
}])

vdbApp.factory('getIssueService', ['$http',function ($http) {
    return {
        getIssue : function(jsondata){
            return $http.post(APIURL+'issueForHash',jsondata)
                .success(function (data){
                duplicateIssuesService.data = data;
                return getIssueService.data;
            });
            return getIssueService.data;
        }
    };
}])


vdbApp.run(['$rootScope', '$window', function($rootScope, $window) {
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        $rootScope.$on('fb.load', function() {
            $window.dispatchEvent(new Event('fb.load'));
        });
    
    }]);

vdbApp.controller('mainCtrl', ['$scope','$timeout','$window','$location','$rootScope','$routeParams','$http','issuesService','reportService', '$facebook','$cacheFactory','agreementSevice','$cookies',function ($scope,$timeout,$window,$location,$rootScope,$routeParams,$http,issuesService,reportService,$facebook,$cacheFactory,agreementSevice,$cookies) {
						 
                        menuSelected($rootScope,'home');
                        //$scope.hideLogo = 1;
                        //google map aouto complete
						var input = document.getElementById('searchCity');
							var options = {
							  types: ['(cities)'],
							  componentRestrictions: {country: 'nl'}
							};

							var autocomplete = new google.maps.places.Autocomplete(input, options);

							
							if($location.path()== "/plaats/"+$routeParams.cityNameplaats){
							$location.path('gemeente/'+$routeParams.cityNameplaats);
							}

							// if($location.path()=="/"+$routeParams.cityNameClone){
							// 	$location.path('gemeente/'+$routeParams.cityNameClone);
							// 	}
						
								
	                        
	                        $scope.userpanel=1;
	    					console.log($rootScope.lastCity);
	    					console.log($routeParams.cityName);
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
						},3000);
						if(!$routeParams.cityName){
						if(!$rootScope.lastCity){
							var jsoncity = JSON.stringify({"council":"Leiden"});	
						}
						else if($rootScope.lastCity){
							var jsoncity = JSON.stringify({"council":""+$rootScope.lastCity+""});
						}
						}
						else{
							var jsoncity = JSON.stringify({"council":""+$routeParams.cityName+""});
						}
						//send data to google map api for city
						$rootScope.urlBefore = $location.path();
						$window.cityName = $routeParams.cityName;
						if($routeParams.cityName){
							$scope.searchCity = $routeParams.cityName;
						}
						$rootScope.errorSession="";

						//promise for make asyncronise data factory to be syncronis first load
						var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
						});

						var getAgreement = agreementSevice.getAgreement (jsoncity).then(function(data){
								var getdata = data.data;
								$rootScope.agreement = getdata;
								$timeout(function(){
									if(!getdata.logo){
									$rootScope.hideLogo = 1;
								}
								else{
									$rootScope.hideLogo = 0;
									console.log($scope.hideLogo);	
								}
								})
								
						});
						//with postal code load
						if($routeParams.postalcode){
							$window.postalcode = $routeParams.postalcode;
							$timeout(function(){
								
									var jsoncity = JSON.stringify({"council":""+citynamegoogle.long_name+""});
							console.log(jsoncity);
							var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
							});

							var getAgreement = agreementSevice.getAgreement (jsoncity).then(function(data){
								var getdata = data.data;
								$rootScope.agreement = getdata;
								$timeout(function(){
									if(!getdata.logo){
									$rootScope.hideLogo = 1;
									console.log($scope.hideLogo);
								}
								else{
									$rootScope.hideLogo = 0;
									console.log($scope.hideLogo);	
								}
								})
								
						});
								
							},3000)
						}
						
						//click function at map
						$scope.alrCity = function(){
								if($window.city.long_name !=null){
							
							//url change validation	
                                if($location.path().includes("/gemeente/") || $location.path().endsWith("/") ){
                                if($rootScope.lastCity !=null){
                                	$location.path("/gemeente/"+$rootScope.lastCity);
                                	$rootScope.lastCity=null;
                                	console.log("baca");

                                }else{
                                	 $location.path("/gemeente/"+$window.city.long_name);
                                }
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
								var getAgreement = agreementSevice.getAgreement (jsoncity).then(function(data){
								var getdata = data.data;
								$rootScope.agreement = getdata;
								$timeout(function(){
									if(!getdata.logo){
									$rootScope.hideLogo = 1;
									console.log("hide");
								}
								else{
									$rootScope.hideLogo = 0;
									console.log("nothide");	
								}
								})
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
							if($cookies.getObject('user') == null ){
								return false;
							}
							else{
								$rootScope.lusername = $cookies.getObject('user').username;
                               
                                
								return true;
							}
						}
                        
                        
                       
                        
                        
						//logOut
						$scope.logout = function(){
							$cookies.remove('user');
							$cookies.remove('user_profile');
                           // $('.dropdown-menu').hide();
                            $scope.userpanel=0;
                            
                            
                            $scope.fbstatus = $facebook.isConnected();
                            if($scope.fbstatus) {
                                $facebook.logout();
                            }
                            
                            $location.path('/');
						}
                        
                        $scope.showuserpanel= function(){
                           
                            if($scope.userpanel==0)
                                $scope.userpanel=1;
                            
                        //    $('.dropdown-menu').show();
                            
                        }
                        
                        
						//search
						$scope.clickSearch= function(){	
							$rootScope.globaloverlay = "active";
							console.log($scope.searchCity);
							$window.cityName = null;
							//$rootScope.lastCity = city.long_name;
							geocodeAddress(geocoder, map);
							$timeout(function(){
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
							var jsoncity = JSON.stringify({"council":""+citynamegoogle.short_name+""})
							console.log(jsoncity);
							var getReport = reportService.getReport( jsoncity ).then(function (data){
								var getdata = data.data;
								$rootScope.reportList = getdata.report;
							});
							var getAgreement = agreementSevice.getAgreement (jsoncity).then(function(data){
								var getdata = data.data;
								$rootScope.agreement = getdata;
								$rootScope.globaloverlay = "";
								$timeout(function(){
									if(!getdata.logo){
									$rootScope.hideLogo = 1;
									console.log("hide");
								}
								else{
									$rootScope.hideLogo = 0;
									console.log("nothide");	
								}
								})
								});
                            $location.path("gemeente/"+citynamegoogle.long_name);
                            $rootScope.lastCity = citynamegoogle.long_name;
							},3000)
							
                    
						}
						//move page
						$scope.clickMenu = function(selected){
								if(selected == "myissues"|| selected == "createissue"){
									if(!$cookies.getObject('user')){
										if(selected == 'myissues'){
											$rootScope.urlBefore = "/mijn-meldingen";
											menuSelected($rootScope,'myIssues');
											$location.path('/'+"login");
										}
										if( selected == 'createissue'){
											$rootScope.urlBefore = "/nieuwe-melding";
											menuSelected($rootScope,'createissue');
											$location.path('/nieuwe-melding');
										}
									}
									else{
                                        if(selected == "createissue"){
                                            $location.path('/nieuwe-melding');
                                        
                                        }else if(selected == "myissues"){
                                            $location.path('/mijn-meldingen');
                                        }else{
                
                                            $location.path('/'+selected);    
                                        }
        
											
									}
								}else{
										$location.path('/'+selected);	
								} 
								
						}


						
					}]);
//Retrieving issues




// vdbApp.controller('mainCtrl', ['$scope','issues', function ($scope,issues) {

// }]);



vdbApp.controller('issuesCtrl', ['$scope','$rootScope','$window','$routeParams','issuesService','reportService','usSpinnerService','$location','$anchorScroll','issueLogService','commentService','$timeout','voteSubmitService','$cookies', function ($scope,$rootScope,$window,$routeParams,issuesService,reportService,usSpinnerService,$location,$anchorScroll,issueLogService,commentService,$timeout,voteSubmitService,$cookies) {
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
		if(!$cookies.getObject('user')){
			$location.path("/login");
			$scope.stemModal = "";
			$rootScope.errorSession="Voor deze actie moet je ingelogd zijn."
		}
		else{
			$scope.stemModal = "#StemModal";
		}	
	};

	//validation for submit vote
	$scope.voteSubmit = function(){
		if(!$cookies.getObject('user')){
			$location.path("/login");
			$rootScope.errorSession="Voor deze actie moet je ingelogd zijn."
		}
		else{
			$rootScope.globaloverlay = "active";
			var jsonVoteSubmit = JSON.stringify({"user":{
														"username":""+$cookies.getObject('user').username+"",
													    "password_hash":""+$cookies.getObject('user').password_hash+""
													  },
													  "issue_id":$routeParams.id});
			console.log(jsonVoteSubmit);
			var getvoteSummit = voteSubmitService.getvoteSummit( jsonVoteSubmit ).then(function(data){
				var getvoteSummit = data.data;
				console.log(getvoteSummit);
				if(!getvoteSummit.success){
					$scope.hideError = 0;
					$scope.errorVote = ""+getvoteSummit.error+"";
					$(window).scrollTop(0);
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
    
    //facebook & twitter share
    $scope.sharefacebook = function(){
        var text=encodeURI($location.absUrl());
        var url = "http://www.facebook.com/sharer/sharer.php?u="+text;
        var win = window.open(url, '_blank');
        win.focus();
        
    }
    
    $scope.sharetwitter = function(){
        var text=encodeURI($location.absUrl());
        var url = "https://twitter.com/intent/tweet?text="+text;
        var win = window.open(url, '_blank');
        win.focus();
        
    }
    

	//googlemap
	$scope.googleMapIssue = function(lat,lng,type){
		googleMapIssue(lat,lng,type);
	}
	//hide log Status
	if($cookies.getObject('user')){
		var logjsondata = JSON.stringify({"user" : {
						"username":""+$cookies.getObject('user').username+"",
						"password_hash":""+$cookies.getObject('user').password_hash+""
					},
			"issue_id":""+$routeParams.id+""	
											});
		console.log(logjsondata);
		var getIssueLog = issueLogService.getIssueLog( logjsondata ).then(function (data){
				var getdata = data.data;
				if(!getdata.success){
					$scope.hideLogStatus = "ng-hide";
				}else if(getdata.success&&getdata.counts==0){
					$scope.hideLogStatus = "ng-hide";
				}else{
					$scope.hideLogStatus = "";
					$scope.issueLogList = getdata.logs;
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
	});''
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

vdbApp.controller('myIssuesCtrl', ['$scope','$rootScope','$window','$location','myIssuesService','$cookies', function ($scope,$rootScope,$window,$location,myIssuesService,$cookies) {
		$scope.hide = "";
		menuSelected($rootScope,'myIssues');

		$rootScope.currentPage = 1;
  		$scope.totalPage = 3;
		if($cookies.getObject('user')==null){
				$rootScope.urlBefore = $location.path();
				$location.path('/login');
		}
		var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""

											}});
		//to get hash password
		// console.log(jsondata);
		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			$rootScope.count = getdata.count;
			$rootScope.myIssuesList = getdata.issues;
		})
		$scope.myIssueDetailClick = function(id){
			$location.path("/mijn-meldingen/"+id);
		}
		
		$scope.getIdStatus = function(id){
			$rootScope.getStatusId = id;
		}
		
}])

vdbApp.controller('myIssuesDetailCtrl', ['$scope','$routeParams','$http','$rootScope','$location','$window','myIssuesService','usSpinnerService','issueLogService','commentService','voteSubmitService','$cookies', function ($scope,$routeParams,$http,$rootScope,$location,$window,myIssuesService,usSpinnerService,issueLogService,commentService,voteSubmitService,$cookies) {
		$scope.hide = "";
		$scope.hideStatus="ng-hide";
		$scope.errorVote = "";
		$scope.hideError = 1;
		menuSelected($rootScope,'myIssues');
		$rootScope.globaloverlay = "active";
		$scope.id = function(){
			return $routeParams.id;
		}
		if($cookies.getObject('user')==null){
				$rootScope.urlBefore = $location.path();
				$location.path('/login');
		}
		var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""

												}});

		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			$rootScope.count = getdata.count;
			$rootScope.myIssuesList = getdata.issues;
			$rootScope.globaloverlay = "";
		})
		$scope.id = function(){
		return $routeParams.id;
		}

		//call googlemap
		$scope.googleMapIssue = function(lat,lng,type){
		googleMapIssue(lat,lng,type);
		}

		//hidelog
		if($cookies.getObject('user')){
		var logjsondata = JSON.stringify({"user" : {
						"username":""+$cookies.getObject('user').username+"",
						"password_hash":""+$cookies.getObject('user').password_hash+""
					},
			"issue_id":""+$routeParams.id+""	
									});
		var getIssueLog = issueLogService.getIssueLog( logjsondata ).then(function (data){
				var getdata = data.data;
				if(!getdata.success){
					$scope.hideLogStatus = "ng-hide";
				}else if(getdata.success&&getdata.count==0){
					$scope.hideLogStatus = "ng-hide";
				}else{
					$scope.hideLogStatus = "";
					$scope.issueLogList = getdata.logs;
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
		if(!$cookies.getObject('user')){
			$location.path("/login");
			$scope.stemModal = "";
			$rootScope.errorSession="Voor deze actie moet je ingelogd zijn."
		}
		else{
			$scope.stemModal = "#StemModal";
		}	
		};

		//voteSubmit
		$scope.voteSubmit = function(){
		if(!$cookies.getObject('user')){
			$location.path("/login");
			$rootScope.errorSession="Voor deze actie moet je ingelogd zijn."
		}
		else{
			$rootScope.globaloverlay = "active";
			var jsonVoteSubmit = JSON.stringify({"user":{
														"username":""+$cookies.getObject('user').username+"",
													    "password_hash":""+$cookies.getObject('user').password_hash+""
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
						$rootScope.myIssuesList = getdata.issues;
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

vdbApp.controller('loginCtrl', ['$scope','$rootScope','$window','loginService','$location','usSpinnerService', '$facebook','$auth','$cookies', function ($scope,$rootScope,$window,loginService,$location,usSpinnerService,$facebook,$auth,$cookies) {
	$scope.hide = "ng-hide";
    $scope.lusername="";
    $scope.lpassword="";
    
	//$scope.overlay ACTIVE WHENclick and overlay when no event
	$scope.overlay="overlay";
	
	
	if($rootScope.urlBefore==null || $rootScope.urlBefore == '/login'){
			$rootScope.urlBefore='/' ;
	}
	if($cookies.getObject('user')!=null){
			$location.path('/');
	}
	
	//error session
	if($rootScope.errorSession){
		$scope.hide = "";
	}
    //remember me
    if($cookies.get('username') && $cookies.get('password')){
    	$scope.rememberMe = true;
    	$scope.lusername = $cookies.get('username');
    	$scope.lpassword = $cookies.get('password');
    }
    //facebook login
    //this is the function to do the login or do redirect to registration
    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.fbstatus = $facebook.isConnected();
        if($scope.fbstatus) {
          
            $facebook.api('/me?fields=first_name,last_name,email').then(function(user) {
                
                $rootScope.globaloverlay = "active";
                $scope.facebookuser = user;

                
                //here we create the json to login
                var facebookID = $scope.facebookuser.id;                
                var jsondata = JSON.stringify({"user":{facebookID}});
                
                console.log($scope.facebookuser);
                
                //console.log(jsondata);
                
                var getLogin = loginService.getLogin(jsondata).then(function (data){
                    
                    var result = data.data;
                    console.log(result);
                    if(!result.success){
                        //fix this if false
                        $location.path('/registreren');
                        //in here we already had our facebook session!
                        $window.sessionStorage.facebookID = $scope.facebookuser.id;
                        $window.sessionStorage.name = $scope.facebookuser.first_name;
                        $window.sessionStorage.email  = $scope.facebookuser.email;
                        $window.sessionStorage.surname =  $scope.facebookuser.last_name;
                        $rootScope.globaloverlay = "";
                        
                    }
                    else if (result.success){
                        //we got user data here, please log me in!
                        $cookies.putObject('user',result.user);
                        $cookies.putObject('user_profile',result.user_profile);
                        
                        $rootScope.loginStatus = function(){
                            return true;
                        }
                        $rootScope.globaloverlay = "";
                        $rootScope.errorSession="";
                        if($rootScope.urlBefore == '/registreren'){
                            $location.path('/map');
                        }
                        else{
                            $location.path($rootScope.urlBefore);
                        }

                        
                        
                    }
                    
                    
                    $rootScope.globaloverlay = "";
                    
                });
                
                
            });
        }
        else{
            
        }
    });
    
    $scope.FBlogin = function(){
        $facebook.login();
    }
    
    
    $scope.TWlogin = function(){
      console.log("Need to login with Twitter");
    }
    
    
    $scope.authenticate = function(provider) {
    	console.log('authenticate('+provider+')');
      $auth.authenticate(provider);
    };
    
    $scope.loginWithOndernemingsDossier = function(){
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({"ondernemingsdossierURL":""+$location.url()+""});
		console.log("jsondata:" +jsondata);
		var getLogin = loginService.getLogin(jsondata).then(function (data){
				var getLogin = data.data;

				if(!getLogin.success && getLogin.ondernemingsDossier != undefined) {
					//go to register with data prefilled
                    //fix this if false
					$scope.errorMessage = getLogin.error;
                    //in here we already had our facebook session!
					$scope.hide = "";
                    $rootScope.globaloverlay = "";
                    $location.path('/registreren');
                    $window.sessionStorage.ondernemingsdossierID = getLogin.ondernemingsDossier.ondernemingsdossierID;
                    $window.sessionStorage.name = getLogin.ondernemingsDossier.naam;
                    $window.sessionStorage.email  = getLogin.ondernemingsDossier.email;
                    $window.sessionStorage.postcode  = getLogin.ondernemingsDossier.postcode;
                    $window.sessionStorage.address_number =  getLogin.ondernemingsDossier.huisnummer;
                    $rootScope.errorSession = getLogin.error;

				} else if (!getLogin.success) {
					$scope.errorMessage = getLogin.error;
					$scope.hide = "";
                    $rootScope.globaloverlay = "";
				} else if (getLogin.success) {
					//this is the same code as login succes, better to separate?
					//temp for data session
					var expired = new Date();
                    expired.setDate(expired.getDate()+((1/24)*2));
                    console.log(expired);
					$cookies.putObject('user',getLogin.user,{expires:expired});
					$cookies.putObject('user_profile',getLogin.user_profile,{expires:expired});
					console.log($cookies.getObject('user'));
                   	//remember me
                   		if($scope.rememberMe === true){
                   			var expired = new Date();
		                    expired.setDate(expired.getDate()+7);
		                    console.log(expired);
                   			$cookies.put('username',$scope.lusername,{expires:expired});
                   			$cookies.put('password',$scope.lpassword,{expires:expired});
                   			$cookies.putObject('user',getLogin.user,{expires:expired});
							$cookies.putObject('user_profile',getLogin.user_profile,{expires:expired});
                   		}
                   		else{
                   			$cookies.remove('username');
                   			$cookies.remove('password');
                   		}
                
					$rootScope.loginStatus = function(){
						return true;
					}
                    $rootScope.globaloverlay = "";
					$rootScope.errorSession="";
                    if($rootScope.urlBefore == '/registreren'){
						$location.path('/map');
					}
					else{
						$location.path($rootScope.urlBefore);
					}
					
				}	
		})
		
	}

	$scope.login = function(){
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({"user":{"username":""+$scope.lusername+"","password":""+$scope.lpassword+""}});
		var getLogin = loginService.getLogin(jsondata).then(function (data){
				var getLogin = data.data;
				if(!getLogin.success){
					$scope.errorMessage = getLogin.error;
					$scope.hide = "";
                    $rootScope.globaloverlay = "";
				}else if(getLogin.success){
					//temp for data session
					var expired = new Date();
                    expired.setDate(expired.getDate()+((1/24)*2));
                    console.log(expired);
					$cookies.putObject('user',getLogin.user,{expires:expired});
					$cookies.putObject('user_profile',getLogin.user_profile,{expires:expired});
					console.log($cookies.getObject('user'));
                   	//remember me
                   		if($scope.rememberMe === true){
                   			var expired = new Date();
		                    expired.setDate(expired.getDate()+7);
		                    console.log(expired);
                   			$cookies.put('username',$scope.lusername,{expires:expired});
                   			$cookies.put('password',$scope.lpassword,{expires:expired});
                   			$cookies.putObject('user',getLogin.user,{expires:expired});
							$cookies.putObject('user_profile',getLogin.user_profile,{expires:expired});
                   		}
                   		else{
                   			$cookies.remove('username');
                   			$cookies.remove('password');
                   		}
                
					$rootScope.loginStatus = function(){
						return true;
					}
                    $rootScope.globaloverlay = "";
					$rootScope.errorSession="";
                    if($rootScope.urlBefore == '/registreren'){
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
        $location.path('/registreren');
	}
    
      $scope.forgotpass=function()
    {
          $location.path('/wachtwoord');
        
    }
    
    //check for ondernemingsDossier
	if ($rootScope.urlBefore=='/ondernemingsdossier_landingpage') {
		$scope.loginWithOndernemingsDossier();
	}

}])


vdbApp.controller('registerCtrl', ['$scope','$rootScope','$window','registerService','newsletterService','usSpinnerService','$location', '$facebook', function ($scope,$rootScope,$window,registerService,newsletterService,usSpinnerService,$location,$facebook) {
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
    $scope.errorFB="";
    $scope.facebookID = "";
    $scope.sexoption = [
        {'name': 'Dhr.',
         'value': 'm'},
        {'name': 'Mw.',
         'value': 'f'}
    ];
    

    //if facebook session is present from previous login with facebook
    $scope.fbstatus = $facebook.isConnected();
    if($scope.fbstatus) {

        if($window.sessionStorage.name)$scope.initials=$window.sessionStorage.name;
        if($window.sessionStorage.email)$scope.email=$window.sessionStorage.email;
        if($window.sessionStorage.email)$scope.email=$window.sessionStorage.email;
        if($window.sessionStorage.surname)$scope.surname=$window.sessionStorage.surname;
        $scope.facebookID = $window.sessionStorage.facebookID;

    }

    if ($window.sessionStorage.ondernemingsdossierID != undefined) {

        if($window.sessionStorage.name)$scope.initials=$window.sessionStorage.name;
        if($window.sessionStorage.email)$scope.email=$window.sessionStorage.email;
        if($window.sessionStorage.postcode)$scope.postcode=$window.sessionStorage.postcode;
        if($window.sessionStorage.address_number)$scope.address_number=$window.sessionStorage.address_number;
        $scope.ondernemingsdossierID = $window.sessionStorage.ondernemingsdossierID;

    }

    //set default message for facebook button
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = ($scope.fbstatus)? 1 : 0;
    if($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";

    
    //this is the function to get the facebook ID for new user
    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.fbstatus = $facebook.isConnected();
        if($scope.fbstatus) {
            $facebook.api('/me?fields=first_name,last_name,email').then(function(user) {
                $scope.facebookuser = user;
                $scope.errorFB = "";

                //set button to connected
                $scope.facebookMessages = "Gekoppeld met Facebook";
                $scope.facebookExist = 1;
                $scope.facebookID = $scope.facebookuser.id;
                
                //set value of the field if still blank
                if($scope.email == "")$scope.email = $scope.facebookuser.email;
                if($scope.initials == "")$scope.initials = $scope.facebookuser.first_name;
                if($scope.surname == "")$scope.surname = $scope.facebookuser.last_name;
                

            });
        }
    });




    $scope.connectFacebook = function(){

        $facebook.login();

    }
    
        
    $scope.sex = $scope.sexoption[0].value;
    
    if($rootScope.errorSession) {
    	console.log("error:" + $rootScope.errorSession);
    	$scope.errorNewUsername = $rootScope.errorSession;
		$scope.hide = "";
    }
    
    
    
	$scope.register = function(){
       

        $rootScope.globaloverlay = "active";
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
                                          ,"phone":""+$scope.phone+""
                                          ,"facebookID":""+$scope.facebookID+""
                                          ,"ondernemingsdossierID":""+$scope.ondernemingsdossierID
                                          }
                                      
        
                                       
                                       
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
                    $scope.errorPassword = "Wachtwoord komt niet niet overeen"
                    $scope.hide = "";
                }
          
            if (!getRegister.success){
                      
                   
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
                
         
                
                   
					$scope.hide = "";
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
				}	
            
            if(getRegister.success)
                {
                    $location.path('/bevestiging-registratie');
                    $rootScope.globaloverlay = "";
                    
                    if($scope.newsletter == true)
                        {
                            
                            var jsonnewsletter = JSON.stringify({"user":{"username":""+$scope.username+""
                                               ,"password":""+$scope.password+""
                                               }})
                            
                            var getNewsletter = newsletterService.getNewsletter(jsonnewsletter).then(function (data){
				            var getNewsletter = data.data;
                            console.log(getNewsletter);
                            })
                        }
                    
                    console.log(jsondata);
                    console.log(jsonnewsletter);
                }
            
		})
        
        
		
	}
    
    $scope.close = function(){
		$scope.hide="ng-hide";

	}
  
    
}])


vdbApp.controller('regisconfCtrl', ['$scope','$rootScope','$window','usSpinnerService','$location', function ($scope,$rootScope,$window,usSpinnerService,$location) {
	
            	$scope.home = function(){
		        $location.path('/');
	                                   
                }
                                       
                                       
                                      }]);
 vdbApp.controller('commentSubmitCtrl', ['$scope','$route','$rootScope','$window','$routeParams','$location','usSpinnerService','commentSubmitService','commentService','issuesService','myIssuesService','$cookies', function ($scope,$route,$rootScope,$window,$routeParams,$location,usSpinnerService,commentSubmitService,commentService,issuesService,myIssuesService,$cookies) {
 	//comment Service :v
 	$scope.hide = "ng-hide";
	$scope.commentSubmit = function( issueType ){
			// validation for issue type
			if(issueType == "problem"){
				$scope.tempIssueType = "problem";
			}
			else {
				$scope.tempIssueType = "reaction";
			}
			$rootScope.globaloverlay = "active";
			
			var user = {};
				user.username = $cookies.getObject('user').username;
				user.password_hash = $cookies.getObject('user').password_hash;
			var issue_id = $routeParams.id;
			var type = $scope.tempIssueType;
			if(!$scope.comment){
				var body = "";	
			}
			else{
				var body = $scope.comment;	
			}
			
			var jsondata = JSON.stringify({user,issue_id,type,body});
			console.log(jsondata);
			var getCommentSubmit = commentSubmitService.getCommentSubmit( jsondata ).then(function (data){
				var getCommentSubmit = data.data;
				if(!getCommentSubmit.success){
				$rootScope.globaloverlay = "";
				console.log(getCommentSubmit.error);
				$scope.hide = "";
				$scope.errorBody = ""+getCommentSubmit.error+""
				}
				else{
				$rootScope.globaloverlay = "";
				//bad practice hide modal
				$('#StemModal').modal('hide');
				$('.modal-backdrop').hide();
				$scope.comment = "";
				$scope.hide = "ng-hide";
				//refresh comment list
				var commentjsondata = JSON.stringify({"issue_id" : ""+$routeParams.id+""});
				var getComment = commentService.getComment( commentjsondata ).then(function (data){
					var getComment = data.data;
					$rootScope.commentList = getComment.comments;
				});
				var jsondata = JSON.stringify({"issue_id":$routeParams.id});
				//get data for count comment
				var getIssues = issuesService.getIssues( jsondata ).then(function (data){
								var getdata = data.data;
								$rootScope.problemIdList = getdata.issues;
						});
				var jsondatamyIssue = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""
												}});
				var getMyIssues = myIssuesService.getMyIssues( jsondatamyIssue ).then(function (data){
								var getdata = data.data;
								$rootScope.myIssuesList = getdata.issues;
				})
				}
				
				//comment count



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
        $rootScope.globaloverlay = "active";
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
                $scope.hide = "";
                }

                else{
                        
                $location.path('/bevestiging-wachtwoord-vergeten');
                        
                    }
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



    
vdbApp.controller('profileCtrl', ['$scope','$rootScope','$window','profileService','newsletterService','loginService','$location','usSpinnerService', '$facebook', 'syncFBService','$cookies', function ($scope,$rootScope,$window,profileService,newsletterService,loginService,$location,usSpinnerService,$facebook,syncFBService,$cookies) {
     $scope.hide = "ng-hide";
	
     $scope.home = function(){
		        $location.path('/');                      
                }
	
	//error session
	if($rootScope.errorSession){
		$scope.hide = "";
	}
    
    //set default message for facebook button
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = ($window.sessionStorage.facebookID)? 1 : 0;
    if($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";
    
    
    
    //this is the function to sync the profile
    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.fbstatus = $facebook.isConnected();
        if($scope.fbstatus) {
            $rootScope.globaloverlay = "active";
            //sync data here
            $facebook.api('/me').then(function(user) {
                $scope.facebookuser = user;
           
                
                //here we create the json     
                var username = $scope.username;
                var facebookID = $scope.facebookuser.id;                
                var jsondata = JSON.stringify({username,facebookID});
                
                //API call to connectFB
                var connectFB = syncFBService.getFBSync(jsondata).then(function (data){
            
                    var result = data.data;
                    console.log(result);
                    
                    if(result.success == 'false'){
                        var error = result.error;
                        $scope.errorFB = error;
                        $facebook.logout();
                        $scope.hide = "";
                        $scope.successAlert = "";
                        $scope.successClass = "";
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
                        
                        $(window).scrollTop(0);
                        
                            
                    }else if(result.success){
                        $scope.errorFB = "";
                        
                        //set button to connected
                        $scope.facebookMessages = "Gekoppeld met Facebook";
                        $scope.facebookExist = 1;
                        $window.sessionStorage.facebookID = facebookID;
                        
                    }
                    
                    $rootScope.globaloverlay = "";
                });
            });
            }
        });
       

    
     
    $scope.connectFacebook = function(){
       
        $facebook.login();

    }

    //                        $scope.loginToggle = function() {
    //                            if($scope.status) {
    //                                $facebook.logout();
    //                            } else {
    //                                $facebook.login();
    //                            }
    //                        };

    var c_user = $cookies.getObject('user');
    var c_user_profile = $cookies.getObject('user_profile');
    $scope.username = c_user.username ;
    $scope.email = c_user.email;
    if(c_user_profile.sex == 'man')
        {
            $scope.selected1=1;
            $scope.selected2=0; 
        }
    else{
            
            $scope.selected2=1;
            $scope.selected1=0;
        
    }
    
    $scope.initials = c_user_profile.initials;
    if(c_user_profile.tussenvoegsel == 'null')
        { 
            $scope.tussenvoegsel="";
        }
    else{
        $scope.tussenvoegsel = c_user_profile.tussenvoegsel;
        }
    
    $scope.surname = c_user_profile.surname;
    $scope.address = c_user_profile.address;
    $scope.address_number = c_user_profile.address_number;
    $scope.postcode = c_user_profile.postcode;
    $scope.city = c_user_profile.city;
    $scope.phone = c_user_profile.phone;
    
   
    
    //console.log({user,password,user_profile});
	$scope.profile = function(){
    $rootScope.globaloverlay = "active";
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
    $scope.errorFB = "";
        
        
    $scope.hide = "ng-hide";
    
    var user={};
    user.username = c_user.username;
    user.password_hash = c_user.password_hash;
    
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
                    $scope.errorFB = "";
                                    
					$scope.hide = "";
                    $scope.successAlert = "";
                    $scope.successClass = "";
					$scope.overlay="overlay";

                     $(window).scrollTop(0);

               

					$rootScope.globaloverlay = "";



				}	

            
            
            else if(getProfile.success)
                
                {
                    
                    
                    if($scope.password_old !=null && $scope.password_new !=null ){
                        var password = $scope.password_new;
                        var jsondatalogin = JSON.stringify({"user":{"username":""+c_user.username+"",password}});
                    }else{
                        var password_hash = c_user.password_hash;
                        var jsondatalogin = JSON.stringify({"user":{"username":""+c_user.username+"",password_hash}});
                    }
                    var getLogin = loginService.getLogin(jsondatalogin).then(function (data){
				    var getLogin = data.data;
                        
                        
                     if($scope.newsletter == true)
                        {
                            
                            var jsonnewsletter = JSON.stringify({"user":{"username":""+$scope.username+""
                                               ,"password":""+$scope.password+""
                                               }})
                            
                            var getNewsletter = newsletterService.getNewsletter(jsonnewsletter).then(function (data){
				            var getNewsletter = data.data;
                            console.log(getNewsletter);
                            })
                        }
                    
                    console.log(jsondata);
                    console.log(jsonnewsletter);
                    
                    
                    $cookies.putObject('user',getLogin.user);
                    $cookies.putObject('user_profile',getLogin.user_profile);
                    $rootScope.globaloverlay = "";  
                    $(window).scrollTop(0);
                    $scope.successAlert = "Profiel geüpdatet"; 
                    $scope.successClass = "successAlert";
                    $scope.hide = "";
                        
//                    $location.path('/profile');
                    
                    //console.log(jsondata);
                })
            
            }
		});
		
        $scope.close = function(){
         
		  $scope.hide="ng-hide";
        }
	}
  
    
    
}])

vdbApp.controller('createissueCtrl', ['$scope','$rootScope','$window','$timeout','categoriesService','issueSubmitService','myIssuesService','$location','issuesService','issueSubmitServiceWithImage','duplicateIssuesService','$cookies', function ($scope,$rootScope,$window,$timeout,categoriesService,issueSubmitService,myIssuesService,$location,issuesService,issueSubmitServiceWithImage,duplicateIssuesService,$cookies) {	
		$scope.hide = "ng-hide";
		$scope.issueName = "Probleem"
		$scope.hideIssue = 1;
        $scope.myIssueCount = 0;
        $scope.slide = "";
		$scope.initslide = "toggle-button";
		$scope.loadCategory = 1;
		$scope.count = 0;
		

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

        $timeout(function(){
        	$scope.slide = "toggle-button-selected-left";
        },0)
		$rootScope.lastUrl = $location.path();
		console.log($rootScope.lastUrl);

		menuSelected($rootScope,'createissue');
		//show my issue
		if($cookies.getObject('user')){
		$scope.hideLogin = true
		var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""

											}});
		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			var count = getdata.count;
            $rootScope.myIssueCount = count;
			$rootScope.myIssuesList = getdata.issues;
		})
			$scope.hideLogin = true
		}
		else {
			$scope.hideLogin = false;
		}
		//first initial
		$timeout(function(){
			if(latlngChange){
			googleMapCreateProblem(latlngChange);
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
				$timeout(function(){
					$scope.loadCategory = 0;
				})
			});

			}else{
			latlngChange = {lat: 52.158367,lng: 4.492999};
			googleMapCreateProblem(latlngChange);
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
				$timeout(function(){
					$scope.loadCategory = 0;
				})
			});
		}
		},1200);
		
		$scope.categoriesData = function(){
			$scope.loadCategory = 1;
			$scope.count = 0;
			$scope.duplicateDataList = null;
			var latitude = markerLat;
			var longitude = markerLng;
			var jsondataCity = JSON.stringify({latitude,longitude});
			console.log(jsondataCity);
			$timeout(function(){
			$scope.categoriesList = null;
			var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
				$timeout(function(){
					$scope.loadCategory = 0;
				})
			});
				
		
			},3000)
		}


		$scope.clickSearchCreateIssue= function(){
			geocodeAddressCreateProblem(geocoder, map3, $scope.searchCityCreate);
			$scope.loadCategory = 1;
			city.long_name = $scope.searchCityCreate;
	 		var latitude = markerLat;
			var longitude = markerLng;
			$rootScope.lastCity = $scope.searchCityCreate;
			console.log($rootScope.lastCity);
			var jsondataCity = JSON.stringify({latitude,longitude});
			$timeout(function(){
				var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
				$scope.categoriesList = data.data.categories;
				$scope.loadCategory = 0;
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
		})
			 

		}
		$scope.createIssue = function(){
			$rootScope.globaloverlay = "active";
			$scope.errorTitle = "";
			$scope.errorDescription = "";
			$scope.errorId = "";
			$scope.errorIdStyle = "";
			//initial data for request
			var user = {};
			var user_profile = {};
			var issue = {};
			var location = {};
			var file = $scope.imgData;
			//login
			if($cookies.getObject('user')){
				user.username = $cookies.getObject('user').username;
				user.password_hash = $cookies.getObject('user').password_hash;
			}
			//not login
			else{
				user.email = $scope.email;
				user_profile.initials = $scope.initials;
				user_profile.sex = $scope.sex;
				user_profile.tussenvoegsel = $scope.tussenvoegsel;
				user_profile.surname = $scope.surname;
				user_profile.address = $scope.address;
				user_profile.address_number = $scope.address_number;
				user_profile.address_suffix = $scope.address_suffix;
				user_profile.postcode = $scope.postcode;
				user_profile.city = $scope.city;
				user_profile.phone = $scope.phone;
			} 

			

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
			var jsondataSubmit = JSON.stringify({user,user_profile,issue,location});
			console.log(jsondataSubmit);
			if(!file){
				//without image
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
						if(issueData.errors.initials){
							$scope.errorInitials = "Voorsletters "+issueData.errors.initials;
						}
						if(issueData.errors.owner_city){
							$scope.errorCity = "Plaats "+issueData.errors.owner_city;
						}
						if(issueData.errors.surname){
							$scope.errorSurname ="Acternaam "+issueData.errors.surname;
						}
						if(issueData.errors.owner_email){
							$scope.errorEmail = issueData.errors.owner_email;
						}
						if(issueData.errors.owner_postcode){
							$scope.errorPostcode = "Postcode "+issueData.errors.owner_postcode;
						}
						if(issueData.errors.street){
							$scope.errorStreet = "Straat "+issueData.errors.street;
						}
						if(issueData.errors.street_number){
							$scope.errorStreetNumber = "Huisnummer "+issueData.errors.street_number;
						}
						$rootScope.globaloverlay = "";
						$(window).scrollTop(0);
					}
					else if(issueData.success == "false"){
							$scope.hide = "";
							console.log(issueData.success);
							$scope.errorEmail = issueData.error;
							$rootScope.globaloverlay = "";
							$(window).scrollTop(0);
						}
					else{
						//success
						var issueId = issueData.issue_id;
	                    //login
	                    if($cookies.getObject('user')){
							$location.path(/mijn-meldingen/+issueId);
	                    }else{
	                    	$location.path(/melding/+issueId);
	                    }
						$rootScope.globaloverlay = "";

					}

					});
			}else if(file){
				//with
					issueSubmitServiceWithImage.getIssueSubmit( jsondataSubmit,file).then(function (data){
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
						if(issueData.errors.initials){
							$scope.errorInitials = "Voorsletters "+issueData.errors.initials;
						}
						if(issueData.errors.owner_city){
							$scope.errorCity = "Plaats "+issueData.errors.owner_city;
						}
						if(issueData.errors.surname){
							$scope.errorSurname ="Acternaam "+issueData.errors.surname;
						}
						if(issueData.errors.owner_email){
							$scope.errorEmail = issueData.errors.owner_email;
						}
						if(issueData.errors.owner_postcode){
							$scope.errorPostcode = "Postcode "+issueData.errors.owner_postcode;
						}
						if(issueData.errors.street){
							$scope.errorStreet = "Straat "+issueData.errors.street;
						}
						if(issueData.errors.street_number){
							$scope.errorStreetNumber = "Huisnummer "+issueData.errors.street_number;
						}
						$rootScope.globaloverlay = "";
						$(window).scrollTop(0);
					}
						else if(issueData.success == "false"){
							$scope.hide = "";
							console.log(issueData.success);
								$scope.errorEmail = issueData.error;
							$rootScope.globaloverlay = "";
							$(window).scrollTop(0);
						}
					else{
						//success
						var issueId = issueData.issue_id;
	                   if($cookies.getObject('user')){
							$location.path(/mijn-meldingen/+issueId);
	                    }else{
	                    	$location.path(/melding/+issueId);
	                    }
						$rootScope.globaloverlay = "";

					}
			});
			}
			

			
			
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
			$location.path('/nieuwe-idea');
			markerLat = marker.getPosition().lat();
	 		markerLng = marker.getPosition().lng();
		}
		//dulicate data
		$scope.duplicateData = function(){
			var user = {};
			user.username = $cookies.getObject('user').username;
			user.password_hash = $cookies.getObject('user').password_hash;
			var lat = markerLat;
			var long = markerLng;
			var category_id = $scope.categoryId;
			$rootScope.currentPage = 1;
  			$scope.totalPage = 5;

			var jsondataDuplicate = JSON.stringify({user,lat,long,category_id});
			console.log(jsondataDuplicate);
			var getDuplicateIssue = duplicateIssuesService.getDuplicateIssue(jsondataDuplicate).then(function (data){
					var getDuplicateIssue = data.data;
					$scope.count = data.data.count;
					$scope.duplicateDataList = getDuplicateIssue.issues;
					console.log(getDuplicateIssue);

                   
                    
            });
            
            $scope.blockstyle = "margin-left:0%";
            $scope.duplicateposition = 0;
            
		}
        
       
        
        $scope.moveDuplicate = function( move ){
                
            var limit = $scope.count-4;
            $scope.duplicateposition = $scope.duplicateposition + move;
            
            if($scope.duplicateposition < 0)$scope.duplicateposition = 0; 
            
            if($scope.duplicateposition > limit)$scope.duplicateposition = limit;
            
            
            
            var move = $scope.duplicateposition * -25;
            $scope.blockstyle = "margin-left:"+move+"%";
            
            
            
        }


		}])

vdbApp.controller('createIdeaCtrl', ['$scope','$rootScope','$window','$timeout','categoriesService','issueSubmitService','myIssuesService','$location','issuesService','issueSubmitServiceWithImage','$cookies', function ($scope,$rootScope,$window,$timeout,categoriesService,issueSubmitService,myIssuesService,$location,issuesService,issueSubmitServiceWithImage,$cookies) {
		$scope.hide = "ng-hide";
		$scope.issueName = "Probleem"
		$scope.hideIssue = 1;
        $scope.myIssueCount = 0;
        $scope.initslide = "toggle-button2 ";

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
	    
        $timeout(function(){
        	$scope.slide = "toggle-button-selected-right";
        },0)
	
		menuSelected($rootScope,'createissue');
		
		//show my issue
		if($cookies.getObject('user')){
			var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""

											}});
		var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
			var getdata = data.data;
			var count = getdata.count;
            $rootScope.myIssueCount = count;
			$rootScope.myIssuesList = getdata.issues;
		})
		}else{

		}
		//first initial
		$timeout(function(){
			if(latlngChange){
			googleMapCreateIdea(latlngChange);
			var latitude = markerLat;
			var longitude = markerLng;
			// var jsondataCity = JSON.stringify({latitude,longitude});
			// var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
			// 	$scope.categoriesList = data.data.categories;
			// });

			}else{
			latlngChange = {lat: 52.158367,lng: 4.492999};
			googleMapCreateIdea(latlngChange);
			latlngChange = null;
			var latitude = markerLat;
			var longitude = markerLng;
			// var jsondataCity = JSON.stringify({latitude,longitude});
			// var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
			// 	$scope.categoriesList = data.data.categories;
			// });
		}
		},1200);
		

		if($cookies.getObject('user')){
			$scope.hideNonLogin = "ng-hide"
		}
		$scope.clickSearchCreateIssue= function(){
			geocodeAddressCreateProblem(geocoder, map4, $scope.searchCityCreate);
			city.long_name = $scope.searchCityCreate;
	 		var latitude = markerLat;
			var longitude = markerLng;
			$rootScope.lastCity = $scope.searchCityCreate;
			console.log($rootScope.lastCity);
			var jsondataCity = JSON.stringify({latitude,longitude});
			$timeout(function(){
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

		$scope.createIdea = function(){
			$rootScope.globaloverlay = "active";
			$scope.errorTitle = "";
			$scope.errorDescription = "";
			$scope.errorId = "";
			$scope.errorIdStyle = "";
			var file = $scope.imgData;

			//initial data for request
			var user = {};
			var user_profile ={};
			var issue = {};
			var location = {};

			//login
			if($cookies.getObject('user')){
				user.username = $cookies.getObject('user').username;
				user.password_hash = $cookies.getObject('user').password_hash;
			}
			//not login
			else{
				user.email = $scope.email;
				user_profile.initials = $scope.initials;
				user_profile.sex = $scope.sex;
				user_profile.tussenvoegsel = $scope.tussenvoegsel;
				user_profile.surname = $scope.surname;
				user_profile.address = $scope.address;
				user_profile.address_number = $scope.address_number;
				user_profile.address_suffix = $scope.address_suffix;
				user_profile.postcode = $scope.postcode;
				user_profile.city = $scope.city;
				user_profile.phone = $scope.phone;
			} 

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
			var jsondataSubmit = JSON.stringify({user,user_profile,issue,location});
			console.log(jsondataSubmit);
			if(!file){
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
					if(issueData.errors.initials){
							$scope.errorInitials = "Voorsletters "+issueData.errors.initials;
						}
					if(issueData.errors.owner_city){
							$scope.errorCity = "Plaats "+issueData.errors.owner_city;
					}
					if(issueData.errors.surname){
							$scope.errorSurname ="Acternaam "+issueData.errors.surname;
					}
					if(issueData.errors.owner_email){
							$scope.errorEmail = issueData.errors.owner_email;
					}
					if(issueData.errors.owner_postcode){
							$scope.errorPostcode = "Postcode "+issueData.errors.owner_postcode;
					}
					if(issueData.errors.street){
							$scope.errorStreet = "Straat "+issueData.errors.street;
					}
					if(issueData.errors.street_number){
							$scope.errorStreetNumber = "Huisnummer "+issueData.errors.street_number;
					}

					
					$rootScope.globaloverlay = "";
					$(window).scrollTop(0);
				}
				else if(issueData.success == "false"){
					$scope.hide = "";
					console.log(issueData.success);
						$scope.errorEmail = issueData.error;
					$rootScope.globaloverlay = "";
					$(window).scrollTop(0);
				}
				else{
					//success
					var issueId = issueData.issue_id;
                    if($cookies.getObject('user')){
							$location.path(/mijn-meldingen/+issueId);
	                    }else{
	                    	$location.path(/melding/+issueId);
	                    }
					$rootScope.globaloverlay = "";

				}

			});
			}else if(file){
				issueSubmitServiceWithImage.getIssueSubmit( jsondataSubmit,file).then(function (data){
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
						if(issueData.errors.location){
						$scope.errorLocation =issueData.errors.location;
						}
						if(issueData.errors.initials){
								$scope.errorInitials = "Voorsletters "+issueData.errors.initials;
							}
						if(issueData.errors.owner_city){
								$scope.errorCity = "Plaats "+issueData.errors.owner_city;
						}
						if(issueData.errors.surname){
								$scope.errorSurname ="Acternaam "+issueData.errors.surname;
						}
						if(issueData.errors.owner_email){
								$scope.errorEmail = issueData.errors.owner_email;
						}
						if(issueData.errors.owner_postcode){
								$scope.errorPostcode = "Postcode "+issueData.errors.owner_postcode;
						}
						if(issueData.errors.street){
								$scope.errorStreet = "Straat "+issueData.errors.street;
						}
						if(issueData.errors.street_number){
								$scope.errorStreetNumber = "Huisnummer "+issueData.errors.street_number;
						}
							$rootScope.globaloverlay = "";
							$(window).scrollTop(0);
						}
						else if(issueData.success == "false"){
								$scope.hide = "";
								console.log(issueData.success);
									$scope.errorEmail = issueData.error;
								$rootScope.globaloverlay = "";
								$(window).scrollTop(0);
							}
					else{
						//success
						var issueId = issueData.issue_id;
	                    if($cookies.getObject('user')){
							$location.path(/mijn-meldingen/+issueId);
	                    }else{
	                    	$location.path(/melding/+issueId);
	                    }
						$rootScope.globaloverlay = "";

					}
			});

			}
			
			
			
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
			$location.path('/nieuwe-probleem');
			markerLat = marker.getPosition().lat();
	 		markerLng = marker.getPosition().lng();
		}	

}]);

vdbApp.controller('deleteIssueCtrl', ['$scope','$rootScope','$routeParams','$window','statusChangeService','myIssuesService','$cookies',function ($scope,$rootScope,$routeParams,$window,statusChangeService,myIssuesService,$cookies) {
		$scope.hideError = "ng-hide";
		$scope.error = "";
		$scope.deleteIssue = function(){
			$rootScope.globaloverlay="active";
			var user = {};
			user.username = $cookies.getObject('user').username;
			user.password_hash = $cookies.getObject('user').password_hash;
			var issue_id = $rootScope.getStatusId;
			var status = "deleted";
			var jsondata = JSON.stringify({user,issue_id,status});
			var getStatusChange = statusChangeService.getStatusChange( jsondata ).then(function(data){
				var getStatusChange = data.data;
				console.log(getStatusChange);
				//validate error or not
				if(getStatusChange.success){
				var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
												"password_hash":""+$cookies.getObject('user').password_hash+""
											}});
				var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
						var getdata = data.data;
						var count = getdata.count;
			            $rootScope.myIssueCount = count;
						$rootScope.myIssuesList = getdata.issues;
						$('#DeleteModal').modal('hide');
						$('.modal-backdrop').hide();
						$rootScope.globaloverlay = "";
						$scope.error = "";
						$scope.hideError = "ng-hide";
					})
				}
				else{
					$scope.error = getStatusChange.error;
					$scope.hideError = "";
					$rootScope.globaloverlay = "";
				}
				//load myissue
				
			});	
		}
		$scope.close = function(){
			$scope.hideError = "ng-hide";
			$scope.error = "";
		}
		$scope.cancel = function(){
			$scope.error = "";
			$scope.hideError = "ng-hide";
		}
}])

vdbApp.controller('closeIssueCtrl', ['$scope','$rootScope','$routeParams','$window','statusChangeService','myIssuesService','$cookies', function ($scope,$rootScope,$routeParams,$window,statusChangeService,myIssuesService,$cookies) {
		$scope.hideError = "ng-hide";
		$scope.errorClose = "";

		$scope.closeIssueClick = function(){
			$rootScope.globaloverlay = "active";
			var user = {};
			user.username = $cookies.getObject('user').username;
			user.password_hash = $cookies.getObject('user').password_hash;
			var issue_id = $rootScope.getStatusId;
			if(!$scope.feedback){
				var result = null;
			}else{
			var result = $scope.feedback;	
			}
			if(!$scope.rating){
			var appreciation = null;	
			}
			else{
			var appreciation = parseInt($scope.rating);	
			}
			var status = "closed";
			console.log({user,issue_id,result,appreciation,status});
				var jsondata = JSON.stringify({user,issue_id,result,appreciation,status});
				var getStatusChange = statusChangeService.getStatusChange( jsondata ).then(function(data){
					var getStatusChange = data.data;
					console.log(getStatusChange);
					if(!getStatusChange.success){
						$scope.hideError = "";
						$scope.errorClose = getStatusChange.error;
						$rootScope.globaloverlay = "";
					}else{
					//load myissue
					var jsondata = JSON.stringify({"user":{ "username":""+$cookies.getObject('user').username+"",
													"password_hash":""+$cookies.getObject('user').password_hash+""
												}});
					var getMyIssues = myIssuesService.getMyIssues( jsondata ).then(function (data){
							var getdata = data.data;
							var count = getdata.count;
				            $rootScope.myIssueCount = count;
							$rootScope.myIssuesList = getdata.issues;
							$('#CloseModal').modal('hide');
							$('.modal-backdrop').hide();
							$rootScope.globaloverlay = "";
							$scope.errorClose = "";
							$scope.feedback = "";
							$scope.rating = null;
						})
					}
					
				});
		}
		$scope.close = function(){
			$scope.hideError = "ng-hide";
			$scope.errorClose = "";
			$scope.feedback = "";
			$scope.rating = null;
		}

}])


vdbApp.controller('hashCtrl', ['$scope','$rootScope','$routeParams','$window','$location','getIssueService', function ($scope,$rootScope,$routeParams,$window,$location,getIssueService,targetAction) {
    
    console.log("target action : "+$rootScope.targetAction);
    
    var hash=$routeParams.hashkey;
    $rootScope.hashSession = hash;     
    var jsonhash = JSON.stringify({"authorisation_hash":""+hash+""});

    var getIssue = getIssueService.getIssue( jsonhash ).then(function (data){
        var result = data.data;
        
        console.log(result);
        
        if(result.success){
            //we got the correct hash, so correct issue id
            var issueID = result.issue_id;
            $location.path("/melding/"+issueID);
            
          
        }
        else{
            //show error
            var error = result.error;
            alert(error);
            $location.path("/");
            
        }
        
    });
    
    
    
    
}])


