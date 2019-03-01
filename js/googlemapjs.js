var ZOOM_PINS_VISIBLE = 14; 
var ZOOM_ISSUES_RETRIEVABLE = 12;
var ZOOM_START = 15;
var ZOOM_MAX = 17;
var ZOOM_MIN = 13;
var ZOOM_START_MINI = 16;
var ZOOM_MAX_MINI = 19;
var ZOOM_MIN_MINI = 12;

var LOCATION_DEFAULT_LAT = 52.371828;
var LOCATION_DEFAULT_LNG = 4.902220;
var LOCATION_DEFAULT = {lat: LOCATION_DEFAULT_LAT,lng: LOCATION_DEFAULT_LNG}
var LOCATION_DEFAULT_BOUNDS = {lat: LOCATION_DEFAULT_LAT,lng: LOCATION_DEFAULT_LNG}
var LOCATION_RESOLVE_BY = 7 * 1000;
var ZOOM_INIT = 8; //netherlands size

var geocoder = new google.maps.Geocoder();
var infoWindow = new google.maps.InfoWindow();
var infoWindowContent = [];
var latlngChange;
var marker;
var map;
var postalcode = null;
var autocompleteListener;
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

function addMapChangedListener(listener,$location) {
    logger("addMapChangedListener()");

    google.maps.event.addListener(map, 'dragend', listener);
    google.maps.event.addListener(map, 'zoom_changed', function() {

        if ($location && ($location.path().includes('nieuw-probleem') || $location.path().includes('nieuw-idee') ) )  return;
        listener();
    });
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
// Pass the originating scope for additional functions.
function attachAutoCompleteListener(stringid,marker,locationmap,location,originalScope) {
    logger("attachAutoCompleteListener " +stringid);
    var input = document.getElementById(stringid);
    var has_categories = location === "location";
    //if input cannot be found yet, it's probably not loaded yet, so return doing nothing
    if (input == undefined) return;

    var options = { componentRestrictions: { country: 'nl' } };

    var autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds',map);
    if (autocompleteListener != undefined) { autocompleteListener.remove(); }
    autocompleteListener = google.maps.event.addListener(autocomplete, 'place_changed', function() {
        logger("google place changed");

        if ( has_categories && originalScope ) {
          originalScope.loadCategory = 1;
        }

        var place = autocomplete.getPlace();
        var address = "";
        var bounds = undefined;
        
        logger(place);

        if (place.formatted_address) {
            address = place.formatted_address;
            bounds =  place.geometry.viewport ? place.geometry.viewport : null;
        } else if (place.name) {
            address = place.name;
        }

        if (marker) {
            moveMapToAddress(address,false,function() {
               markerCenter(locationmap,marker,location);
               // The create Problem page has a marker, and categories.
               // Update the categories after moving from the
               // mini-map autocomplete.
               if ( has_categories && originalScope ) {
                 originalScope.categoriesData()
               }
            })
        } else {
            moveMapToAddress(address);
        }
    });

    return autocomplete;

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

    return marker;
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
    // Update: return the marker (as with createProblem). This marker
    // is ultimately passed to the autocomplete google search listener,
    // that will update the marker position on the small map.
    return marker;
}

function initMainMapToSmallMapListener(smallMap) {
    //mainmap = global map
    google.maps.event.addListener(smallMap, 'bounds_changed', function (e) {
        //google.maps.event.trigger(smallMap, 'resize')
        map.setCenter(smallMap.getCenter());
        map.setZoom(smallMap.getZoom());
    });

/* A change in the google maps included code causes continuous
     * updates between the large and small map, effectively blocking
     * any panning. As a possible solution, don't update the small map
     * based on the large map.
    google.maps.event.addListener(map, 'bounds_changed', function (e) {
        //google.maps.event.trigger(map, 'resize')
        smallMap.setCenter(map.getCenter());
        smallMap.setZoom(map.getZoom());
    });
    */

}

var setMarkerToMapCenterListener;
//marker at center
function markerCenter(map, marker, location) {
    logger("markerCenter()")
    var addressDelay;
    marker.setPosition(map.getCenter());
    markerLat = marker.getPosition().lat();
    markerLng = marker.getPosition().lng();
    
    updateAddressToPending(location);
    geocoder.geocode({
        'latLng': marker.getPosition()
    }, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            updateAddressFromGeocodeResult(result,location);
        }
    });

    if (setMarkerToMapCenterListener) setMarkerToMapCenterListener.remove();
    setMarkerToMapCenterListener = google.maps.event.addListener(map, 'click', function (e) {
        updateAddressToPending(location)
        clearTimeout(addressDelay);
        marker.setPosition(e.latLng);
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
                    },1000);
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
// get location search at create issue // i dont think this is used anymore
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
        
        updateAddressToPending(location);

        clearTimeout(addressDelay);
        geocoder.geocode({
            'latLng': marker.getPosition()
        }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                updateAddressFromGeocodeResult(result,location);
            } else {
                if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    updateAddressToPending(location);
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

var addressHolderPendingInterval;
function updateAddressToPending(addressHolder,alternativeMessage) {
    var addressHolder = (typeof addressHolder === 'string' || addressHolder instanceof String) ? document.getElementById(addressHolder) : addressHolder;
    addressHolder.value = alternativeMessage ? alternativeMessage : ".";
    clearInterval(addressHolderPendingInterval);
    addressHolderPendingInterval = setInterval(function( ) {
        if (addressHolder.value.length  > 3) {
            addressHolder.value = "";
        } else {
            addressHolder.value += ".";
        }
    },100);
}

function updateAddressFromGeocodeResult(result,addressHolder) {
    logger("googlemaps.js.updateAddressFromGeocodeResult() --> ");
    logger(result);
    clearInterval(addressHolderPendingInterval);
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

function moveMapToBrowserLocation($rootScope,$q,withFallBack,callBack) {
    logger("moveMapToBrowserLocation()");


    /*
        If the use takes too long to decide to allow browser location, or if the user has firefox and clicks 'not now' when asked
        we do not get a position or error. 
        Also in the case that it just takes too long to get a location fixed (for whatever reason), we don't want to wait
        indefinitely. 
        To catch all of these cases, we handle the geolocation positioning with a promise.
        And if that promise takes too long to recover, we continue.
    */

    var resolveBy = LOCATION_RESOLVE_BY;
    var deferredResponse = $q.defer();

    deferredResponse.promise.then(
        function(position) {
            logger("user accepted location awareness");
            moveMapToLocation({lat: position.coords.latitude,lng:  position.coords.longitude},callBack);
        }, 
        function (error) {
           logger("user did not accept location awareness");
            if (withFallBack) {
                moveMapToUserLocation(true,callBack);
            }
        }
    );

    //actually check
    navigator.geolocation.getCurrentPosition(function (position) {
        deferredResponse.resolve(position);
    }, function (error) {
        deferredResponse.reject(error);
    }, {        
        timeout: resolveBy        
    });

    //if user is just waiting to long, reject all together
    setTimeout(function() {
       logger("user did not accept?");
        deferredResponse.reject('timed out waiting too long for user');
    }, resolveBy+100);

}

function moveMapToLocation(location,callBack,boundsToFitTo) {
    //logger("moveMapToLocation("+location.lat()+","+location.lng()+")");
logger("moveMapToLocation("+location.lat+","+location.lng+")");
    // Update: the map move on geolocations moves the large map.
    // The small maps can't directly listen to the large map anymore,
    // so we have to set them manually. Check for the small maps below:
    // - map is the main map
    // - map3 is the CreateProblem map
    // - map4 is the CreateIdea map
    if ( typeof map3 !== 'undefined' ) {
      logger('moveMapToLocation: map3 (problem)');
      map3.panTo(location);
    }
    if ( typeof map4 !== 'undefined' ) {
      logger('moveMapToLocation: map4 (idea)');
      map4.panTo(location);
    }
    if ( typeof map3 === 'undefined' && typeof map4 === 'undefined' ) {
      logger('moveMapToLocation: map (main)');
      map.panTo(location);
    }
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
