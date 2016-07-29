
//var vdbApp = angular.module('vdbApp',[]);
var vdbApp = angular.module('vdbApp', ['ngRoute', 'angularUtils.directives.dirPagination', 'ngFacebook', 'ngCookies', 'naif.base64','angulartics', 'angulartics.google.analytics'])



var APIURL = "https://staging.verbeterdebuurt.nl/api.php/json_1_3/";
var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow();
var infoWindowContent = [];
var latlngChange;
var marker;
var map;
var postalcode = null;
//define service
var issuesService = new Object();
var registerService = new Object();
var loginService = new Object();
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
var confirmRegistrationService = new Object();
var cancelRegistrationService = new Object();
var confirmIssueService = new Object();
var unfollowIssueService = new Object();
var serviceStandartService = new Object();
var confirmVoteService = new Object();
var geolocationValid = 0;
markers = null;
markers = [];
markerid = [];
//polyfill for includes for internet explore not support js
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
//polyfill for endswith internet explore not support js
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
//console log()iff you want to deactive it, change the paremeter from true to false
logger = function(string){
    if(false){
       console.log(string);
    }
}

//google map auto compleate change string to make it by id
googleautocompleate = function(stringid){
      var input = document.getElementById(stringid);
      var options = {
        types: ['geocode'],
        componentRestrictions: {
            country: 'nl'
        }
    };

    var autocomplete = new google.maps.places.Autocomplete(input, options);
}


//error api handler
errorhandler = function(rootScope){
    logger('error')
    rootScope.globaloverlay="";
    $("#errorModal").modal({backdrop: 'static', keyboard: false});
    $("#errorModal").modal('show');
    $("#errorModal").on('click','#errorModalRedirect',function(){
                $('#errorModal').modal('hide');
                $('.modal-backdrop').hide();
    });
    
};

//google map
window.onload = function () {
    var mainLat = 52.371828;
    var mainLng = 4.902220;
    this._map_center = {
        lat: mainLat,
        lng: mainLng
    };
    //this._marker_positions = [{lat: 27.1959742, lng: 78.02423269999100}, {lat: 27.1959733, lng: 78.02423269999992}] ;
    var mapOptions = {
        zoom: 15,
        maxZoom: 17,
        minZoom: 13,
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
        center: this._map_center,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    {
                        visibility: "off"
                    }
				        		]
				    },
            {
                featureType: "transit.station",
                stylers: [
                    {
                        visibility: "off"
                    }
                ]
            }
			    ]

    };

    map = new google.maps.Map(document.getElementById('googlemaps'), mapOptions);

    google.maps.event.addListener(map,'mouseover',function(){
        if((window.location.pathname=='/'||window.location.pathname.includes('gemeente'))&&!(window.location.pathname.includes('nieuw-probleem')||window.location.pathname.includes('nieuw-idee')||window.location.pathname.includes('nieuwe-melding'))){
        map.setOptions({
        scrollwheel: true})
    }
    else{
        map.setOptions({
        scrollwheel: false})
    }
    })
    
    getLocation(map);
    var geocoder = new google.maps.Geocoder();
    google.maps.event.addListener(map, 'bounds_changed', function (e) {
        maxlat = map.getBounds().getNorthEast().lat();
        maxlng = map.getBounds().getNorthEast().lng();
        minlat = map.getBounds().getSouthWest().lat();
        minlng = map.getBounds().getSouthWest().lng();
        geocoder.geocode({'latLng': map.getCenter()} , function (result , status){
                sendLatitude = map.getCenter().lng();
                sendLongitude = map.getCenter().lat();
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
                     // logger("drag googlemap:"+city.long_name);
                      // showIssue(infoWindow,infoWindowContent);
                }
                

               });
    });

    // maxlat  = 52.17899981092104;
    // maxlng  = 52.15154422875919;
    // minlat = 4.545096343219029;
    // minlng = 4.487203543841588;

    if (cityName != null) {
        geocodeAddress(geocoder, map);
        cityName = null;
    } else if (postalcode != null) {
        geocodeAddress(geocoder, map);
        postalcode = null;
    }
    getLatLng(map);
    //start location picker

    var tempurl = window.location.pathname;
    if(tempurl.includes('gemeente') && !(tempurl.includes('nieuw-probleem')||tempurl.includes('nieuw-idee')||tempurl.includes('nieuwe-melding'))){
        var citytemp = tempurl.substring(tempurl.slice(0,tempurl.length-1).lastIndexOf('/')+1);
        cityName = citytemp.substring(0,citytemp.length-1);
        logger(cityName);
        geocodeAddress(geocoder, map);
    }

    $('#duplicate-bubble').hide();

}

function getLatLng(map) {
    google.maps.event.addListener(map, 'bounds_changed', function () {
        latlngChange = map.getCenter();
    })
}

function googleMapIssue(lat, lng, type) {
    var location = {
        lat: lat,
        lng: lng
    };
    var iconImg = "";

    if (type === "problem") {
        iconImg = "/img/icon_2_42_42.png";
    } else if (type === "idea") {
        iconImg = "/img/icon_idea_2_42_42.png";
    }

    var mapOption2 = {
        center: location,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    {
                        visibility: "off"
                    }
				        		]
				    }
			    ]

    }
    var markerOption2 = {
        position: location,
        icon: iconImg
    }
    var map2 = new google.maps.Map(document.getElementById("googleMapIssue"), mapOption2);
    map2.setOptions({
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        disableDefaultUI: true
    });
    var marker = new google.maps.Marker(markerOption2);
    marker.setMap(map2);
}

function googleMapCreateProblem(latlng) {
    var mapOption3 = {
        center: latlng,
        zoom: 17,
        maxZoom: 19,
        minZoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    {
                        visibility: "off"
                    }
				        		]
            },
            {
                featureType: "transit.station",
                stylers: [
                    {
                        visibility: "off"
                    }
                ]
            }
			    ]
    }
    map3 = new google.maps.Map(document.getElementById("googleMapCreateProblem"), mapOption3);
    marker = new google.maps.Marker();
    marker.setMap(map3);
    marker.setPosition(map3.getCenter());
    marker.setOptions({
        draggable: true,
        icon: "/img/icon_2_42_42.png"
    });
    map3.setOptions({
        draggable: true,
        zoomControl: true,
        clickable: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        disableDefaultUI: false
    });
    markerLat = marker.getPosition().lat();
    markerLng = marker.getPosition().lng();
    sycGoogleMap3(map3);
    markerCenter(map3, marker, "location");
    getMarkerLocation(marker);
    markerGetAddress(marker, "location");
}

function googleMapCreateIdea(latlng) {
    var mapOption4 = {
        center: latlng,
        zoom: 17,
        maxZoom: 19,
        minZoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    {
                        visibility: "off"
                    }
				        		]
            },
            {
                featureType: "transit.station",
                stylers: [
                    {
                        visibility: "off"
                    }
                ]
            }
			    ]
    }
    map4 = new google.maps.Map(document.getElementById("googleMapCreateIdea"), mapOption4);
    marker = new google.maps.Marker();
    marker.setMap(map4);
    marker.setPosition(map4.getCenter());
    marker.setOptions({
        draggable: true,
        icon: "/img/icon_idea_2_42_42.png"
    });
    map4.setOptions({
        draggable: true,
        zoomControl: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        disableDefaultUI: false,
    });
    markerLat = marker.getPosition().lat();
    markerLng = marker.getPosition().lng();
    sycGoogleMap4(map4);
    markerCenter(map4, marker, "location2");
    getMarkerLocation(marker);
    markerGetAddress(marker, "location2");
}

//to make other map syncronise
function sycGoogleMap3(map3) {
    google.maps.event.addListener(map3, 'bounds_changed', function (e) {
        google.maps.event.trigger(map3, 'resize')
        map.setCenter(map3.getCenter());
        map.setZoom(map3.getZoom());
    });
}

function sycGoogleMap4(map4) {
    google.maps.event.addListener(map4, 'bounds_changed', function (e) {
        google.maps.event.trigger(map4, 'resize')
        map.setCenter(map4.getCenter());
        map.setZoom(map4.getZoom());
    });
}
//marker at center
function markerCenter(map, marker, location) {
        marker.setPosition(map.getCenter());
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
        geocoder.geocode({
            'latLng': marker.getPosition()
        }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                for (var i = 0; i < result[0].address_components.length; i++) {
                    for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                        //if you want the change the area ..
                        if (result[0].address_components[i].types[b] == "route") {
                            // street name
                            //logger("1");
                            streetLocation = result[0].address_components[i].short_name;
                            addressLocation = streetLocation;
                            
                            
                            var the_street_number = "";
                            for(var c = 0; c < result[0].address_components.length; c++){
                                for (var d = 0; d < result[0].address_components[c].types.length; d++) {
                                    if (result[0].address_components[c].types[d] == "street_number") {
                                        the_street_number = result[0].address_components[c].short_name;
                                    }
                                    break;
                                }  
                            }
                            document.getElementById(location).value = addressLocation + " " + the_street_number;
                            
                            
                            
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


    google.maps.event.addListener(map, 'click', function (e) {
        marker.setPosition(e.latLng);
        // logger(e.latLng);
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
        geocoder.geocode({
            'latLng': e.latLng
        }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                for (var i = 0; i < result[0].address_components.length; i++) {
                    for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                        //if you want the change the area ..
                        if (result[0].address_components[i].types[b] == "route") {
                            // street name
                            streetLocation = result[0].address_components[i].short_name;
                            addressLocation = streetLocation;
                            
                            
                            var the_street_number = "";
                            for(var c = 0; c < result[0].address_components.length; c++){
                                for (var d = 0; d < result[0].address_components[c].types.length; d++) {
                                    if (result[0].address_components[c].types[d] == "street_number") {
                                        the_street_number = result[0].address_components[c].short_name;
                                    }
                                    break;
                                }  
                            }
                            document.getElementById(location).value = addressLocation + " " + the_street_number;

                            
                            
                            
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
function getMarkerLocation(marker) {
    google.maps.event.addListener(marker, 'dragend', function (e) {
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
    });
}
// get location search at create issue
function geocodeAddressCreateProblem(geocoder, resultsMap, address,location) {
    var address = document.getElementById('searchCityProblem').value;
    geocoder.geocode({
        'address': address,componentRestrictions: {country: 'nl'}
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
            marker.setPosition(resultsMap.getCenter());
            markerLat = resultsMap.getCenter().lat();
            markerLng = resultsMap.getCenter().lng();
            maxlat = map.getBounds().getNorthEast().lat();
            maxlng = map.getBounds().getNorthEast().lng();
            minlat = map.getBounds().getSouthWest().lat();
            minlng = map.getBounds().getSouthWest().lng();
            showIssue(infoWindow, infoWindowContent);
            //get address after search
                     geocoder.geocode({
                        'latLng': results[0].geometry.location
                }, function (result, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        for (var i = 0; i < result[0].address_components.length; i++) {
                            for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                                //if you want the change the area ..
                                if (result[0].address_components[i].types[b] == "route") {
                                    // street name
                                    street = result[0].address_components[i].short_name;
                                    
                                    var the_street_number = "";
                                    for(var c = 0; c < result[0].address_components.length; c++){
                                        for (var d = 0; d < result[0].address_components[c].types.length; d++) {
                                            if (result[0].address_components[c].types[d] == "street_number") {
                                                the_street_number = result[0].address_components[c].short_name;
                                            }
                                            break;
                                        }  
                                    }
                                    document.getElementById(location).value = street + " " + the_street_number;

                                    
                                    
                                    break;
                                }
                                // if (result[0].address_components[i].types[b] == "street_number") {
                                //     // street number
                                //     street_number = result[0].address_components[i].short_name;
                                //     break;
                                // }
                            }
                        }
                    }
                });

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function markerGetAddress(marker, location) {
    //first time load
    google.maps.event.addListener(marker, 'dragend', function (e) {
        geocoder.geocode({
            'latLng': marker.getPosition()
        }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                for (var i = 0; i < result[0].address_components.length; i++) {
                    for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                        //if you want the change the area ..
                        if (result[0].address_components[i].types[b] == "route") {
                            // street name
                            street = result[0].address_components[i].short_name;
                            
                            var the_street_number = "";
                            for(var c = 0; c < result[0].address_components.length; c++){
                                for (var d = 0; d < result[0].address_components[c].types.length; d++) {
                                    if (result[0].address_components[c].types[d] == "street_number") {
                                        the_street_number = result[0].address_components[c].short_name;
                                    }
                                    break;
                                }  
                            }
                            document.getElementById(location).value = street + " " + the_street_number;

                            break;
                        }
                        // if (result[0].address_components[i].types[b] == "street_number") {
                        //     // street number
                        //     street_number = result[0].address_components[i].short_name;
                        //     break;
                        // }
                    }
                }
            }
        });
      
        
    });
}

//change menu selected
function menuSelected($scope, selected) {
    $scope.homeSelected = "";
    $scope.mentionSelected = "";
    $scope.myIssuesSelected = "";

    switch (selected) {
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


//convert to slug
function convertToSlug(Text) {
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}



function geocodeGetLocationFound(lat, lng) {
    geocoder.geocode({
        'location': {
            'lat': lat,
            'lng': lng
        }
    }, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            for (var i = 0; i < result[0].address_components.length; i++) {
                for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                    //if you want the change the area ..
                    if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                        // name of city
                        cityFound = result[0].address_components[i];
                        break;
                    }
                }
            }

        }


    });
}

vdbApp.config(['$routeProvider', '$locationProvider', '$httpProvider', '$sceDelegateProvider', function ($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        // .when('/:cityNameClone',{
        // 	templateUrl: 'map.html',
        // 	controller : 'mainCtrl'
        // })
        .when('/gemeente/:cityName/', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/gemeente/:cityName/nieuwe-melding', {
            templateUrl: 'selectproblem.html',
            controller: 'selectProblemCtrl'
        })
        .when('/gemeente/:cityName/nieuw-probleem', {
            templateUrl: 'createissues.html',
            controller: 'createissueCtrl'
        })
        .when('/gemeente/:cityName/nieuw-idee', {
            templateUrl: 'createIdea.html',
            controller: 'createIdeaCtrl'
        })
        .when('/gemeente/:cityName/:action?', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/plaats/:cityNameplaats/:nextaction?', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/postcode/:postalcode', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/postcode/:postalcode/:action?', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/melding/:id', {
            templateUrl: 'issuesView.html',
            controller: 'issuesCtrl'
        })
        .when('/mention', {
            templateUrl: 'mention.html',
            controller: 'mentionCtrl'
        })
        .when('/mijn-meldingen', {
            templateUrl: 'myissues.html',
            controller: 'myIssuesCtrl'
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
        .when('/bevestiging-registratie', {
            templateUrl: 'regisconf.html',
            controller: 'regisconfCtrl'
        })
        .when('/wachtwoord', {
            templateUrl: 'forgotpass.html',
            controller: 'forgotCtrl'
        })
        .when('/bevestiging-wachtwoord-vergeten', {
            templateUrl: 'forgotconf.html',
            controller: 'forgotconfCtrl'
        })
        .when('/nieuwe-melding', {
            templateUrl: 'selectproblem.html',
            controller: 'selectProblemCtrl'
        })
        .when('/nieuw-probleem', {
            templateUrl: 'createissues.html',
            controller: 'createissueCtrl'
        })
        .when('/nieuw-idee', {
            templateUrl: 'createIdea.html',
            controller: 'createIdeaCtrl'
        })
        .when('/mijn-verbeterdebuurt', {
            templateUrl: 'profile.html',
            controller: 'profileCtrl'
        })
        //success create issue
        .when('/bevestiging-nieuwe-melding', {
            templateUrl: 'confirmation-createissue.html'
        })
        //success delete issue
        .when('/bevestiging-verwijderen', {
            templateUrl: 'confirmation-deleteissue.html'
        })
    
        //handle the hash sessions

    //confirm the vote
    .when('/stem/bevestigen/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'confirmVoteCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "confirm_vote";
                    return true;
                }
            }
        })
        //confirm the issue
        //melding/new/34811/45a608c242f9a1e1f1f1e019909d5ac7a1317d9f
        .when('/melding/bevestigen/hash/:hashkey', {
            templateUrl: 'map.html',
            controller: 'hashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "confirm_issue";
                    return true;
                }
            }
        })
        //delete the issue
        //melding/verwijderen/0c0cf551ffc5ade859457961cfbd54af505300f0
        .when('/melding/verwijderen/:hashkey', {
            templateUrl: 'map.html',
            controller: 'hashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "delete_issue";
                    return true;
                }
            }
        })
        //resolve issue with no comment
        //melding/is-opgelost/e9db97963ab54a5a508455d9c43e7b842e865b62/methode/afwijzen
        .when('/melding/is-opgelost/:hashkey/methode/afwijzen', {
            templateUrl: 'map.html',
            controller: 'hashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "resolve_issue_with_comment_no";
                    return true;
                }
            }
        })
        //resolve issue with comment yes
        ///melding/is-opgelost/e9db97963ab54a5a508455d9c43e7b842e865b62/methode/oplossen
        .when('/melding/is-opgelost/:hashkey/methode/oplossen', {
            templateUrl: 'map.html',
            controller: 'hashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "resolve_issue_with_comment_yes";
                    return true;
                }
            }
        })
        //close issue
        ///melding/afsluiten/8f83b0a2992c059248f5f938baa780739ec2952a
        .when('/melding/afsluiten/:hashkey', {
            templateUrl: 'map.html',
            controller: 'hashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "close_issue";
                    return true;
                }
            }
        })
    

    
        //unfollow issue
        .when('/melding/afmelden/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'unfollowIssueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "unfollow_issue";
                    return true;
                }
            }
        })
        //handle registration for hash session
        .when('/registratie/annuleren/hash/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'registrationHashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "cancel_register";
                    return true;
                }
            }
        })
        //cancel registration
        .when('/registratie/bevestigen/hash/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'registrationHashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "register";
                    return true;
                }
            }
        })
        //pretty url for issue-detail
        .when('/:location/:title/:id', {
            templateUrl: 'issuesView.html',
            controller: 'issuesCtrl'
        })
        .when('/auth/:type', {
            resolve: {
                targetAction: function ($rootScope) {
                    return true;
                }
            }
        })
        //redirect city / postcode
        .when('/:cityNameClone', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })
        .when('/:cityNameClone/:nextaction?', {
            templateUrl: 'map.html',
            controller: 'mainCtrl'
        })

    $locationProvider.html5Mode(true);
    $sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self'
	]);
}]);

vdbApp.directive('imgUpload', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.imgUpload);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });

        }
    };
}])

vdbApp.filter('datefilter',function(){
    return function(date){
        var newdate=[];
        newdate[0]=date[8]
        newdate[1]=date[9]
        newdate[2]=date[7]
        newdate[3]=date[5]
        newdate[4]=date[6]
        newdate[5]=date[4]
        newdate[6]=date[0]
        newdate[7]=date[1]
        newdate[8]=date[2]
        newdate[9]=date[3]
        return newdate.toString().replace( /,/g ,"");
    }
})
vdbApp.factory('issuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssues: function (jsondata) {
            return $http.post(APIURL + 'issues', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        issuesService.data = data;
                        return issuesService.data;
                    }

                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return issuesService.data;
        }

    }

}]);

vdbApp.factory('reportService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getReport: function (jsondata) {
            return $http.post(APIURL + 'reports', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        reportService.data = data;
                        return reportService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return reportService.data;

        }
    }

}]);
vdbApp.factory('loginService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getLogin: function (jsondata) {
            return $http.post(APIURL + 'login', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        loginService.data = data;
                        return loginService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return loginService.data;
        }
    };
}])



vdbApp.factory('commentService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getComment: function (jsondata) {
            return $http.post(APIURL + 'comments', jsondata).success(function (data) {
                if (angular.isObject) {
                    commentService.data = data;
                    return commentService.data;
                }
            })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return commentService.data;
        }
    };
}])

vdbApp.factory('registerService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getRegister: function (jsondata) {
            return $http.post(APIURL + 'register', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        registerService.data = data;
                        return registerService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return registerService.data;
        }
    };
}])

vdbApp.factory('newsletterService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getNewsletter: function (jsonnewsletter) {
            return $http.post(APIURL + 'subscribeNewsletter', jsonnewsletter)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        newsletterService.data = data;
                        return newsletterService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return newsletterService.data;
        }
    };
}])



vdbApp.factory('forgotService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getForgot: function (jsondata) {
            return $http.post(APIURL + 'resetPassword', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        forgotService.data = data;
                        return forgotService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return forgotService.data;

        }
    };
}])
vdbApp.factory('myIssuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getMyIssues: function (jsondata) {
            return $http.post(APIURL + 'myIssues', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        myIssuesService.data = data;
                        return myIssuesService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return myIssuesService.data;

        }
    };
}])

vdbApp.factory('commentSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getCommentSubmit: function (jsondata) {
            return $http.post(APIURL + 'commentSubmit', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        commentSubmitService.data = data;
                        return commentSubmitService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return commentSubmitService.data;
        }
    };
}])


vdbApp.factory('profileService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getProfile: function (jsondata) {
            return $http.post(APIURL + 'editSettings', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        profileService.data = data;
                        return profileService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return profileService.data;

        }
    };
}])

vdbApp.factory('syncFBService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getFBSync: function (jsondata) {
            return $http.post(APIURL + 'connectFacebook', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        syncFBService.data = data;
                        return syncFBService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return syncFBService.data;
        }
    };
}])

vdbApp.factory('loginFBService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getFBLogin: function (jsondata) {
            return $http.post(APIURL + 'connectFacebook', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        loginFBService.data = data;
                        return loginFBService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return loginFBService.data;
        }
    };
}])





vdbApp.factory('workLogService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getWorkLog: function (jsondata) {
            return $http.post(APIURL + 'worklogs', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        workLogService.data = data;
                        return workLogService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return workLogService.data;
        }
    };
}])

vdbApp.factory('categoriesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getCategories: function (jsondata) {
            return $http.post(APIURL + 'categories', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        categoriesService.data = data;
                        return categoriesService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return categoriesService.data;
        }

    };
}])
vdbApp.factory('issueSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata) {
            return $http.post(APIURL + 'issueSubmit', jsondata)
                .success(function (data) {
                    issueSubmitService.data = data;
                    return issueSubmitService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return issueSubmitService.data;
        }
    };
}])

vdbApp.factory('issueSubmitServiceWithImage', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata, img) {
            var dataForm = new FormData();
            dataForm.append('json', jsondata);
            dataForm.append('image', img);
            return $http.post(APIURL + 'issueSubmit', dataForm, {
                    transformRequest: angular.identity,
                    headers : { 'Content-Type' : undefined }
                })
                .success(function (data, headers) {
                    logger(data);
                    logger(headers);
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
        }

    }
}]);

vdbApp.factory('voteSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getvoteSummit: function (jsondata) {
            return $http.post(APIURL + 'voteSubmit', jsondata)
                .success(function (data) {
                    voteSubmitService.data = data;
                    return voteSubmitService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return voteSubmitService.data;
        }

    };
}])

vdbApp.factory('statusChangeService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getStatusChange: function (jsondata) {
            return $http.post(APIURL + 'statusChange', jsondata)
                .success(function (data) {
                    statusChangeService.data = data;
                    return statusChangeService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return statusChangeService.data;
        }
    };
}])

vdbApp.factory('issueLogService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueLog: function (jsondata) {
            return $http.post(APIURL + 'issueLog', jsondata)
                .success(function (data) {
                    issueLogService.data = data;
                    return issueLogService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return issueLogService.data;
        }
    };
}])

vdbApp.factory('agreementSevice', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getAgreement: function (jsondata) {
            return $http.post(APIURL + 'agreement', jsondata)
                .success(function (data) {
                    agreementSevice.data = data;
                    return agreementSevice.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return agreementSevice.data;
        }
    };
}])

vdbApp.factory('duplicateIssuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getDuplicateIssue: function (jsondata) {
            return $http.post(APIURL + 'duplicateIssues', jsondata)
                .success(function (data) {
                    duplicateIssuesService.data = data;
                    return duplicateIssuesService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return duplicateIssuesService.data;
        }
    };
}])

vdbApp.factory('getIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssue: function (jsondata) {
            return $http.post(APIURL + 'issueForHash', jsondata)
                .success(function (data) {
                    duplicateIssuesService.data = data;
                    return getIssueService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return getIssueService.data;
        }
    };
}])

vdbApp.factory('confirmRegistrationService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirm: function (jsondata) {
            return $http.post(APIURL + 'confirmRegistration', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        confirmRegistrationService.data = data;
                        return confirmRegistrationService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return confirmRegistrationService.data;

        }
    };
}])

vdbApp.factory('cancelRegistrationService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirm: function (jsondata) {
            return $http.post(APIURL + 'cancelRegistration', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        cancelRegistrationService.data = data;
                        return cancelRegistrationService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return cancelRegistrationService.data;

        }
    };
}])

vdbApp.factory('confirmIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirmIssue: function (jsondata) {
            return $http.post(APIURL + 'confirmIssue', jsondata)
                .success(function (data) {
                    confirmIssueService.data = data;
                    return confirmIssueService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return getConfirmIssueService.data;
        }

    };
}])

vdbApp.factory('serviceStandartService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getServiceStandard: function (jsondata) {
            return $http.post(APIURL + 'serviceStandard', jsondata)
                .success(function (data) {
                    serviceStandartService.data = data;
                    return serviceStandartService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return serviceStandartService.data;
        }
    };
}])

vdbApp.factory('unfollowIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getUnfollowIssue: function (jsondata) {
            return $http.post(APIURL + 'unfollowIssue', jsondata)
                .success(function (data) {
                    unfollowIssueService.data = data;
                    return unfollowIssueService.data;
                })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return unfollowIssueService.data;
        }

    };
}])

vdbApp.factory('confirmVoteService', ["$http",'$rootScope',function ($http,$rootScope) {
    return {
        getConfirmVote: function (jsondata){
            return $http.post(APIURL+ 'confirmVote',jsondata)
            .success(function (data){
                confirmVoteService.data = data;
                return confirmVoteService.data;
            })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
            return confirmVoteService.data;
        }

    };
}])

vdbApp.run(['$rootScope', '$window', function ($rootScope, $window) {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    $rootScope.$on('fb.load', function () {
        $window.dispatchEvent(new Event('fb.load'));
    });

    }]);

vdbApp.controller('mainCtrl', ['$scope', '$timeout', '$window', '$location', '$rootScope', '$routeParams', '$http', 'issuesService', 'reportService', '$facebook', '$cacheFactory', 'agreementSevice', '$cookies','myIssuesService', function ($scope, $timeout, $window, $location, $rootScope, $routeParams, $http, issuesService, reportService, $facebook, $cacheFactory, agreementSevice, $cookies, myIssuesService) {
    // //validate zoom at map
    // $timeout(function(){
    //      if($location.path()=='/'){
    //     map.setOptions({
    //     scrollwheel: true})
    // }
    // else{
    //     map.setOptions({
    //     scrollwheel: false})
    // }
    // },3000)
    //check android or not
    $rootScope.dynamicTitle = "";
    var isAndroid = /(android)/i.test(navigator.userAgent);
    if (isAndroid) {
        logger("android");
    }
    else{
        logger("not android");
    }
    //for redirecting the action
    var nextaction = "";
    if (!(typeof $routeParams.nextaction === 'undefined')) {

        nextaction = "/" + $routeParams.nextaction;

    }

    if (geolocationValid == 0) {


    }

    //                        //geolocation found location
    //                        //SUPPORT GEOLOCATION
    $timeout(function () {
       
        
        if (!$routeParams.cityName && !$routeParams.id && !$routeParams.postalcode && !$routeParams.hashkey) {
            

            if (geolocationValid == 0) {
                if (navigator.geolocation) {
                    browserSupportFlag = true;
                    navigator.geolocation.getCurrentPosition(
                        //when user accept the location
                        function (position) {
                            var mainLat = position.coords.latitude;
                            var mainLng = position.coords.longitude;
                            map.setCenter({
                                lat: mainLat,
                                lng: mainLng
                            });
                            maxlat = map.getBounds().getNorthEast().lat();
                            maxlng = map.getBounds().getNorthEast().lng();
                            minlat = map.getBounds().getSouthWest().lat();
                            minlng = map.getBounds().getSouthWest().lng();
                            var jsondata = JSON.stringify({
                                "coords_criterium": {
                                    "max_lat": maxlat,
                                    "min_lat": minlat,
                                    "max_long": maxlng,
                                    "min_long": minlng
                                }
                            });
                            var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                                var getdata = data.data;
                                $rootScope.newProblemList = getdata.issues;
                                //initial google map marker
                                 // deletemarker(markers);
                                if (getdata.count != 0 || !getdata) {
                                    $window.issuesData = getdata;
                                    showIssue(infoWindow, infoWindowContent);
                                }
                            });
                            var getcity = geocodeGetLocationFound(mainLat, mainLng);
                            var jsoncity = JSON.stringify({
                                "council": "" + getcity + ""
                            });
                            var getReport = reportService.getReport(jsoncity).then(function (data) {
                                var getdata = data.data;
                                $rootScope.reportList = getdata.report;
                            });

                            var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                                var getdata = data.data;
                                $rootScope.agreement = getdata;
                                $timeout(function () {
                                    if (!getdata.logo) {
                                        $rootScope.hideLogo = 1;
                                    } else {
                                        $rootScope.hideLogo = 0;
                                    }
                                })
                            });
                            geolocationValid = 1;

                        },
                        //when user did not share location
                        function (error) {
                            if (error.PERMISSION_DENIED) {               
                                //check if user are logged in?
                                if ($cookies.getObject('user') != null) {
                                    $rootScope.lusername = $cookies.getObject('user').username;
                                    $window.postalcode = $cookies.getObject('user_profile').postcode;
                                    $location.path("/postcode/" +$window.postalcode);
                                    geocodeAddress(geocoder, map)
                                    
        
                                    geolocationValid = 1;
                                    
                                }

                            }
                        }
                    )
                }

                // Browser doesn't support Geolocation
                else {
                    
                    //check if user are logged in?
                    if ($cookies.getObject('user') != null) {
                        $rootScope.lusername = $cookies.getObject('user').username;
                        
                        $window.postalcode = $cookies.getObject('user_profile').postcode;
                        $location.path("/postcode/" +$window.postalcode);
                        geocodeAddress(geocoder, map)
                        
                        
                        geolocationValid = 1;
                    }
                    

                }
            }
        } else {
            //so we have the url..
            geolocationValid = 1;


        }

    }, 3000)


    menuSelected($rootScope, 'home');
    //$scope.hideLogo = 1;
    
    //google map aouto complete
    googleautocompleate('searchCity');


    if ($location.path() == "/plaats/" + $routeParams.cityNameplaats + nextaction) {
        $location.path('gemeente/' + $routeParams.cityNameplaats + nextaction);
        $window.cityName = $routeParams.cityNameplaats;
        geocodeAddress(geocoder, map);
        //$window.cityName = null;
    }

    if ($location.path() == "/" + $routeParams.cityNameClone + nextaction) {
        $location.path('gemeente/' + $routeParams.cityNameClone + nextaction);
        $window.cityName = $routeParams.cityNameClone;
        geocodeAddress(geocoder, map);
       // $window.cityName = null;
    }


    $scope.userpanel = 1;
    $timeout(function () {
        var jsondata = JSON.stringify({
            "coords_criterium": {
                "max_lat": maxlat,
                "min_lat": minlat,
                "max_long": maxlng,
                "min_long": minlng
            }
        });
        var getIssues = issuesService.getIssues(jsondata).then(function (data) {
            var getdata = data.data;
            $rootScope.newProblemList = getdata.issues;
            //initial google map marker
            if (getdata.count != 0 || !getdata) {
                $window.issuesData = getdata;
                 // deletemarker(markers);
                showIssue(infoWindow, infoWindowContent);
                 //logger(markers);
            }
        });



        //auto redirection to new problem
        // if (!(typeof $routeParams.action === 'undefined')) {
        //     if ($routeParams.action == "nieuwe-melding") {
        //         $location.path('/nieuwe-melding');
        //     } else if ($routeParams.action == "nieuw-probleem") {
        //         $location.path('/nieuw-probleem');
        //     } else if ($routeParams.action == "nieuw-idee") {
        //         $location.path('/nieuw-idee');
        //     }
        // }


    }, 3000);
    // if (!$routeParams.cityName) {
    //     if (!$rootScope.lastCity) {
    //         $timeout(function(){
    //             var jsoncity = JSON.stringify({
    //             "council": city.long_name
    //         });
    //             logger(city.long_name);
    //             logger(jsoncity);
    //         var getReport = reportService.getReport(jsoncity).then(function (data) {
    //                 var getdata = data.data;
    //                 $rootScope.reportList = getdata.report;
    //             });

    //         var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
    //                 var getdata = data.data;
    //                 $rootScope.agreement = getdata;
    //                 $timeout(function () {
    //                     if (!getdata.logo) {
    //                         $rootScope.hideLogo = 1;
    //                     } else {
    //                         $rootScope.hideLogo = 0;
    //                         logger($scope.hideLogo);
    //                     }
    //                 })

    //             });
    //         },3000)
            
    //     } else if ($rootScope.lastCity) {
    //         var jsoncity = JSON.stringify({
    //             "council": "" + $rootScope.lastCity + ""
    //         });
    //     }
    // } else {
    //     var jsoncity = JSON.stringify({
    //         "council": "" + $routeParams.cityName + ""
    //     });
    // }
    //send data to google map api for city
    $rootScope.urlBefore = $location.path();
    $window.cityName = $routeParams.cityName;
    if ($routeParams.cityName) {
        $scope.searchCity = $routeParams.cityName;
        $window.cityName = $routeParams.cityName;
        // geocodeAddress(geocoder,map);
    }

    $rootScope.errorSession = "";

    //promise for make asyncronise data factory to be syncronis first load
    if(!$routeParams.cityName){
        $timeout(function(){
                 var jsoncity = JSON.stringify({
                        "council": city.long_name
                    });
            var getReport = reportService.getReport(jsoncity).then(function (data) {
                var getdata = data.data;
                $rootScope.reportList = getdata.report;
            });

            var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                var getdata = data.data;
                $rootScope.agreement = getdata;
                $timeout(function () {
                    if (!getdata.logo) {
                        $rootScope.hideLogo = 1;
                    } else {
                        $rootScope.hideLogo = 0;
                    }
                })

            });
            },3000)
    }
    
   

    //with postal code load
    if ($routeParams.postalcode) {
        $window.postalcode = $routeParams.postalcode;
        geocodeAddress(geocoder,map);
        $window.postalcode = null;
        $timeout(function () {
            
            var jsoncity = JSON.stringify({
                "council": "" + city.long_name + ""
            });
            var getReport = reportService.getReport(jsoncity).then(function (data) {
                var getdata = data.data;
                $rootScope.reportList = getdata.report;
            });

            var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                var getdata = data.data;
                $rootScope.agreement = getdata;
                $timeout(function () {
                    if (!getdata.logo) {
                        $rootScope.hideLogo = 1;
                    } else {
                        $rootScope.hideLogo = 0;
                    }
                })

            });

        }, 3000)
    }

    //click function at map
    $scope.alrCity = function () {
            if (city.long_name != null) {
                //url change validation	
                if ($location.path().includes("/gemeente/") || $location.path().endsWith("/") || $routeParams.postalcode) {
                    if ($rootScope.lastCity != null) {
                        $location.path("/gemeente/" + $rootScope.lastCity);
                        $rootScope.lastCity = null;

                    } else {
                        $location.path("/gemeente/" +city.long_name);
                    }
                    $rootScope.lastUrl = $location.path();
                    $scope.searchCity = city.long_name;

                }

                //Get city problem when click/drag
                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });


                var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                });
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                        } else {
                            $rootScope.hideLogo = 0;
                        }
                    })
                });

                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });
                getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    // logger(markers.length);
                    // for(var x=0 ; x< markers.length ; x++){
                    //       markers[x].setMap(null);
                    //     }
                    $rootScope.newProblemList = getdata.issues;
                    //if (getdata.count != 0 || !getdata) {
                        $window.issuesData = getdata;
                        // deletemarker(markers);
                        showIssue(infoWindow, infoWindowContent);
                   // }

                });
            }



        }
        //login session
    $scope.loginStatus = function () {
        if ($cookies.getObject('user') == null) {
            return false;
        } else {
            $rootScope.lusername = $cookies.getObject('user').username;


            return true;
        }
    }





    //logOut
    $scope.logout = function () {
        $cookies.remove('user');
        $cookies.remove('user_profile');
        // $('.dropdown-menu').hide();
        $scope.userpanel = 0;
        $rootScope.myIssuesList = null;

        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $facebook.logout();
        }

        $location.path('/');
    }

    $scope.showuserpanel = function () {

        if ($scope.userpanel == 0)
            $scope.userpanel = 1;

        //    $('.dropdown-menu').show();

    }

    //search
    $scope.clickSearch = function () {
            $rootScope.globaloverlay = "active";
            $window.cityName = null;
            $window.postalcode = null;
            // deletemarker(markers);
            //$rootScope.lastCity = city.long_name;
            geocodeAddress(geocoder, map);
            $timeout(function () {
                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });
                getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.newProblemList = getdata.issues;
                    if (getdata.count != 0 || !getdata) {
                        $window.issuesData = getdata;
                        showIssue(infoWindow, infoWindowContent);
                    }
                });
                var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                })
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $rootScope.globaloverlay = "";
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                           
                        } else {
                            $rootScope.hideLogo = 0;
                    
                        }
                    })
                });
                $location.path("gemeente/" + city.long_name);
                $rootScope.lastCity = city.long_name;
            }, 3000)


        }
        //move page
    $scope.clickMenu = function (selected) {
        if (selected == "myissues" || selected == "createissue") {
            if (!$cookies.getObject('user')) {
                if (selected == 'myissues') {
                    $rootScope.urlBefore = "/mijn-meldingen";
                    menuSelected($rootScope, 'myIssues');
                    $location.path('/' + "login");
                }
                if (selected == 'createissue') {
                    $rootScope.urlBefore = "/nieuwe-melding";
                    menuSelected($rootScope, 'createissue');
                    $location.path('/nieuwe-melding');
                }
            } else {
                if (selected == "createissue") {
                    $location.path('/nieuwe-melding');

                } else if (selected == "myissues") {
                    $location.path('/mijn-meldingen');
                } else {

                    $location.path('/' + selected);
                }


            }
        } else {
            $location.path('/' + selected);
        }

    }           

            //show my issue
                if ($cookies.getObject('user')) {
                    $scope.hideLogin = true
                    var jsondata = JSON.stringify({
                        "user": {
                            "username": "" + $cookies.getObject('user').username + "",
                            "password_hash": "" + $cookies.getObject('user').password_hash + ""

                        }
                    });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        var count = getdata.count;
                        $rootScope.myIssueCount = count;
                        $rootScope.myIssuesList = getdata.issues;
                    })
                    $scope.hideLogin = true;
                } else {
                    $scope.hideLogin = false;
                }



					}]);
//Retrieving issues




// vdbApp.controller('mainCtrl', ['$scope','issues', function ($scope,issues) {

// }]);



vdbApp.controller('issuesCtrl', ['$scope', '$rootScope', '$window', '$routeParams', 'issuesService', 'reportService', '$location', '$anchorScroll', 'issueLogService', 'commentService', '$timeout', 'voteSubmitService', '$cookies', 'confirmIssueService', 'unfollowIssueService','myIssuesService', 'statusChangeService',function ($scope, $rootScope, $window, $routeParams, issuesService, reportService, $location, $anchorScroll, issueLogService, commentService, $timeout, voteSubmitService, $cookies, confirmIssueService, unfollowIssueService,myIssuesService,statusChangeService) {
    $rootScope.globaloverlay = "active";
    $scope.hide = "ng-hide";
    $scope.overlay = "overlay";
    $scope.hideStatus = "ng-hide";
    $scope.errorVote = "";
    $scope.hideError = 1;
    $scope.highlightid = $routeParams.id;
    $rootScope.dynamicTitle = "Melding |";
    var jsondata = JSON.stringify({
        "issue_id": $routeParams.id
    });
    if ($rootScope.lastUrl == null) {
        $rootScope.lastUrl == '/';
    }
    // if ($rootScope.standardTemp) {
    //     $scope.hideError = 0;
    //     $scope.successClass = "successAlert";
    //     $scope.successMessage = $rootScope.standardTemp;
    // }
    if ($rootScope.successCreateLogin == 1) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = "Je melding is verstuurd!";
        $scope.successMessage = $rootScope.standardTemp;
    }
    if ($rootScope.successCreateNonLogin == 1 ) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = "Bevestiging probleem bij uw e-mail";
    }
    if($rootScope.successVote ==1){
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = $rootScope.voteMessage;
    }
    $rootScope.urlBefore = $location.path();
    var getIssues = issuesService.getIssues(jsondata).then(function (data) {
        var getdata = data.data;
        $rootScope.problemIdList = getdata.issues;
         $rootScope.dynamicTitle = ''+getdata.issues[0].title+' |';
        $timeout(function(){
        mainLat = getdata.issues[0].location.latitude;
        mainLng = getdata.issues[0].location.longitude;
        map.setCenter({ lat: mainLat,
                        lng: mainLng});
            

        },1000)
        
        var lat=getdata.issues[0].location.latitude;
        var lng=getdata.issues[0].location.longitude;
        $scope.sateliteimg = "http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=18&size=515x300&maptype=hybrid&format=jpg&key=AIzaSyCk3yxCifnV67hIJ2iyRupfH2iHvshna3I&markers=color:red%7C"+lat+","+lng+"&sensor=false";

        

        $scope.hide = "";
        $rootScope.globaloverlay = "";
        //                        var jsoncity = JSON.stringify({"council":""+getdata.issues[0].council+""});
        // 		var getReport = reportService.getReport( jsoncity ).then(function (data){
        // 		var getdata = data.data;
        // 		$rootScope.reportList = getdata.report;

        // });
        //close issue with hashcode
        if ($rootScope.targetAction === "close_issue") {
            $('#CloseModal').modal('show');
            $rootScope.getStatusId = $routeParams.id;
            $rootScope.hashSession = null;
            $rootScope.targetAction = null;
        }
        
        var hashToDelete = $rootScope.hashSession;
        
        
        
        $scope.deleteIssueWithHash = function () {
            $rootScope.globaloverlay = "active";
            
            var user = {};
            
            user.authorisation_hash = hashToDelete;
            var issue_id = $rootScope.getStatusId;
            var status = "deleted";
            var jsondata = JSON.stringify({
                "user" : {
                    "authorisation_hash" : hashToDelete
                },
                "issue_id" : issue_id,
                "status" : status        
            });


            
            var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
                var getStatusChange = data.data;
                
                //validate error or not
                if (getStatusChange.success) {
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        
                        $('#DeleteModal').modal('hide');
                        $('.modal-backdrop').hide();
                        $rootScope.globaloverlay = "";
                        $scope.error = "";
                        $scope.hideError = "ng-hide";
                        $location.path("/bevestiging-verwijderen");
                        

                    })
                    } else {
                        $scope.errorVote = getStatusChange.error;
                        $scope.hideError = "";
                        $rootScope.globaloverlay = "";
                    }
                

            });
        }

        //delete issue with hashcode
        if ($rootScope.targetAction === "delete_issue") {
            $('#DeleteModal').modal('show');
            $rootScope.getStatusId = $routeParams.id;
            $rootScope.hashSession = null;
            $rootScope.targetAction = null;
        }
        
        
        //resolve issue without comment 
        if($rootScope.targetAction === "resolve_issue_with_comment_no") {
            $('#ResolveModalSimple').modal('show');
            $rootScope.getStatusId = $routeParams.id;
            // $rootScope.hashSession = null;
            // $rootScope.targetAction = null;
        }
        
        //resolve issue without comment 
        if($rootScope.targetAction === "resolve_issue_with_comment_yes") {
            $('#ResolveModal').modal('show');
            $rootScope.getStatusId = $routeParams.id;
            // $rootScope.hashSession = null;
            // $rootScope.targetAction = null;
        }


        
        
        
        //confirm issue with hash code
        if ($rootScope.targetAction === "confirm_issue") {
            $rootScope.globaloverlay = "active";
            var authorisation_hash = $rootScope.hashSession;
            
            var jsondata = JSON.stringify({
                "authorisation_hash" : authorisation_hash    
            });
            var getConfirmIssue = confirmIssueService.getConfirmIssue(jsondata).then(function (data) {
                var getConfirmIssue = data.data;
                if (!getConfirmIssue.success) {
                    $scope.hideError = 0;
                    $scope.errorConfirmed = getConfirmIssue.error;
                    $rootScope.globaloverlay = "";
                } else {
                    var jsondata = JSON.stringify({
                        "issue_id": $routeParams.id
                    });
                    var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        $scope.hideError = 0;
                        $scope.successClass = "successAlert";
                        $scope.errorConfirmed = "Geregistreerd bij gemeente.";
                        var getdata = data.data;
                        $rootScope.problemIdList = getdata.issues;
                        $rootScope.globaloverlay = "";
                    });
                }

            });
            $rootScope.hashSession = null;
            $rootScope.targetAction = null;
        }

    });

    $scope.id = function () {
        return $routeParams.id;
    }

    //validity must login when comment
    $scope.sessionValid = function () {
        if (!$cookies.getObject('user')) {
            $location.path("/login");
            $scope.stemModal = "";
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
        } else {
            $scope.stemModal = "#StemModal";
        }
    };

    //validation for submit vote
    $scope.voteSubmit = function () {
        if (!$cookies.getObject('user')) {
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn.";
             $('#voteModal').modal('show');

        } else {
            $rootScope.globaloverlay = "active";
            var jsonVoteSubmit = JSON.stringify({
                "user": {
                    "username": "" + $cookies.getObject('user').username + "",
                    "password_hash": "" + $cookies.getObject('user').password_hash + ""
                },
                "issue_id": $routeParams.id
            });
            var getvoteSummit = voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
                var getvoteSummit = data.data;
                if (!getvoteSummit.success) {
                    $scope.hideError = 0;
                    $scope.errorVote = "" + getvoteSummit.error + "";
                    $(window).scrollTop(0);
                } else {
                    var jsondata = JSON.stringify({
                        "issue_id": $routeParams.id
                    });
                    var getIssues = issuesService.getIssues(jsondata).then(function (data) {
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
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }

    //facebook & twitter share
    $scope.sharefacebook = function () {
        var text = encodeURI($location.absUrl());
        var url = "http://www.facebook.com/sharer/sharer.php?u=" + text;
        var win = window.open(url, '_blank');
        win.focus();

    }

    $scope.sharetwitter = function () {
        var text = encodeURI($location.absUrl());
        var url = "https://twitter.com/intent/tweet?text=" + text;
        var win = window.open(url, '_blank');
        win.focus();

    }


    //googlemap
    $scope.googleMapIssue = function (lat, lng, type) {
            googleMapIssue(lat, lng, type);
    }
    
        //hide log Status
    if ($cookies.getObject('user')) {
        var logjsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""
            },
            "issue_id": "" + $routeParams.id + ""
        });

        var getIssueLog = issueLogService.getIssueLog(logjsondata).then(function (data) {
            var getdata = data.data;
            if (!getdata.success) {
                $scope.hideLogStatus = "ng-hide";
            } else if (getdata.success && getdata.counts == 0) {
                $scope.hideLogStatus = "ng-hide";
            } else {
                $scope.hideLogStatus = "";
                $scope.showDataText = "Meer >>";
                $scope.issueLogList = getdata.logs;
            }
        });
    } else {
        var logjsondata = JSON.stringify({
            "issue_id": "" + $routeParams.id + ""
        });
   
        var getIssueLog = issueLogService.getIssueLog(logjsondata).then(function (data) {
            var getdata = data.data;
            if (!getdata.success) {
                $scope.hideLogStatus = "ng-hide";

            } else if (getdata.success && getdata.counts == 0) {
                $scope.hideLogStatus = "ng-hide";

            } else {
                $scope.hideLogStatus = "";
                $scope.showDataText = "Meer >>";
                $scope.issueLogList = getdata.logs;

            }
        });
    }

    //to hide and show log status
    $scope.logStatus = function () {
            if ($scope.hideStatus == "ng-hide") {
                $scope.hideStatus = "";
                $scope.showDataText = "Minder <<";
            } else {
                $scope.hideStatus = "ng-hide";
                 $scope.showDataText = "Meer >>";
            }
        }
        //show Comment
    var commentjsondata = JSON.stringify({
        "issue_id": "" + $routeParams.id + ""
    });
    var getComment = commentService.getComment(commentjsondata).then(function (data) {
        var getComment = data.data;
        $rootScope.commentList = getComment.comments;
    });
    ''
    //close error
    $scope.closeError = function () {
        $scope.hideError = 1;
        $scope.errorVote = "";
    }
    $rootScope.standardTemp = null;
    $rootScope.successCreateLogin = 0;
    $rootScope.successCreateNonLogin = 0;
    $rootScope.successVote = 0;

    //show my issue
                if ($cookies.getObject('user')) {
                    $scope.hideLogin = true
                    var jsondata = JSON.stringify({
                        "user": {
                            "username": "" + $cookies.getObject('user').username + "",
                            "password_hash": "" + $cookies.getObject('user').password_hash + ""

                        }
                    });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        var count = getdata.count;
                        $rootScope.myIssueCount = count;
                        $rootScope.myIssuesList = getdata.issues;
                    })
                    $scope.hideLogin = true
                } else {
                    $scope.hideLogin = false;
                }
}])


vdbApp.controller('mentionCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
    menuSelected($rootScope, 'mention');
    if ($window.sessionStorage.username == null) {
        $rootScope.urlBefore = $location.path();
        $location.path('/login');
    }
}])

vdbApp.controller('myIssuesCtrl', ['$scope', '$rootScope', '$window', '$location', 'myIssuesService', '$cookies', function ($scope, $rootScope, $window, $location, myIssuesService, $cookies) {
    $rootScope.dynamicTitle = "Mijn meldingen |";
    $scope.hide = "";
    menuSelected($rootScope, 'myIssues');

    $rootScope.currentPage = 1;
    $scope.totalPage = 3;
    if ($cookies.getObject('user') == null) {
        $rootScope.urlBefore = $location.path();
        $location.path('/login');
    }
    var jsondata = JSON.stringify({
        "user": {
            "username": "" + $cookies.getObject('user').username + "",
            "password_hash": "" + $cookies.getObject('user').password_hash + ""

        }
    });
    //to get hash password
    // logger(jsondata);
    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
        var getdata = data.data;
        $rootScope.count = getdata.count;
        $rootScope.myIssuesList = getdata.issues;
    })
    $scope.myIssueDetailClick = function (id) {
        $location.path("/mijn-meldingen/" + id);
    }

    $scope.getIdStatus = function (id) {
        $rootScope.getStatusId = id;
    }

}])

vdbApp.controller('myIssuesDetailCtrl', ['$scope', '$routeParams', '$http', '$rootScope', '$location', '$window', 'myIssuesService', 'issueLogService', 'commentService', 'voteSubmitService', '$cookies','$timeout', function ($scope, $routeParams, $http, $rootScope, $location, $window, myIssuesService, issueLogService, commentService, voteSubmitService, $cookies,$timeout) {
    $rootScope.dynamicTitle = "Mijn meldingen |";
    $scope.hide = "";
    $scope.hideStatus = "ng-hide";
    $scope.errorVote = "";
    $scope.hideError = 1;
    $scope.successClass = "";
    menuSelected($rootScope, 'myIssues');
    $rootScope.globaloverlay = "active";
    $scope.id = function () {
        return $routeParams.id;
    }
    if ($cookies.getObject('user') == null) {
        $rootScope.urlBefore = $location.path();
        $location.path('/login');
    }
    if ($rootScope.standardTemp) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessage = $rootScope.standardTemp;
    }
    // if ($rootScope.successCreateLogin == 1) {
    //     $scope.hideError = 0;
    //     $scope.successClass = "successAlert";
    //     $scope.successMessageNonApi = "Je melding is verstuurd!";
    // }
    if ($rootScope.successCreateNonLogin == 1 ) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = "Bevestiging probleem bij uw e-mail";
    }
    var jsondata = JSON.stringify({
        "user": {
            "username": "" + $cookies.getObject('user').username + "",
            "password_hash": "" + $cookies.getObject('user').password_hash + ""

        }
    });

    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
        var getdata = data.data;
        $rootScope.count = getdata.count;
        $rootScope.myIssuesList = getdata.issues;
        $rootScope.globaloverlay = "";
        for(var i = 0 ; i < getdata.count ; i++){
            if(getdata.issues[i].id == $routeParams.id){
                $timeout(function(){
                    mainLat = getdata.issues[i].location.latitude;
                    mainLng = getdata.issues[i].location.longitude;
                    map.setCenter({ lat: mainLat,
                                    lng: mainLng});
                    
                    
                },1000)
                
                var lat = getdata.issues[i].location.latitude;
                var lng = getdata.issues[i].location.longitude;
                $scope.sateliteimg = "http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=18&size=515x300&maptype=hybrid&format=jpg&key=AIzaSyCk3yxCifnV67hIJ2iyRupfH2iHvshna3I&markers=color:red%7C"+lat+","+lng+"&sensor=false";

                 
                
                break;
            }
        }
    })
    $scope.id = function () {
        return $routeParams.id;
    }

    //call googlemap
    $scope.googleMapIssue = function (lat, lng, type) {
        googleMapIssue(lat, lng, type);
    }

    //hidelog
    if ($cookies.getObject('user')) {
        var logjsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""
            },
            "issue_id": "" + $routeParams.id + ""
        });
        var getIssueLog = issueLogService.getIssueLog(logjsondata).then(function (data) {
            var getdata = data.data;
            if (!getdata.success) {
                $scope.hideLogStatus = "ng-hide";
            } else if (getdata.success && getdata.count == 0) {
                $scope.hideLogStatus = "ng-hide";
            } else {
                $scope.hideLogStatus = "";
                $scope.showDataText = "Meer >>";
                $scope.issueLogList = getdata.logs;
            }
        });
    } else {
        $scope.hideLogStatus = "ng-hide";
    }

    //to hide and show log
    //to hide and show log status
    $scope.logStatus = function () {
            if ($scope.hideStatus == "ng-hide") {
                $scope.hideStatus = "";
                $scope.showDataText = "Minder <<";
            } else {
                $scope.hideStatus = "ng-hide";
                $scope.showDataText = "Meer >>";
            }
        }
        //comment
        //validity must login when comment
    $scope.sessionValid = function () {
        if (!$cookies.getObject('user')) {
            $location.path("/login");
            $scope.stemModal = "";
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
        } else {
            $scope.stemModal = "#StemModal";
        }
    };

    //voteSubmit
    $scope.voteSubmit = function () {
            if (!$cookies.getObject('user')) {
                $location.path("/login");
                $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
            } else {
                $rootScope.globaloverlay = "active";
                var jsonVoteSubmit = JSON.stringify({
                    "user": {
                        "username": "" + $cookies.getObject('user').username + "",
                        "password_hash": "" + $cookies.getObject('user').password_hash + ""
                    },
                    "issue_id": $routeParams.id
                });
                var getvoteSummit = voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
                    var getvoteSummit = data.data;
                    if (!getvoteSummit.success) {
                        $scope.hideError = 0;
                        $scope.errorVote = "" + getvoteSummit.error + "";
                    } else {
                        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
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
    var commentjsondata = JSON.stringify({
        "issue_id": "" + $routeParams.id + ""
    });
    var getComment = commentService.getComment(commentjsondata).then(function (data) {
        var getComment = data.data;
        $rootScope.commentList = getComment.comments;
    });
    //close error
    $scope.closeError = function () {
            $scope.hideError = 1;
            $scope.errorVote = "";
        }
        //delete success Create
    $rootScope.standardTemp = null;
    $rootScope.successCreateLogin = 0;
    $rootScope.successCreateNonLogin = 0;
    $rootScope.successVote = 0;

    //show my issue
                if ($cookies.getObject('user')) {
                    $scope.hideLogin = true
                    var jsondata = JSON.stringify({
                        "user": {
                            "username": "" + $cookies.getObject('user').username + "",
                            "password_hash": "" + $cookies.getObject('user').password_hash + ""

                        }
                    });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        var count = getdata.count;
                        $rootScope.myIssueCount = count;
                        $rootScope.myIssuesList = getdata.issues;
                    })
                    $scope.hideLogin = true
                } else {
                    $scope.hideLogin = false;
                }

}])

vdbApp.controller('loginCtrl', ['$scope', '$rootScope', '$window', 'loginService', '$location', '$facebook', '$cookies', function ($scope, $rootScope, $window, loginService, $location, $facebook, $cookies) {
    $rootScope.dynamicTitle = "Login |";
    $scope.hide = "ng-hide";
    $scope.lusername = "";
    $scope.lpassword = "";

    //$scope.overlay ACTIVE WHENclick and overlay when no event
    $scope.overlay = "overlay";


    if ($rootScope.urlBefore == null || $rootScope.urlBefore == '/login') {
        $rootScope.urlBefore = '/';
    }
    if ($cookies.getObject('user') != null) {
        $location.path('/');
    }

    //error session
    if ($rootScope.errorSession) {
        $scope.hide = "";
    }
    //remember me
    if ($cookies.get('username') && $cookies.get('password')) {
        $scope.rememberMe = true;
        $scope.lusername = $cookies.get('username');
        $scope.lpassword = $cookies.get('password');
    }
    //facebook login
    //this is the function to do the login or do redirect to registration
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {

            $facebook.api('/me?fields=first_name,last_name,email').then(function (user) {

                $rootScope.globaloverlay = "active";
                $scope.facebookuser = user;


                //here we create the json to login
                var facebookID = $scope.facebookuser.id;
                var jsondata = JSON.stringify({
                    "user": {
                        "facebookID" : facebookID
                    }
                });

                logger($scope.facebookuser);

                //logger(jsondata);

                var getLogin = loginService.getLogin(jsondata).then(function (data) {

                    var result = data.data;
                    logger(result);
                    if (!result.success) {
                        //fix this if false
                        $location.path('/registreren');
                        //in here we already had our facebook session!
                        $window.sessionStorage.facebookID = $scope.facebookuser.id;
                        $window.sessionStorage.name = $scope.facebookuser.first_name;
                        $window.sessionStorage.email = $scope.facebookuser.email;
                        $window.sessionStorage.surname = $scope.facebookuser.last_name;
                        $rootScope.globaloverlay = "";

                    } else if (result.success) {
                        //we got user data here, please log me in!
                        $cookies.putObject('user', result.user);
                        $cookies.putObject('user_profile', result.user_profile);

                        $rootScope.loginStatus = function () {
                            return true;
                        }
                        $rootScope.globaloverlay = "";
                        $rootScope.errorSession = "";
                        if ($rootScope.urlBefore == '/registreren' || $rootScope.urlBefore == '/bevestiging-registratie') {
                            $location.path('/map');
                        } else {
                            $location.path($rootScope.urlBefore);
                        }



                    }


                    $rootScope.globaloverlay = "";

                });


            });
        } else {

        }
    });

    $scope.FBlogin = function () {
        $facebook.login();
    }


    $scope.loginWithOndernemingsDossier = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "ondernemingsdossierURL": "" + $location.url() + ""
        });
        logger("jsondata:" + jsondata);
        var getLogin = loginService.getLogin(jsondata).then(function (data) {
            var getLogin = data.data;

            if (!getLogin.success && getLogin.ondernemingsDossier != undefined) {
                //go to register with data prefilled
                //fix this if false
                $scope.errorMessage = getLogin.error;
                //in here we already had our facebook session!
                $scope.hide = "";
                $rootScope.globaloverlay = "";
                $location.path('/registreren');
                $window.sessionStorage.ondernemingsdossierID = getLogin.ondernemingsDossier.ondernemingsdossierID;
                $window.sessionStorage.name = getLogin.ondernemingsDossier.naam;
                $window.sessionStorage.email = getLogin.ondernemingsDossier.email;
                $window.sessionStorage.postcode = getLogin.ondernemingsDossier.postcode;
                $window.sessionStorage.address_number = getLogin.ondernemingsDossier.huisnummer;
                $rootScope.errorSession = getLogin.error;

            } else if (!getLogin.success) {
                $scope.errorMessage = getLogin.error;
                $scope.hide = "";
                $rootScope.globaloverlay = "";
            } else if (getLogin.success) {
                //this is the same code as login succes, better to separate?
                //temp for data session
                var expired = new Date();
                expired.setHours(expired.getHours() +2);
                logger(expired);
                $cookies.putObject('user', getLogin.user, {
                    expires: expired
                });
                $cookies.putObject('user_profile', getLogin.user_profile, {
                    expires: expired
                });
                logger($cookies.getObject('user'));
                //remember me
                if ($scope.rememberMe === true) {
                    var expired = new Date();
                    expired.setDate(expired.getDate() + 7);
                    logger(expired);
                    $cookies.put('username', $scope.lusername, {
                        expires: expired
                    });
                    $cookies.put('password', $scope.lpassword, {
                        expires: expired
                    });
                    $cookies.putObject('user', getLogin.user, {
                        expires: expired
                    });
                    $cookies.putObject('user_profile', getLogin.user_profile, {
                        expires: expired
                    });
                } else {
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                $rootScope.loginStatus = function () {
                    return true;
                }
                $rootScope.globaloverlay = "";
                $rootScope.errorSession = "";
                var postcode = $location.search().postcode;
                logger(postcode);
                if (postcode != undefined) {
                    $location.search({});
                    $location.path('/postcode/' + (postcode.replace(/ /g, "").toUpperCase()));
                } else {
                    $location.path('/');
                }

            }
        })

    }

    $scope.login = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $scope.lusername + "",
                "password": "" + $scope.lpassword + ""
            }
        });
        var getLogin = loginService.getLogin(jsondata).then(function (data) {
            var getLogin = data.data;
            if (!getLogin.success) {
                $scope.errorMessage = getLogin.error;
                $scope.hide = "";
                $rootScope.globaloverlay = "";
            } else if (getLogin.success) {
                //temp for data session
                var expired = new Date();
                expired.setHours(expired.getHours() +2);
                $cookies.putObject('user', getLogin.user, {
                    expires: expired
                });
                $cookies.putObject('user_profile', getLogin.user_profile, {
                    expires: expired
                });
                //remember me
                if ($scope.rememberMe === true) {
                    var expired = new Date();
                    expired.setDate(expired.getDate() + 7);
                    $cookies.put('username', $scope.lusername, {
                        expires: expired
                    });
                    $cookies.put('password', $scope.lpassword, {
                        expires: expired
                    });
                    $cookies.putObject('user', getLogin.user, {
                        expires: expired
                    });
                    $cookies.putObject('user_profile', getLogin.user_profile, {
                        expires: expired
                    });
                } else {
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                $rootScope.loginStatus = function () {
                    return true;
                }
                $rootScope.globaloverlay = "";
                $rootScope.errorSession = "";
                if ($rootScope.urlBefore == '/registreren') {
                    $location.path('/map');
                } else {
                    $location.path($rootScope.urlBefore);
                }

            }
        })

    }
    $scope.close = function () {
            $scope.hide = "ng-hide";
            $rootScope.errorSession = "";
        }
        //move to register page
    $scope.register = function () {
        $location.path('/registreren');
    }

    $scope.forgotpass = function () {
        $location.path('/wachtwoord');

    }

    //check for ondernemingsDossier
    if ($rootScope.urlBefore == '/ondernemingsdossier_landingpage') {
        $scope.loginWithOndernemingsDossier();
    }

}])


vdbApp.controller('registerCtrl', ['$scope', '$rootScope', '$window', 'registerService', 'newsletterService', '$location', '$facebook', function ($scope, $rootScope, $window, registerService, newsletterService, $location, $facebook) {
    $rootScope.dynamicTitle = "Registreren";
    $scope.home = function () {
        $location.path('/');

    }

    $scope.hide = "ng-hide";
    //$scope.overlay="overlay";
    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.errorFB = "";
    $scope.facebookID = "";
    $scope.sexoption = [
        {
            'name': 'Dhr.',
            'value': 'm'
        },
        {
            'name': 'Mw.',
            'value': 'f'
        }
    ];


    //if facebook session is present from previous login with facebook
    $scope.fbstatus = $facebook.isConnected();
    if ($scope.fbstatus) {

        if ($window.sessionStorage.name) $scope.username = $window.sessionStorage.name;
        if ($window.sessionStorage.email) $scope.email = $window.sessionStorage.email;
        if ($window.sessionStorage.surname) $scope.surname = $window.sessionStorage.surname;
        $scope.facebookID = $window.sessionStorage.facebookID;

    }

    if ($window.sessionStorage.ondernemingsdossierID != undefined) {
        logger($window.sessionStorage.name);
        if ($window.sessionStorage.name) $scope.username = $window.sessionStorage.name.replace(/\+/g, "").replace(/-/g, "").replace(/_/g, "").replace(/\//g, "").replace(/ /g, "").toLowerCase();
        if ($window.sessionStorage.email) $scope.email = $window.sessionStorage.email;
        if ($window.sessionStorage.postcode) $scope.postcode = $window.sessionStorage.postcode;
        if ($window.sessionStorage.address_number) $scope.address_number = $window.sessionStorage.address_number;
        $scope.ondernemingsdossierID = $window.sessionStorage.ondernemingsdossierID;

    }

    //set default message for facebook button
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = ($scope.fbstatus) ? 1 : 0;
    if ($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";


    //this is the function to get the facebook ID for new user
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $facebook.api('/me?fields=first_name,last_name,email').then(function (user) {
                $scope.facebookuser = user;
                $scope.errorFB = "";

                //set button to connected
                $scope.facebookMessages = "Gekoppeld met Facebook";
                $scope.facebookExist = 1;
                $scope.facebookID = $scope.facebookuser.id;

                //set value of the field if still blank
                if ($scope.email == "") $scope.email = $scope.facebookuser.email;
                if ($scope.initials == "") $scope.initials = $scope.facebookuser.first_name;
                if ($scope.surname == "") $scope.surname = $scope.facebookuser.last_name;


            });
        }
    });




    $scope.connectFacebook = function () {

        $facebook.login();

    }


    $scope.sex = $scope.sexoption[0].value;

    if ($rootScope.errorSession) {
        $scope.errorNewUsername = $rootScope.errorSession;
        $scope.hide = "";
    }



    $scope.register = function () {

        if ($scope.ondernemingsdossierID == null) {
            var ondernemingsdossierID = "";
        }

        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $scope.username + "",
                "password": "" + $scope.password + "",
                "email": "" + $scope.email + ""
            },

            "user_profile": {
                "initials": "" + $scope.initials + "",
                "tussenvoegsel": "" + $scope.tussenvoegsel + "",
                "surname": "" + $scope.surname + "",
                "sex": "" + $scope.sex + "",
                "address": "" + $scope.address + "",
                "address_number": "" + $scope.address_number + "",
                "address_suffix": "" + $scope.address_suffix + "",
                "postcode": "" + $scope.postcode + "",
                "city": "" + $scope.city + "",
                "phone": "" + $scope.phone + "",
                "facebookID": "" + $scope.facebookID + "",
                "ondernemingsdossierID": "" + ondernemingsdossierID
            }





        });



        $rootScope.tempemail = $scope.email;




        var getRegister = registerService.getRegister(jsondata).then(function (data) {
            var getRegister = data.data;
            $scope.errorPassword = ""




            if ($scope.password != $scope.password2) {
                $scope.errorPassword = "Wachtwoord komt niet niet overeen"
                $scope.hide = "";
            }

            if (!getRegister.success) {


                $scope.errorEmail = getRegister.errors.email;
                $scope.errorNewPassword = getRegister.errors.password;
                $scope.errorPassword1 = getRegister.errors.password_repeat;
                $scope.errorNewUsername = getRegister.errors.username;
                $scope.errorSurname = getRegister.errors.surname;
                $scope.errorAddress = getRegister.errors.address;
                $scope.errorAddressN = getRegister.errors.address_number;
                $scope.errorPost = getRegister.errors.postcode;
                $scope.errorCity = getRegister.errors.city;
                $scope.errorMiddle = getRegister.errors.tussenvoegsel;
                $scope.errorPost = getRegister.errors.postcode;
                $scope.errorInitials = getRegister.errors.initials;




                $scope.hide = "";
                $rootScope.globaloverlay = "";
                $(window).scrollTop(0);
            }

            if (getRegister.success) {
                $location.path('/bevestiging-registratie');
                $rootScope.globaloverlay = "";

                if ($scope.newsletter == true) {

                    var jsonnewsletter = JSON.stringify({
                        "user": {
                            "username": "" + $scope.username + "",
                            "password": "" + $scope.password + ""
                        }
                    })

                    var getNewsletter = newsletterService.getNewsletter(jsonnewsletter).then(function (data) {
                        var getNewsletter = data.data;
                    
                    })
                }

            
            }

        })



    }

    $scope.close = function () {
        $scope.hide = "ng-hide";

    }


}])


vdbApp.controller('regisconfCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {

    $scope.home = function () {
        $location.path('/');

    }


                                      }]);
vdbApp.controller('commentSubmitCtrl', ['$scope', '$route', '$rootScope', '$window', '$routeParams', '$location', 'commentSubmitService', 'commentService', 'issuesService', 'myIssuesService', '$cookies', function ($scope, $route, $rootScope, $window, $routeParams, $location, commentSubmitService, commentService, issuesService, myIssuesService, $cookies) {
    //comment Service :v
    $scope.hide = "ng-hide";
    $scope.commentSubmit = function (issueType) {
        // validation for issue type
        if (issueType == "problem") {
            $scope.tempIssueType = "problem";
        } else {
            $scope.tempIssueType = "reaction";
        }
        $rootScope.globaloverlay = "active";

        var user = {};
        user.username = $cookies.getObject('user').username;
        user.password_hash = $cookies.getObject('user').password_hash;
        var issue_id = $routeParams.id;
        var type = $scope.tempIssueType;
        if (!$scope.comment) {
            var body = "";
        } else {
            var body = $scope.comment;
        }
        var jsondata = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash
            },
            "issue_id" : issue_id,
            "type" : type,
            "body" : body            
        });
        var getCommentSubmit = commentSubmitService.getCommentSubmit(jsondata).then(function (data) {
            var getCommentSubmit = data.data;
            if (!getCommentSubmit.success) {
                $rootScope.globaloverlay = "";
                $scope.hide = "";
                $scope.errorBody = "" + getCommentSubmit.error + ""
            } else {
                $rootScope.globaloverlay = "";
                //bad practice hide modal
                $('#StemModal').modal('hide');
                $('.modal-backdrop').hide();
                $scope.comment = "";
                $scope.hide = "ng-hide";
                //refresh comment list
                var commentjsondata = JSON.stringify({
                    "issue_id": "" + $routeParams.id + ""
                });
                var getComment = commentService.getComment(commentjsondata).then(function (data) {
                    var getComment = data.data;
                    $rootScope.commentList = getComment.comments;
                });
                var jsondata = JSON.stringify({
                    "issue_id": $routeParams.id
                });
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
                var jsondatamyIssue = JSON.stringify({
                    "user": {
                        "username": "" + $cookies.getObject('user').username + "",
                        "password_hash": "" + $cookies.getObject('user').password_hash + ""
                    }
                });
                var getMyIssues = myIssuesService.getMyIssues(jsondatamyIssue).then(function (data) {
                    var getdata = data.data;
                    $rootScope.myIssuesList = getdata.issues;
                })
            }

            //comment count



        })

    }
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
 }])

vdbApp.controller('forgotCtrl', ['$scope', '$rootScope', '$window', 'forgotService', '$location', function ($scope, $rootScope, $window, forgotService, $location) {
    $scope.hide = "ng-hide";
    $scope.overlay = "overlay";
    $rootScope.dynamicTitle = "Wachtwoord vergeten |";



    $scope.forgotpass = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "email": "" + $scope.femail + ""
        });

        $rootScope.tempemail1 = $scope.femail;


        var getForgot = forgotService.getForgot(jsondata).then(function (data) {

            var getForgot = data.data;
            $scope.errorFEmail = ""


            if (getForgot.success == "false") {
                $scope.errorFEmail = getForgot.error;
                $scope.hide = "";
            } else {

                $location.path('/bevestiging-wachtwoord-vergeten');

            }
            $rootScope.globaloverlay = "";
        });


    }

    $scope.close = function () {
        $scope.hide = "ng-hide";


    }

}])



vdbApp.controller('forgotconfCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
    $rootScope.dynamicTitle = "wachtwoord";
    $scope.home = function () {
        $location.path('/');

    }

}]);




vdbApp.controller('profileCtrl', ['$scope', '$rootScope', '$window', 'profileService', 'loginService', '$location', '$facebook', 'syncFBService', '$cookies', function ($scope, $rootScope, $window, profileService , loginService, $location, $facebook, syncFBService, $cookies) {
    $scope.hide = "ng-hide";
    $rootScope.dynamicTitle = "Mijn profiel |";
    $scope.home = function () {
        $location.path('/');
    }

    //error session
    if ($rootScope.errorSession) {
        $scope.hide = "";
    }

    var c_user = $cookies.getObject('user');
    var c_user_profile = $cookies.getObject('user_profile');

    //set default message for facebook button
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = (c_user_profile.facebookID) ? 1 : 0;
    if ($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";




    //this is the function to sync the profile
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $rootScope.globaloverlay = "active";
            //sync data here
            $facebook.api('/me').then(function (user) {
                $scope.facebookuser = user;


                //here we create the json     
                var username = $scope.username;
                var facebookID = $scope.facebookuser.id;
                var jsondata = JSON.stringify({
                    "username" : username,
                    "facebookID" : facebookID
                });

                //API call to connectFB
                var connectFB = syncFBService.getFBSync(jsondata).then(function (data) {

                    var result = data.data;

                    if (result.success == 'false') {
                        var error = result.error;
                        $scope.errorFB = error;
                        $facebook.logout();
                        $scope.hide = "";
                        $scope.successAlert = "";
                        $scope.successClass = "";
                        $scope.errorEmail = "";
                        $scope.errorOldPassword = "";
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


                    } else if (result.success) {
                        $scope.errorFB = "";

                        //set button to connected
                        $scope.facebookMessages = "Gekoppeld met Facebook";
                        $scope.facebookExist = 1;

                        //fix this into cookies 
                        $window.sessionStorage.facebookID = facebookID;
                        var user = $cookies.getObject('user');
                        var user_profile = $cookies.getObject('user_profile');
                        var expired = new Date();
                        expired.setHours(expired.getHours() +2);
                        user_profile.facebookID = facebookID;
                        $cookies.putObject('user', user, {
                            expires: expired
                        });
                        $cookies.putObject('user_profile', user_profile, {
                            expires: expired
                        });
                    }

                    $rootScope.globaloverlay = "";
                });
            });
        }
    });




    $scope.connectFacebook = function () {

        $facebook.login();

    }

    //                        $scope.loginToggle = function() {
    //                            if($scope.status) {
    //                                $facebook.logout();
    //                            } else {
    //                                $facebook.login();
    //                            }
    //                        };


    $scope.username = c_user.username;
    $scope.email = c_user.email;
    if (c_user_profile.sex == 'man') {
        $scope.selected1 = 1;
        $scope.selected2 = 0;
    } else {

        $scope.selected2 = 1;
        $scope.selected1 = 0;

    }

    $scope.initials = c_user_profile.initials;
    if (c_user_profile.tussenvoegsel == 'null') {
        $scope.tussenvoegsel = "";
    } else {
        $scope.tussenvoegsel = c_user_profile.tussenvoegsel;
    }

    $scope.surname = c_user_profile.surname;
    $scope.address = c_user_profile.address;
    $scope.address_number = c_user_profile.address_number;
    $scope.postcode = c_user_profile.postcode;
    $scope.city = c_user_profile.city;
    $scope.phone = c_user_profile.phone;


    //logger({user,password,user_profile});
    $scope.profile = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorEmail = "";
        $scope.errorOldPassword = null;
        $scope.errorNewPassword = null;
        $scope.errorInitials = "";
        $scope.errorSurname = "";
        $scope.errorAddress = "";
        $scope.errorAddressN = "";
        $scope.errorPostcode = "";
        $scope.errorCity = "";
        $scope.errorSex = "";
        $scope.errorPasshash = "";
        $scope.errorFB = "";
        $scope.errorPassword3 = null;
    


        $scope.hide = "ng-hide";
        c_user = $cookies.getObject('user');
        c_user_profile = $cookies.getObject('user_profile');
        var user = {};
        user.username = c_user.username;
        user.password_hash = c_user.password_hash;
        var password = {}
        if ($scope.password_old != null) {
            password.password_old = $scope.password_old;
        }
        if ($scope.password_new != null) {
            password.password_new = $scope.password_new;
        }
        if ($scope.rpassword != null) {
            password.rpassword = $scope.rpassword;
        }

        var user_profile = {}

        if ($scope.initials != null) {
            user_profile.initials = $scope.initials;
        }
        if ($scope.tussenvoegsel != null) {
            user_profile.tussenvoegsel = $scope.tussenvoegsel;
        }
        if ($scope.surname != null) {
            user_profile.surname = $scope.surname;
        }
        if ($scope.email != null) {
            user_profile.email = $scope.email;
        }
        if ($scope.sex != null) {
            user_profile.sex = $scope.sex;
        }
        if ($scope.address_old != null) {
            user_profile.address_old = $scope.address_old;
        }
        if ($scope.address != null) {
            user_profile.address = $scope.address;
        }
        if ($scope.address_number != null) {
            user_profile.address_number = $scope.address_number;
        }
        if ($scope.address_suffix != null) {
            user_profile.address_suffix = $scope.address_suffix;
        }
        if ($scope.postcode != null) {
            user_profile.postcode = $scope.postcode;
        }
        if ($scope.city != null) {
            user_profile.city = $scope.city;
        }
        if ($scope.phone != null) {
            user_profile.phone = $scope.phone;
        }


        if ($scope.password_new != $scope.rpassword) {

            $scope.errorPassword3 = "Wachtwoord komt niet overeen"
            $scope.hide = "";
            $(window).scrollTop(0);
            $rootScope.globaloverlay = "";


        } else if ($scope.password_new == $scope.rpassword) {
            
            var jsondataObj = new Object();
            jsondataObj.user = user;
            jsondataObj.password = password;
            jsondataObj.user_profile = user_profile;
            var jsondata = JSON.stringify(jsondataObj);
            
//            var jsondata = JSON.stringify({
//                "user" : {
//                    "username" : c_user.username,
//                    "password_hash" : c_user.password_hash,
//                },
//                "password" : {
//                    "password_old" : $scope.password_old,
//                    "password_new" : $scope.password_new  
//                },
//                "user_profile" : {
//                    "initials" : $scope.initials,
//                    "tussenvoegsel" : $scope.tussenvoegsel,    
//                    "surname" : $scope.surname,
//                    "email" : $scope.email,
//                    "sex" : $scope.sex,
//                    "address_old" : $scope.address_old,
//                    "address" : $scope.address,
//                    "address_number": $scope.address_number,
//                    "address_suffix": $scope.address_suffix,
//                    "postcode" : $scope.postcode,
//                    "city" : $scope.city,
//                    "phone" : $scope.phone
//                } 
//            });
            var getProfile = profileService.getProfile(jsondata).then(function (data) {

                var getProfile = data.data;


                if (getProfile.success == false) {

                    if (getProfile.success == false) {

                        $scope.errorEmail = getProfile.errors.email;
                        $scope.errorOldPassword = getProfile.errors.password_old;
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

                    }

                    $scope.hide = "";
                    $scope.successAlert = "";
                    $scope.successClass = "";
                    $scope.overlay = "overlay";

                    $(window).scrollTop(0);



                    $rootScope.globaloverlay = "";



                } else if (getProfile.success)

                {


                    if ($scope.password_old != null && $scope.password_new != null) {
                        var password = $scope.password_new;
                        var jsondatalogin = JSON.stringify({
                            "user": {
                                "username": "" + c_user.username + "",
                                "password" : $scope.password_new
                            }
                        });
                    } else {
                        var password_hash = c_user.password_hash;
                        var jsondatalogin = JSON.stringify({
                            "user": {
                                "username": "" + c_user.username + "",
                                "password_hash" : password_hash
                            }
                        });
                    }
                    var getLogin = loginService.getLogin(jsondatalogin).then(function (data) {
                        var getLogin = data.data;


//                        if ($scope.newsletter == true) {
//
//                            var jsonnewsletter = JSON.stringify({
//                                "user": {
//                                    "username": "" + $scope.username + "",
//                                    "password": "" + $scope.password + ""
//                                }
//                            })
//
//                            var getNewsletter = newsletterService.getNewsletter(jsonnewsletter).then(function (data) {
//                                var getNewsletter = data.data;
//                                logger(getNewsletter);
//                            })
//                        }

                       

                       
                        $cookies.putObject('user', getLogin.user);
                        $cookies.putObject('user_profile', getLogin.user_profile);
                        var expired = new Date();
                        expired.setHours(expired.getHours() +2);
                        $cookies.putObject('user', getLogin.user, {
                            expires: expired
                        });
                        $cookies.putObject('user_profile', getLogin.user_profile, {
                            expires: expired
                        });
                        $rootScope.globaloverlay = "";
                        $(window).scrollTop(0);
                        $scope.successAlert = "Profiel geüpdatet";
                        $scope.successClass = "successAlert";
                        $scope.hide = "";
                        $scope.password_new = "";
                        $scope.password_old = "";
                        $scope.rpassword = "";


                    })

                }

            });


        }

        $scope.successAlert = "";
        $scope.successClass = "";

        $scope.close = function () {

            $scope.hide = "ng-hide";


        }
    }



}])

vdbApp.controller('selectProblemCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandartService','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandartService,reportService,issuesService,agreementSevice,$routeParams) {
     $rootScope.dynamicTitle = "Nieuw Melding |";
     $scope.redirectproblem = function(){
        if($routeParams.cityName){
            $location.path('gemeente/'+$routeParams.cityName+'/nieuw-probleem');
        }
        else{
            $location.path('/nieuw-probleem');
        }
     }
      $scope.redirectidea = function(){
        if($routeParams.cityName){
            $location.path('gemeente/'+$routeParams.cityName+'/nieuw-idee');
        }
        else{
            $location.path('/nieuw-idee');
        }
     }
}])

vdbApp.controller('createissueCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandartService','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandartService,reportService,issuesService,agreementSevice,$routeParams) {
    if($location.path().includes('nieuwe-melding')){
        $rootScope.dynamicTitle = "Nieuw Melding |";
    }
    else{
        $rootScope.dynamicTitle = "Nieuw probleem |";
    }
    
    $scope.hide = "ng-hide";
    $scope.issueName = "Probleem"
    $scope.hideIssue = 1;
    $scope.myIssueCount = 0;
    $scope.slide = "";
    $scope.initslide = "toggle-button";
    $scope.loadCategory = 1;
    $scope.count = 0;
    $scope.standardMessage = "";
    $rootScope.urlBefore = $location.path();

    //to send to another city gemeente/Amsterdam/niew-probleem
    if($routeParams.cityName){
        $window.cityName = $routeParams.cityName;
        geocodeAddress(geocoder, map);
    }
    //googlemapautocompleate
    googleautocompleate('searchCityProblem');
    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.sexoption = [
        {
            'name': 'Dhr.',
            'value': 'm'
        },
        {
            'name': 'Mw.',
            'value': 'f'
        }
   		];
    $scope.sex = $scope.sexoption[0].value;

    $timeout(function () {
        $scope.slide = "toggle-button-selected-left";
    }, 0)
    $rootScope.lastUrl = $location.path();

    menuSelected($rootScope, 'createissue');
    //show my issue
    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""

            }
        });
        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
            var getdata = data.data;
            var count = getdata.count;
            $rootScope.myIssueCount = count;
            $rootScope.myIssuesList = getdata.issues;
        })
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }
    //first initial
    $timeout(function () {
        if (latlngChange) {
            googleMapCreateProblem(latlngChange);
            var latitude = markerLat;
            var longitude = markerLng;
            var jsondataCity = JSON.stringify({
                "latitude" : latitude,
                "longitude" : longitude
            });
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $timeout(function () {
                    $scope.loadCategory = 0;
                })
            });

        } else {
            latlngChange = {
                lat: 52.158367,
                lng: 4.492999
            };
            googleMapCreateProblem(latlngChange);
            var latitude = markerLat;
            var longitude = markerLng;
            var jsondataCity = JSON.stringify({
                "latitude" : latitude,
                "longitude" : longitude
            });
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $timeout(function () {
                    $scope.loadCategory = 0;
                })
            });
        }
    }, 1200);

    $scope.categoriesData = function () {
        $scope.loadCategory = 1;
        $scope.count = 0;
        $scope.duplicateDataList = null;
        var latitude = markerLat;
        var longitude = markerLng;
        var jsondataCity = JSON.stringify({
            "latitude" : latitude,
            "longitude" : longitude
        });
        $timeout(function () {
            $scope.categoriesList = null;
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $timeout(function () {
                    $scope.loadCategory = 0;
                })
            });


        }, 3000)
    }


    $scope.clickSearchCreateIssue = function () {
        geocodeAddressCreateProblem(geocoder, map3, $scope.searchCityCreate,"location");
        $scope.loadCategory = 1;
        city.long_name = $scope.searchCityCreate;
        $rootScope.lastCity = $scope.searchCityCreate;
        $timeout(function(){
            marker.setPosition(map.getCenter());
        },1000)
        $timeout(function () {
            var latitude = marker.getPosition().lat();
            var longitude = marker.getPosition().lng();
            var jsondataCity = JSON.stringify({
                "latitude" : latitude,
                "longitude" : longitude
            });
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $scope.loadCategory = 0;
            });
            var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                });
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                        } else {
                            $rootScope.hideLogo = 0;
                        }
                    })
                });
            var jsondata = JSON.stringify({
                "coords_criterium": {
                    "max_lat": maxlat,
                    "min_lat": minlat,
                    "max_long": maxlng,
                    "min_long": minlng
                }
            });
            getIssues = issuesService.getIssues(jsondata).then(function (data) {
                var getdata = data.data;
                $rootScope.newProblemList = getdata.issues;
                if (getdata.count != 0 || !getdata) {
                    $window.issuesData = getdata;
                    showIssue(infoWindow, infoWindowContent);
                }
            });

        },2000)



    }
    $scope.createIssue = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorTitle = "";
        $scope.errorDescription = "";
        $scope.errorId = "";
        $scope.errorIdStyle = "";
        $scope.errorLocation = "";
        $scope.errorInitials = "";
        $scope.errorCity = "";
        $scope.errorSurname = "";
        $scope.errorEmail = "";
        $scope.errorPostcode = "";
        $scope.errorStreet = "";
        $scope.errorStreetNumber = "";

        //initial data for request
        var user = {};
        var user_profile = {};
        var issue = {};
        var location = {};
        var file = $scope.imgData;
        //login
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        //not login
        else {
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
        if ($scope.categoryId) {
            issue.category_id = $scope.categoryId;
        } else {
            issue.category_id = -1;
        }

        if ($scope.title) {
            issue.title = $scope.title;
        } else {
            issue.title = "";
        }
        if ($scope.description) {
            issue.description = $scope.description;
        } else {
            issue.description = "";
        }
        //location
        location.latitude = markerLat;
        location.longitude = markerLng;
        logger("createlat:"+location.latitude);
        logger("createlong:"+location.longitude);
        
        if ($cookies.getObject('user')) { //login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "username" : user.username,
                    "password_hash" : user.password_hash
                },
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" :  issue.type,
                    "category_id" :  issue.category_id
                }, 
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });


        }else{
            //not login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "email" : user.email
                },
                "user_profile" : {
                    "initials" : $scope.initials,
                    "tussenvoegsel" : $scope.tussenvoegsel,    
                    "surname" : $scope.surname,
                    "sex" : $scope.sex,
                    "address" : $scope.address,
                    "address_number": $scope.address_number,
                    "address_suffix": $scope.address_suffix,
                    "postcode" : $scope.postcode,
                    "city" : $scope.city,
                    "phone" : $scope.phone                   
                }, 
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" :  issue.type,
                    "category_id" :  issue.category_id
                }, 
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });

        }
        
        //old 
        /*
        var jsondataSubmit = JSON.stringify({
            
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""

            }
            
            , user_profile, issue, location
        });
        */
        
        if (!file) {
            //without image
            var getIssueSubmit = issueSubmitService.getIssueSubmit(jsondataSubmit).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorId = issueData.errors.category_id;
                        $scope.errorIdStyle = 'border-color: #a94442';
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Acternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    var issueId = issueData.issue_id;
                    //login
                    if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        
                        //go to confirmation with a message
//                        
//                        $location.path(/melding/ + issueId);
                        $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    var jsondata = JSON.stringify({
                        "coords_criterium": {
                            "max_lat": maxlat,
                            "min_lat": minlat,
                            "max_long": maxlng,
                            "min_long": minlng
                        }
                    });
                    getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.newProblemList = getdata.issues;
                        if (getdata.count != 0 || !getdata) {
                            $window.issuesData = getdata;
                            showIssue(infoWindow, infoWindowContent);
                        }

                    });

                }

            });
        } else if (file) {
            //with
            issueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorId = issueData.errors.category_id;
                        $scope.errorIdStyle = 'border-color: #a94442';
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorsletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Acternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    $rootScope.successCreate = 1;
                    var issueId = issueData.issue_id;
                    if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        // $location.path(/melding/ + issueId);
                         $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    var jsondata = JSON.stringify({
                        "coords_criterium": {
                            "max_lat": maxlat,
                            "min_lat": minlat,
                            "max_long": maxlng,
                            "min_long": minlng
                        }
                    });
                    getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.newProblemList = getdata.issues;
                        if (getdata.count != 0 || !getdata) {
                            $window.issuesData = getdata;
                            showIssue(infoWindow, infoWindowContent);
                        }

                    });

                }
            });
        }




    }
    $scope.alrCityCreate = function () {
                //Get city problem when click/drag
                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });


                var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                });
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                        } else {
                            $rootScope.hideLogo = 0;
                        }
                    })
                });

                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });
                getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.newProblemList = getdata.issues;
                    if (getdata.count != 0 || !getdata) {
                        $window.issuesData = getdata;
                        showIssue(infoWindow, infoWindowContent);
                    }

                });
            }

    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
    $scope.reset = function () {
            $scope.title = "";
            $scope.description = "";
        }
        //switch bar change
    $scope.switchButton = function () {
            $location.path('/nieuw-idee');
            markerLat = marker.getPosition().lat();
            markerLng = marker.getPosition().lng();
        }
        //dulicate data
    $scope.duplicateData = function () {
        
        $('#duplicate-bubble').hide();
        var user = {};
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        var lat = markerLat;
        var long = markerLng;
        var council = city.long_name;
        var category_id = $scope.categoryId;
        $rootScope.currentPage = 1;
        $scope.totalPage = 5;
        var jsondataServiceStandard = JSON.stringify({
            "council" : council,
            "category_id" : category_id
        });
        var jsondataDuplicate = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash
            }
            ,
            "lat" : lat,
            "long" : long,
            "category_id" : category_id
        });
        logger(jsondataDuplicate);
        var getDuplicateIssue = duplicateIssuesService.getDuplicateIssue(jsondataDuplicate).then(function (data) {
            var getDuplicateIssue = data.data;
            $scope.count = data.data.count;
            $scope.duplicateDataList = getDuplicateIssue.issues;
            logger(getDuplicateIssue);

        });
        var getServiceStandard = serviceStandartService.getServiceStandard(jsondataServiceStandard).then(function (data) {
            var getServiceStandard = data.data;
            $scope.standardMessage = getServiceStandard.standard;
            $rootScope.standardTemp = getServiceStandard.standard;
        })


        $scope.blockstyle = "margin-left:0%";
        $scope.duplicateposition = 0;

    }



    $scope.moveDuplicate = function (move) {

        var limit = $scope.count - 3;
        $scope.duplicateposition = $scope.duplicateposition + move;

        if ($scope.duplicateposition < 0) $scope.duplicateposition = 0;

        if ($scope.duplicateposition > limit) $scope.duplicateposition = limit;



        var move = $scope.duplicateposition * -33.333;
        $scope.blockstyle = "margin-left:" + move + "%";



    }


		}])

vdbApp.controller('createIdeaCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', '$cookies','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, $cookies,reportService,issuesService,agreementSevice,$routeParams) {
    $rootScope.dynamicTitle = "Nieuw idee |";
    $scope.hide = "ng-hide";
    $scope.issueName = "Probleem"
    $scope.hideIssue = 1;
    $scope.myIssueCount = 0;
    $scope.initslide = "toggle-button2 ";
    $rootScope.urlBefore = $location.path();
    //google map auto compleate
    googleautocompleate('searchCityProblem');
    
    //to send to another city gemeente/Amsterdam/niew-probleem
    if($routeParams.cityName){
        $window.cityName = $routeParams.cityName;
        geocodeAddress(geocoder, map);
    }

    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.sexoption = [
        {
            'name': 'Dhr.',
            'value': 'm'
        },
        {
            'name': 'Mw.',
            'value': 'f'
        }
   		];
    $scope.sex = $scope.sexoption[0].value;

    $timeout(function () {
        $scope.slide = "toggle-button-selected-right";
    }, 0)

    menuSelected($rootScope, 'createissue');

    //show my issue
    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""

            }
        });
        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
            var getdata = data.data;
            var count = getdata.count;
            $rootScope.myIssueCount = count;
            $rootScope.myIssuesList = getdata.issues;
        })
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }
    //first initial
    $timeout(function () {
        if (latlngChange) {
            googleMapCreateIdea(latlngChange);
            var latitude = markerLat;
            var longitude = markerLng;
            // var jsondataCity = JSON.stringify({latitude,longitude});
            // var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
            // 	$scope.categoriesList = data.data.categories;
            // });

        } else {
            latlngChange = {
                lat: 52.158367,
                lng: 4.492999
            };
            googleMapCreateIdea(latlngChange);
            latlngChange = null;
            var latitude = markerLat;
            var longitude = markerLng;
            // var jsondataCity = JSON.stringify({latitude,longitude});
            // var getCategories = categoriesService.getCategories( jsondataCity ).then(function (data){
            // 	$scope.categoriesList = data.data.categories;
            // });
        }
    }, 1200);


    if ($cookies.getObject('user')) {
        $scope.hideNonLogin = "ng-hide"
    }
    $scope.clickSearchCreateIssue = function () {
        geocodeAddressCreateProblem(geocoder, map4, $scope.searchCityCreate,"location2");
        city.long_name = $scope.searchCityCreate;
        var latitude = markerLat;
        var longitude = markerLng;
        $rootScope.lastCity = $scope.searchCityCreate;
        var jsondataCity = JSON.stringify({
            "latitude" : latitude,
            "longitude" : longitude
        });
        
        
        

    
        $timeout(function () {
            var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                });
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                        } else {
                            $rootScope.hideLogo = 0;
                        }
                    })
                });
            var jsondata = JSON.stringify({
                "coords_criterium": {
                    "max_lat": maxlat,
                    "min_lat": minlat,
                    "max_long": maxlng,
                    "min_long": minlng
                }
            });
            getIssues = issuesService.getIssues(jsondata).then(function (data) {
               var getdata = data.data;
                    $rootScope.newProblemList = getdata.issues;
                    if (getdata.count != 0 || !getdata) {
                        $window.issuesData = getdata;
                        showIssue(infoWindow, infoWindowContent);
                    }

            });
            
            marker.setPosition(map.getCenter());
            
            //change location after search
            markerLat = marker.getPosition().lat();
            markerLng = marker.getPosition().lng();

            
        }, 1000)


    }

    $scope.alrCityCreate = function () {
                //Get city problem when click/drag
                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });


                var jsoncity = JSON.stringify({
                    "council": "" + city.long_name + ""
                });
                var getReport = reportService.getReport(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.reportList = getdata.report;
                });
                var getAgreement = agreementSevice.getAgreement(jsoncity).then(function (data) {
                    var getdata = data.data;
                    $rootScope.agreement = getdata;
                    $timeout(function () {
                        if (!getdata.logo) {
                            $rootScope.hideLogo = 1;
                        } else {
                            $rootScope.hideLogo = 0;
                        }
                    })
                });

                var jsondata = JSON.stringify({
                    "coords_criterium": {
                        "max_lat": maxlat,
                        "min_lat": minlat,
                        "max_long": maxlng,
                        "min_long": minlng
                    }
                });
                getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.newProblemList = getdata.issues;
                    if (getdata.count != 0 || !getdata) {
                        $window.issuesData = getdata;
                        showIssue(infoWindow, infoWindowContent);
                    }

                });
            }

    $scope.createIdea = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorTitle = "";
        $scope.errorDescription = "";
        $scope.errorId = "";
        $scope.errorIdStyle = "";
        $scope.errorLocation = "";
        $scope.errorInitials = "";
        $scope.errorCity = "";
        $scope.errorSurname = "";
        $scope.errorEmail = "";
        $scope.errorPostcode = "";
        $scope.errorStreet = "";
        $scope.errorStreetNumber = "";
        var file = $scope.imgData;

        //initial data for request
        var user = {};
        var user_profile = {};
        var issue = {};
        var location = {};

        //login
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        //not login
        else {
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
        if ($scope.ideaRealization) {
            issue.realization = $scope.ideaRealization;
        } else {
            issue.realization = "";
        }

        if ($scope.ideaTitle) {
            issue.title = $scope.ideaTitle;
        } else {
            issue.title = "";
        }
        if ($scope.ideaDescription) {
            issue.description = $scope.ideaDescription;
        } else {
            issue.description = "";
        }
        //location
        location.latitude = markerLat;
        location.longitude = markerLng;
        var jsondataSubmit;
        if ($cookies.getObject('user')) { //login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "username" : user.username,
                    "password_hash" : user.password_hash,
                },
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" : issue.type,
                    "realization" : issue.realization
                    
                }, 
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });
            
            
        }else{
            //not login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "email" : user.email
                },
                "user_profile" : {
                    "initials" : $scope.initials,
                    "tussenvoegsel" : $scope.tussenvoegsel,    
                    "surname" : $scope.surname,
                    "sex" : $scope.sex,
                    "address" : $scope.address,
                    "address_number": $scope.address_number,
                    "address_suffix": $scope.address_suffix,
                    "postcode" : $scope.postcode,
                    "city" : $scope.city,
                    "phone" : $scope.phone                   
                }, 
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" : issue.type,
                    "realization" : issue.realization
                    
                }, 
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });
            
        }
            
            
        
        
 

        if (!file) {
            var getIssueSubmit = issueSubmitService.getIssueSubmit(jsondataSubmit).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorRealization = "Realisatie " + issueData.errors.realization;
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Achternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }


                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    $rootScope.successCreate = 1;
                    var issueId = issueData.issue_id;
                     if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        // $location.path(/melding/ + issueId);
                        // $rootScope.successCreateNonLogin = 1;
                         $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    var jsondata = JSON.stringify({
                        "coords_criterium": {
                            "max_lat": maxlat,
                            "min_lat": minlat,
                            "max_long": maxlng,
                            "min_long": minlng
                        }
                    });
                    getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.newProblemList = getdata.issues;
                        if (getdata.count != 0 || !getdata) {
                            $window.issuesData = getdata;
                            showIssue(infoWindow, infoWindowContent);
                        }

                    });
                }

            });
        } else if (file) {
            issueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorId = issueData.errors.category_id;
                        $scope.errorIdStyle = 'border-color: #a94442';
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorsletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Acternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    var issueId = issueData.issue_id;
                    $rootScope.successCreate = 1;
                     if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        // $location.path(/melding/ + issueId);
                        // $rootScope.successCreateNonLogin = 1;
                        $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    var jsondata = JSON.stringify({
                        "coords_criterium": {
                            "max_lat": maxlat,
                            "min_lat": minlat,
                            "max_long": maxlng,
                            "min_long": minlng
                        }
                    });
                    getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.newProblemList = getdata.issues;
                        if (getdata.count != 0 || !getdata) {
                            $window.issuesData = getdata;
                            showIssue(infoWindow, infoWindowContent);
                        }

                    });
                }
            });

        }



    }


    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
    $scope.reset = function () {
            $scope.title = "";
            $scope.description = "";
        }
        //switch bar change
    $scope.switchButton = function () {
        $location.path('/nieuw-probleem');
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
    }

}]);

vdbApp.controller('deleteIssueCtrl', ['$scope', '$rootScope', '$routeParams', '$window', 'statusChangeService', 'myIssuesService', '$cookies', function ($scope, $rootScope, $routeParams, $window, statusChangeService, myIssuesService, $cookies) {
    $scope.hideError = "ng-hide";
    $scope.error = "";
    $scope.deleteIssue = function () {
        $rootScope.globaloverlay = "active";
        var user = {};
        user.username = $cookies.getObject('user').username;
        user.password_hash = $cookies.getObject('user').password_hash;
        var issue_id = $rootScope.getStatusId;
        var status = "deleted";
        var jsondata = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash,
            },
            "issue_id" : issue_id,
             "status" : status
        });
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
            var getStatusChange = data.data;
            //validate error or not
            if (getStatusChange.success) {
                var jsondata = JSON.stringify({
                    "user": {
                        "username": "" + $cookies.getObject('user').username + "",
                        "password_hash": "" + $cookies.getObject('user').password_hash + ""
                    }
                });
                var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
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
            } else {
                $scope.error = getStatusChange.error;
                $scope.hideError = "";
                $rootScope.globaloverlay = "";
            }
            //load myissue

        });
    }
    $scope.close = function () {
        $scope.hideError = "ng-hide";
        $scope.error = "";
    }
    $scope.cancel = function () {
        $scope.error = "";
        $scope.hideError = "ng-hide";
    }
}])

vdbApp.controller('closeIssueCtrl', ['$scope', '$rootScope', '$routeParams', '$window', 'statusChangeService', 'myIssuesService', '$cookies', function ($scope, $rootScope, $routeParams, $window, statusChangeService, myIssuesService, $cookies) {
    $scope.hideError = "ng-hide";
    $scope.errorClose = "";

    $scope.closeIssueClick = function () {
        $rootScope.globaloverlay = "active";
        var user = {};
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        } else {
            user.authorisation_hash = $rootScope.hashSession;
        }

        var issue_id = $rootScope.getStatusId;
        if (!$scope.feedback) {
            var result = null;
        } else {
            var result = $scope.feedback;
        }
        if (!$scope.rating) {
            var appreciation = null;
        } else {
            var appreciation = parseInt($scope.rating);
        }
        var status = "closed";

            var jsondata = JSON.stringify({
            "user" : {
            "username" : user.username,
            "password_hash" : user.password_hash,
            "authorisation_hash": user.authorisation_hash

            ,
        },
                                      "issue_id" : issue_id,
                                      "result" : result,
                                      "appreciation" : appreciation,
                                      "status" : status
                                      });
        
        
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
            var getStatusChange = data.data;
            if (!getStatusChange.success) {
                $scope.hideError = "";
                $scope.errorClose = getStatusChange.error;
                $rootScope.globaloverlay = "";
            } else {
                //load myissue
                if ($cookies.getObject('user')) {
                    var jsondata = JSON.stringify({
                        "user": {
                            "username": "" + $cookies.getObject('user').username + "",
                            "password_hash": "" + $cookies.getObject('user').password_hash + ""
                        }
                    });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
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
                } else {
                    $('#CloseModal').modal('hide');
                    $('.modal-backdrop').hide();
                    $rootScope.globaloverlay = "";
                    $scope.errorClose = "";
                    $scope.feedback = "";
                    $scope.rating = null;
                }

            }

        });
    }
    $scope.close = function () {
        $scope.hideError = "ng-hide";
        $scope.errorClose = "";
        $scope.feedback = "";
        $scope.rating = null;
    }

}])


vdbApp.controller('hashCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'getIssueService', function ($scope, $rootScope, $routeParams, $window, $location, getIssueService, targetAction) {


    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;
    var jsonhash = JSON.stringify({
        "authorisation_hash": "" + hash + ""
    });

    var getIssue = getIssueService.getIssue(jsonhash).then(function (data) {
        var result = data.data;

        if (result.success) {
            //we got the correct hash, so correct issue id
            var issueID = result.issue_id;
            $location.path("/melding/" + issueID);


        } else {
            //show error
            var error = result.error;
            alert(error);
            $location.path("/");
            $rootScope.hashSession = null;
            $rootScope.targetAction = null;
        }
    });
}])

vdbApp.controller('unfollowIssueCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'unfollowIssueService', function ($scope, $rootScope, $routeParams, $window, $location, unfollowIssueService, targetAction) {

    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;
    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    //unfollow issue with hash code
    $rootScope.globaloverlay = "active";
    var authorisation_hash = $rootScope.hashSession;
    var jsondata = JSON.stringify({
        "hash": "" + authorisation_hash + ""});
    var getUnfollowIssue = unfollowIssueService.getUnfollowIssue(jsondata).then(function (data) {
        var getUnfollowIssue = data.data;
        if (!getUnfollowIssue.success) {
            $scope.message = getUnfollowIssue.error;
            $rootScope.globaloverlay = "";
            $scope.errorUnfollow = true;
        } else {
            $scope.message = getUnfollowIssue.message;
            if(!$scope.message) $scope.message = "Je volgt deze melding niet meer.";
            $rootScope.globaloverlay = "";
            $rootScope.standardTemp = $scope.message;
            var issueID = getUnfollowIssue.issue_id;
            $location.path("/melding/" + issueID);
        }

    });
    $rootScope.hashSession = null;
    $rootScope.targetAction = null;


}])






//registration hash handling

vdbApp.controller('registrationHashCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'confirmRegistrationService', 'cancelRegistrationService', function ($scope, $rootScope, $routeParams, $window, $location, confirmRegistrationService, cancelRegistrationService, targetAction) {


    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;

    $rootScope.urlBefore = null;
    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    if ($rootScope.targetAction === "register") {
        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "hash": "" + $rootScope.hashSession + ""
        });

        var getConfirm = confirmRegistrationService.getConfirm(jsondata).then(function (data) {
            var confirmation = data.data;
            if (!confirmation.success) {
                $rootScope.globaloverlay = "";
                $scope.message = confirmation.message;
                $scope.showerror = true;


            } else {
                $rootScope.globaloverlay = "";
                $scope.successConfirm = true;
            }
        });

        $rootScope.hashSession = null;
        $rootScope.targetAction = null;
    } else if ($rootScope.targetAction === "cancel_register") {
        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "hash": "" + $rootScope.hashSession + ""
        });

        var getConfirm = cancelRegistrationService.getConfirm(jsondata).then(function (data) {
            var confirmation = data.data;
            if (!confirmation.success) {
                $rootScope.globaloverlay = "";
                $scope.message = confirmation.message;
                $scope.showerror = true;


            } else {
                $rootScope.globaloverlay = "";
                $scope.cancelConfirm = true;
            }
        });

        $rootScope.hashSession = null;
        $rootScope.targetAction = null;
    }







}])

vdbApp.controller('voteCtrl', ['$scope','$rootScope','$routeParams','voteSubmitService', function ($scope,$rootScope,$routeParams,voteSubmitService) {
    $scope.hide = 1;
    $scope.submit = function(){
            $rootScope.globaloverlay = "active";
            var user = {};
            user.email = $scope.email;
            

            user.name = $scope.name;
            var issue_id = $routeParams.id;

            var jsondata = JSON.stringify({
                "user" : {
                    "name" : user.name,
                    "email" : user.email,
                },
                issue_id : issue_id
            });
            var getvoteSummit = voteSubmitService.getvoteSummit(jsondata).then(function (data) {
                var getvoteSubmit = data.data;
                if(!getvoteSubmit.success){
                    $rootScope.globaloverlay = "";
                    $scope.hide = 0;
                    $scope.error = "" + getvoteSubmit.error + ""
                    
                }
                else{
                    $rootScope.globaloverlay = "";
                    $('#voteModal').modal('hide');
                    $('.modal-backdrop').hide();
                }
            }); 
    }
    $scope.close = function () {
        $scope.hide = 1;
    }
}]);

vdbApp.controller('confirmVoteCtrl', ['$scope','$rootScope','$routeParams','confirmVoteService','$location', function ($scope,$rootScope,$routeParams,confirmVoteService,$location) {
    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;

    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    $rootScope.globaloverlay = "active";
    var authorisation_hash = $rootScope.hashSession;
    var jsondata = JSON.stringify({
        "hash": "" + authorisation_hash + ""
    });
    var getConfirmVote = confirmVoteService.getConfirmVote(jsondata).then(function (data) {
        var getConfirmVote = data.data;
        if (!getConfirmVote.success) {
            $scope.message = getConfirmVote.error;
            $rootScope.globaloverlay = "";
            $scope.errorVote = true;
        } else {
            $scope.message = getConfirmVote.message;
            var getdata = data.data;
            $rootScope.globaloverlay = "";
            $location.path('/melding/'+getdata.issue_id);
            $rootScope.voteMessage = getdata.message;
            $rootScope.successVote = 1;
        }

    });
    $rootScope.hashSession = null;
    $rootScope.targetAction = null;
}])

vdbApp.controller('resolveIssueCommentNoCtrl', ['$scope','$rootScope','$routeParams','statusChangeService','$location','issuesService',function ($scope,$rootScope,$routeParams,statusChangeService,$location,issuesService) {
    $scope.hide= "ng-hide";
    $scope.resolve = function(){
        $rootScope.globaloverlay = "active";
        var user = {};
        user.authorisation_hash = $rootScope.hashSession;
        var comment = $scope.resolveComment;
        var issue_id = $rootScope.getStatusId;
        var status = "resolved";
        var jsondata = JSON.stringify({
           "user" : {
                    "authorisation_hash" : user.authorisation_hash
            },
            "comment" : comment,
            "issue_id" : issue_id,
            "status" : status});
        
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data){
            var getStatusChange = data.data;
            if(!getStatusChange.success){
                $rootScope.globaloverlay = "";
                $scope.hide="";
                $scope.error = getStatusChange.error;
            }
            else{
                $rootScope.globaloverlay = "";
                $('#ResolveModalSimple').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.hashSession = null;
                $rootScope.targetAction = null;
                var jsondata = JSON.stringify({"issue_id" : issue_id});
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
            }
           

        });
    }
    $scope.close =function(){
        $scope.error="";
        $scope.comment="";
    }
}])

vdbApp.controller('resolveIssueCommentYesCtrl', ['$scope','$rootScope','$routeParams','statusChangeService','issuesService', function ($scope,$rootScope,$routeParams,statusChangeService,issuesService) {
    $scope.hide="ng-hide";
    $scope.resolve = function(){
        $rootScope.globaloverlay = "active";
        var user = {};
        user.authorisation_hash = $rootScope.hashSession;
        var comment = $scope.resolveComment;
        var issue_id = $rootScope.getStatusId;
        var status = "resolved";

        var jsondata = JSON.stringify({
            "user" : {
                "authorisation_hash" : user.authorisation_hash
            },
            "comment" : comment,
            "issue_id" : issue_id,
            "status" : status});
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data){
            var getStatusChange = data.data;
            if(!getStatusChange.success){
                $rootScope.globaloverlay = "";
                $scope.hide="";
                $scope.error = getStatusChange.error;
            }
            else{
                $rootScope.globaloverlay = "";
                $('#ResolveModal').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.hashSession = null;
                $rootScope.targetAction = null;
                var jsondata = JSON.stringify({"issue_id" : issue_id});
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
            }

        });
    }
     $scope.close =function(){
        $scope.error="";
        $scope.comment="";
    }
}])