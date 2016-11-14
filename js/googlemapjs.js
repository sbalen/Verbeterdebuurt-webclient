var ZOOM_PINS_VISIBLE = 14; //this is also in vdbangular.js, todo: how can we only have it once
var ZOOM_ISSUES_RETRIEVABLE = 12;
var ZOOM_START = 15;
var ZOOM_MAX = 17;
var ZOOM_MIN = 13;
var ZOOM_START_MINI = 17;
var ZOOM_MAX_MINI = 19;
var ZOOM_MIN_MINI = 15;

var LOCATION_DEFAULT_LAT = 52.371828;
var LOCATION_DEFAULT_LNG = 4.902220;
var LOCATION_DEFAULT = {lat: LOCATION_DEFAULT_LAT,lng: LOCATION_DEFAULT_LNG}
var LOCATION_DEFAULT_BOUNDS = {lat: LOCATION_DEFAULT_LAT,lng: LOCATION_DEFAULT_LNG}
var ZOOM_INIT = 8; //netherlands size

var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow();
var infoWindowContent = [];
var latlngChange;
var marker;
var map;
var postalcode = null;
cityName=null;
maxlat  = null;
maxlng  = null;
minlat = null;
minlng = null
markers = null;
markers = [];
markerid = [];


//simple translation func
function __t(str) {
    switch(str) {
        case "problem": return "probleem";
        case "idea": return "idee";
        case "open": return "open";
        case "resolved": return "opgelost";
        case "confirmed": return "bevestigd";
        case "closed": return "gesloten";
        case "accepted": return "aanvaard";
        default: return str;
    }
}

//google map
function googlemapinit () {
    logger("googlemapinit");

    initMap();
    initMapListeners();
    $('#duplicate-bubble').hide();

}

function issueLocationToGoogleLocation(issueLocation) {
    return {lat:issueLocation.latitude,
            lng:issueLocation.longitude };
}

function issueLocationToGoogleBounds(issueLocation) {
    return {north: issueLocation.latitude, 
            south: issueLocation.latitude,
            east: issueLocation.longitude,
            west: issueLocation.longitude };    
}

function initMap() {
    logger("initMap");

    var mapOptions = {
        zoom: ZOOM_INIT,
        maxZoom: ZOOM_MAX,
        minZoom: ZOOM_INIT,
        scrollwheel: true,
        zoomControl: true,
        // initialize zoom level - the max value is 21
        disableDefaultUI: true,
        streetViewControl: false, // hide the yellow Street View pegman
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: LOCATION_DEFAULT,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        styles: [ { featureType: "poi", elementType: "labels", stylers: [{visibility: "off"}] },
                  { featureType: "transit.station", stylers: [ { visibility: "off" } ] } ]
    };

    var mapObject = document.getElementById('googlemaps');

    map = new google.maps.Map(mapObject, mapOptions);

}


function initMapListeners() { 
    logger("initMapListeners");

    //couldn't this be on page change instead of mouseover?
    google.maps.event.addListener(map,'mouseover',determineMapScrollingAllowed);    

  //  addMapChangedListener(handleMapChanged);

}

function addMapChangedListener(listener) {
    logger("addMapChangedListener()");

    // get the data from center of map
    google.maps.event.addListener(map, 'dragend', listener);
    google.maps.event.addListener(map, 'zoom_changed', listener);

//    google.maps.event.addListener(map, 'click', listener);
    //google.maps.event.addListener(map,'bounds_changed', handleMapChanged);
}

function checkZoomLevel($rootScope) {
    logger("checkZoomLevel: " + map.getZoom());
    $rootScope.pinsVisibleZoom = ZOOM_PINS_VISIBLE;
    $rootScope.retrieveIssuesZoom = ZOOM_ISSUES_RETRIEVABLE;
    $rootScope.zoom = map.getZoom();
}
//get address
function getaddressshow(latlng){
    logger('getaddressshow');
    geocoder.geocode({
            'latLng': latlng
    }, function (result, status) {
        logger("geocode result");
        if (status == google.maps.GeocoderStatus.OK) {            
            var addressHolder = window.location.pathname.includes('nieuw-probleem') ? document.getElementById("location") : document.getElementById("location2");
            updateAddressFromGeocodeResult(result,addressHolder);
        }
    });
}

//google map auto complete change string to make it by id

function attachAutoCompleteListener(stringid,resultmap) {
    logger("attachAutoCompleteListener " +stringid);
    var input = document.getElementById(stringid);
    //if input cannot be found yet, it's probably not loaded yet, so return doing nothing
    if (input == undefined) return;

    if (maxlat) {
        var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(maxlat,maxlng),
            new google.maps.LatLng(minlat,minlng)
        );
    }
    var options = {
        componentRestrictions: {
        country: 'nl'
        },
        bounds:defaultBounds,
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds',map);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        logger("google place changed");

        var place = autocomplete.getPlace();
        logger(place);
        var address = "";
        var bounds = undefined;
        
        if (place.formatted_address) {
            address = place.formatted_address;
            bounds =  place.geometry.viewport ? place.geometry.viewport : null;
        } else if (place.name) {
            address = place.name;
        }

        moveMapToAddress(address,bounds);

    });

}

function geocodeGetLocationFound(lat, lng) {
    geocoder.geocode({ 'location': { 'lat': lat, 'lng': lng} }, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            for (var i = 0; i < result[0].address_components.length; i++) {
                for (var b = 0; b < result[0].address_components[i].types.length; b++) {
                    //if you want the change the area ..
                    if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                        // name of city
                        cityFound = result[0].address_components[i];
                        logger(cityFound);
                        break;
                    }
                }
            }

        }
    });
}

function isScrollingAllowedForPathname() {
    var pathname = window.location.pathname;

    if (pathname.includes('nieuw-probleem')) return false;
    if (pathname.includes('nieuw-idee')) return false;
    if (pathname.includes('nieuwe-melding')) return false;
    if (pathname.includes('melding')) return false;

    if (pathname=='/') return true;
    if (pathname.includes('gemeente')) return true;

    return false;
}

function determineMapScrollingAllowed() {
    logger("determineMapScrollingAllowed()");
    map.setOptions({scrollwheel: isScrollingAllowedForPathname()});
}



function initGoogleMapForCreateIssue(location,issueType) {
    logger("initGoogleMapForCreateIssue(" + lat + "," + lng + "," + issueType +")");
    var location = { lat: lat, lng: lng };
    var iconImg = ( issueType === ISSUE_TYPE_PROBLEM ? "/img/icon_2_42_42.png" : "/img/icon_idea_2_42_42.png" ) ;
    
    var map = new google.maps.Map(document.getElementById("googleMapIssue"), {
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        disableDefaultUI: true,
        center: location,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [ { featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] } ]
    });
    
    (new google.maps.Marker({position: location,icon: iconImg})).setMap(map);    

}

function googleMapCreateProblem() {
    logger("googleMapCreateProblem");
    var latlng = map.getCenter();
    var issueType = ISSUE_TYPE_PROBLEM;
    var mapOptions = {
        draggable: true,
        zoomControl: true,
        clickable: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        disableDefaultUI: false,
        center: latlng,
        zoom: ZOOM_START_MINI,
        maxZoom: ZOOM_MAX_MINI,
        minZoom: ZOOM_MIN_MINI,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [ { featureType: "poi", elementType: "labels", stylers: [ {visibility: "off" }]},
                  { featureType: "transit.station", stylers: [ { visibility: "off" } ] }
                ]
    }
    map3 = new google.maps.Map(document.getElementById(issueType == ISSUE_TYPE_PROBLEM ? "googleMapCreateProblem" : googleMapCreateIdea), mapOptions);

    marker = new google.maps.Marker();
    marker.setMap(map3);
    marker.setPosition(map3.getCenter());
    marker.setOptions({ draggable: true, icon: "/img/icon_2_42_42.png" });

    markerLat = marker.getPosition().lat();
    markerLng = marker.getPosition().lng();
    initMainMapToSmallMapListener(map3);
    markerCenter(map3, marker, "location");
    getMarkerLocation(marker);
    markerGetAddress(marker, "location");    
}

function googleMapCreateIdea() {
    logger("googleMapIssue");
    var latlng = map.getCenter();
    var mapOption4 = {
        center: latlng,
        zoom: ZOOM_START_MINI,
        maxZoom: ZOOM_MAX_MINI,
        minZoom: ZOOM_MIN_MINI,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [ { featureType: "poi", elementType: "labels", stylers: [ {visibility: "off" }]},
                  { featureType: "transit.station", stylers: [ { visibility: "off" } ] }
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
    initMainMapToSmallMapListener(map4);
    markerCenter(map4, marker, "location2");
    getMarkerLocation(marker);
    markerGetAddress(marker, "location2");
    var tempurl = window.location.pathname.replace('nieuw-idee','');
}

function initMainMapToSmallMapListener(smallMap) {
    //mainmap = global map
    google.maps.event.addListener(smallMap, 'bounds_changed', function (e) {
        google.maps.event.trigger(smallMap, 'resize')
        map.setCenter(smallMap.getCenter());
        map.setZoom(smallMap.getZoom());
    });

    google.maps.event.addListener(map, 'bounds_changed', function (e) {
        google.maps.event.trigger(map, 'resize')
        smallMap.setCenter(map.getCenter());
        smallMap.setZoom(map.getZoom());
    });

}

//marker at center
function markerCenter(map, marker, location) {
    var addressDelay;
    marker.setPosition(map.getCenter());
    markerLat = marker.getPosition().lat();
    markerLng = marker.getPosition().lng();
    geocoder.geocode({
        'latLng': marker.getPosition()
    }, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            updateAddressFromGeocodeResult(result,location);
        }
    });

    google.maps.event.addListener(map, 'click', function (e) {
        clearTimeout(addressDelay);
        marker.setPosition(e.latLng);
        // logger(e.latLng);
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
        geocoder.geocode({
            'latLng': e.latLng
        }, function (result, status) {
            // logger(status);
            if (status == google.maps.GeocoderStatus.OK) {
               updateAddressFromGeocodeResult(result,location);
            } else {
                //prevent not show address
                if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    addressDelay = setTimeout(function(){
                        // logger("timeout work");
                        geocoder.geocode({ 'latLng': e.latLng }, function (result, status) {            
                            if (status == google.maps.GeocoderStatus.OK) {
                               updateAddressFromGeocodeResult(result,location);
                            }
                        });
                    },2000);
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
            latlngChange = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            maxlat = map.getBounds().getNorthEast().lat();
            maxlng = map.getBounds().getNorthEast().lng();
            minlat = map.getBounds().getSouthWest().lat();
            minlng = map.getBounds().getSouthWest().lng();
            showIssuesOnMap();
            //get address after search
            geocoder.geocode({'latLng': results[0].geometry.location}, function (result, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    updateAddressFromGeocodeResult(result,location);
                }
            });

        }
    });
}

function markerGetAddress(marker, location) {
    logger("markerGetAdress");
    //first time load
    var addressDelay;
    google.maps.event.addListener(marker, 'dragend', function (e) {
        clearTimeout(addressDelay);
        geocoder.geocode({
            'latLng': marker.getPosition()
        }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                updateAddressFromGeocodeResult(result,location);
            } else {
                if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    addressDelay = setTimeout(function() {
                        geocoder.geocode({ 'latLng': e.latLng }, function (result, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                updateAddressFromGeocodeResult(result,location);
                            }
                        });
                    },2000);
                }
            }
        });
      
        
    });
}

function updateCityFromGeocodeResult(result) {
    logger("googlemaps.js.updateCityFromGeocodeResult");
    if (result == undefined) return;

    for (var i=0; i<result[0].address_components.length; i++) {
        for (var b=0;b<result[0].address_components[i].types.length;b++) {
            //if you want the change the area ..
            if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                // name of city
                city = result[0].address_components[i];
                break;
            }
        }
    }
}

function updateAddressFromGeocodeResult(result,addressHolder) {
    logger("googlemaps.js.updateAddressFromGeocodeResult("+result+","+addressHolder+")");
    if (result == undefined) return;
    var addressHolder = (typeof addressHolder === 'string' || addressHolder instanceof String) ? document.getElementById(addressHolder) : addressHolder;
    for (var i = 0; i < result[0].address_components.length; i++) {
        for (var b = 0; b < result[0].address_components[i].types.length; b++) {
            //if you want the change the area ..
            if (result[0].address_components[i].types[b] == "route") {
                // street name
                var street = result[0].address_components[i].short_name;
                var the_street_number = "";
                for(var c = 0; c < result[0].address_components.length; c++){
                    for (var d = 0; d < result[0].address_components[c].types.length; d++) {
                        if (result[0].address_components[c].types[d] == "street_number") {
                            the_street_number = result[0].address_components[c].short_name;
                        }
                        break;
                    }  
                }
                addressHolder.value = street + " " + the_street_number;
                break;
            }
        }
    }

}

function determineCityForGeocode(callBack,boundsToFitTo) {
    logger("determineCityForGeocode() --> fit: " + boundsToFitTo);
    geocoder.geocode({'latLng': map.getCenter()} , function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            updateCityFromGeocodeResult(results);

            if (boundsToFitTo) {
                map.fitBounds(boundsToFitTo);
            }
            if (callBack != undefined && typeof callBack === 'function') {
                callBack(true);
            }
        }
    });
}

function moveMapToBrowserLocation(withFallBack,callBack) {
    logger("moveMapToBrowserLocation()");
    navigator.geolocation.getCurrentPosition(
        //when user accept the location
        function (position) {
            logger("user accepted location awareness");
            moveMapToLocation({lat: position.coords.latitude,lng:  position.coords.longitude},callBack);
        },
        //when user did not share location
        function (error) {
            logger("user did not accept location awareness");
            if (error.PERMISSION_DENIED) {               
                if (withFallBack) {
                    moveMapToUserLocation(true,callBack);
                }
            }
        }
    )
}

function moveMapToLocation(location,callBack,boundsToFitTo) {
    logger("moveMapToLocation("+location.lat+","+location.lng+")");
    map.panTo(location);
    //map.setCenter(location);
    determineCityForGeocode(callBack,boundsToFitTo);
}

function moveMapToDefaultLocation(callBack) {
    logger("moveMapToDefaultLocation");
    moveMapToAddress("Amsterdam",false,callBack);
    
}

function moveMapToUserLocation(withFallBack,callBack) {
    if (user && userProfile) {
        moveMapToAddress(userProfile.postcode,withFallBack,callBack);
    } else if (withFallBack) {
        moveMapToDefaultLocation(callBack);
    }
}

function moveMapToAddress(address, withFallBack,callBack) {    
    logger("moveMapToAddress(" + address + "," + withFallBack +")");
    geocoder.geocode({'address': address,componentRestrictions: {country: 'nl'}}, function(results, status) {
        logger("geocodeAddress " + address);
        if (status === google.maps.GeocoderStatus.OK) {
            moveMapToLocation(results[0].geometry.location,callBack,results[0].geometry.bounds);            
        } else if (withFallBack) {
            moveMapToBrowserLocation(true,callBack); 
        }
    });
}

function moveMapToIssue(issue,callBack) {
    logger("moveMapToIssue() -->" );
    logger(issue);
    moveMapToLocation(issueLocationToGoogleLocation(issue.location),null,issueLocationToGoogleBounds(issue.location));
    map.setZoom(ZOOM_MAX);
}
function showIssuesOnMap() {
    repaintMarkers();
}

function repaintMarkers () {
    logger("repaintMarkers");
    var zoom = map.getZoom();

    if(zoom < ZOOM_PINS_VISIBLE) {
        for(var i = markerid.length-1 ; i >= 0  ; i--) {
            markers[markerid[i]].setMap(null);
            markers[markerid[i]]=null;
            markerid.pop();
        }
        return;
    }
    //check if not at the range area of map
    for(var y=0 ; y < markerid.length ; y++) {
        if(issuesData.count==0) {
            markers[markerid[y]].setMap(null);
            markers[markerid[y]]=null;
            markerid.splice(y,1);
        }
        for(var i= 0 ; i < issuesData.count ; i++){
            if(markerid[y]==issuesData.issues[i].id){
                break;
            } else if(i==issuesData.count-1){
                markers[markerid[y]].setMap(null);
                markers[markerid[y]]=null;
                markerid.splice(y,1);
                break;
            }
        }
    }

    for(var i = 0 ; i < issuesData.count ; i++) {

        var marker = markerForIssue(issuesData.issues[i]);

        infoWindowContent[i] = marker.contentString;

        if(markers[marker.id] == null) {
            markerid.push(marker.id);
            markers[marker.id] = marker;
            google.maps.event.addListener(marker , 'click' , (function (marker,i) {
                return function() {
                    //window.history.pushState('map','map','/');
                    infoWindow.setContent(marker.contentString);
                    infoWindow.open(map,marker);
                    moveMapToIssue(marker.issue);                 
                }
            })(marker,i));
        } else {
            marker.setMap(null);
            marker=null;
        }

    }
}

function markerForIssue(issue) {
    var latLng = {lat:issue.location.latitude , lng : issue.location.longitude}
    var icon = "";
    //validate for the icon
    if(issue.status == "resolved" || issue.status == "closed") {
        icon = "/img/flag-32.png";
    } else if (issue.type == "problem") {
        icon = "/img/pin-32.png";
    } else if (issue.type == "idea") {
        icon = "/img/bulb-32.png"; 
    }

    var markerOption = {
        position : latLng,
        map : map,
        icon: icon,
        title: issue.title
    };

    var contentString = "<a href='/melding/"+issue.id+"'><span style=color:green;>"+issue.title+"</span></a><br>"+ __t(issue.type) +", "+ __t(issue.status) +"<br>"+issue.location.src_address+"";
    var marker = new google.maps.Marker(markerOption);
    marker.contentString = contentString;
    marker.issue = issue;
    marker.set('id',issue.id);
    return marker;
}

function deleteMarkers(){
    for(var x=0 ; x< markers.length ; x++) {
        if(markers[x]!=null){
            markers[x].setMap(null);
        }
    }
    markers=null;
}