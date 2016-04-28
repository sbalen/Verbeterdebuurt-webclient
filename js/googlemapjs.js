function getLocation(map) { 
                 var infoWindow = new google.maps.InfoWindow();
                 var infoWindowContent = []; 
            // get the data from center of map
               google.maps.event.addListener(map, 'dragend', function (e) {
               google.maps.event.trigger(map,'resize')
               geocoder.geocode({'latLng': map.getCenter()} , function (result , status){
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
                     // console.log("drag googlemap:"+city.long_name);
                      showIssue(infoWindow,infoWindowContent);
                }
                

               });


            });
               google.maps.event.addListener(map, 'click', function (e) {
                google.maps.event.trigger(map,'resize')
               geocoder.geocode({'latLng':e.latLng} , function (result , status){
                if (status == google.maps.GeocoderStatus.OK){

                for (var i=0; i<result[0].address_components.length; i++) {
                for (var b=0;b<result[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                   // name of city
                    city= result[0].address_components[i];
                    // console.log(city);
                    //console.log(searchCity);
                    break;
                        }
                    }
                }
                     // console.log("click googlemap:"+city.long_name);
                     showIssue(infoWindow,infoWindowContent);
                    }
                

               });


            });

            
    
        }
function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('searchCity').value;
        if(cityName!=null){
          var address = cityName;
        }
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }

function showIssue(infoWindow,infoWindowContent){
    var markers = [];
  for(var i= 0 ; i < issuesData.count ; i++){
                     var latLng = {lat:issuesData.issues[i].location.latitude , lng : issuesData.issues[i].location.longitude}
                     var icon = "/img/icon_2_42_42.png";
                     var markerOption = {
                      position : latLng,
                      map : map,
                      icon: icon,
                      title: issuesData.issues[i].title,
                      visible : true
                    };
                    infoWindowContent[i]= "<span style=color:green;>"+issuesData.issues[i].title+"</span><br>"+issuesData.issues[i].type+", "+issuesData.issues[i].status+"<br>"+issuesData.issues[i].location.src_address+"";
                    
                    //console.log(infoWindowContent[i]);
                    
                    var marker = new google.maps.Marker(markerOption);

                    google.maps.event.addListener(marker , 'click' , (function (marker,i){
                      return function(){
                      infoWindow.setContent(infoWindowContent[i]);
                      infoWindow.open(map,marker);
                      map.setCenter(marker.getPosition());
                      }
                    })(marker,i));
                    markers.push(marker);
                    }

                    google.maps.event.addListener(map, 'zoom_changed', function() {
                    var zoom = map.getZoom();
                    // iterate over markers and call setVisible
                    for (var i = 0; i < issuesData.count ; i++) {
                        markers[i].setVisible(zoom > 13);
                    }
    });

}