function getLocation(map) { 
                 var infoWindow = new google.maps.InfoWindow();
                 var infoWindowContent = []; 
            // get the data from center of map
               google.maps.event.addListener(map, 'dragend', function (e) {
               google.maps.event.trigger(map,'resize')
                maxlat  = map.getBounds().getNorthEast().lat();
                maxlng  = map.getBounds().getNorthEast().lng();
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
                     // console.log("drag googlemap:"+city.long_name);
                      // showIssue(infoWindow,infoWindowContent);
                }
                

               });


            });
                google.maps.event.addListener(map, 'zoom_changed', function (e) {
               google.maps.event.trigger(map,'resize')
               maxlat  = map.getBounds().getNorthEast().lat();
                maxlng  = map.getBounds().getNorthEast().lng();
                minlat = map.getBounds().getSouthWest().lat();
                minlng = map.getBounds().getSouthWest().lng();
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
                      // showIssue(infoWindow,infoWindowContent);
                }
                

               });


            });
               google.maps.event.addListener(map, 'click', function (e) {
                google.maps.event.trigger(map,'resize')
                maxlat  = map.getBounds().getNorthEast().lat();
                maxlng  = map.getBounds().getNorthEast().lng();
                minlat = map.getBounds().getSouthWest().lat();
                minlng = map.getBounds().getSouthWest().lng();
                console.log(maxlat,minlat,maxlng,minlng)
               geocoder.geocode({'latLng':e.latLng} , function (result , status){
                if (status == google.maps.GeocoderStatus.OK){

                for (var i=0; i<result[0].address_components.length; i++) {
                for (var b=0;b<result[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (result[0].address_components[i].types[b] == "administrative_area_level_2") {
                   // name of city
                    city= result[0].address_components[i];
                    console.log(city);
                    //console.log(searchCity);
                    break;
                        }
                    }
                }
                     // console.log("click googlemap:"+city.long_name);
                     // showIssue(infoWindow,infoWindowContent);
                    }
                

               });


            });
                          
   
        }
function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('searchCity').value;
        console.log(address);
        if(cityName!=null){
          var address = cityName;
          console.log(address);
        }
        else if(postalcode!=null){
          var address = postalcode;
        }
        geocoder.geocode({'address': address,componentRestrictions: {country: 'nl'}}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
                resultsMap.setCenter(results[0].geometry.location);
                maxlat  = map.getBounds().getNorthEast().lat();
                maxlng  = map.getBounds().getNorthEast().lng();
                minlat = map.getBounds().getSouthWest().lat();
                minlng = map.getBounds().getSouthWest().lng();
                console.log(map.getCenter().lat()+" "+map.getCenter().lng());
                for (var i=0; i<results[0].address_components.length; i++) {
                for (var b=0;b<results[0].address_components[i].types.length;b++) {
                  //if you want the change the area ..
                if (results[0].address_components[i].types[b] == "administrative_area_level_2") {
                   // name of city
                    citynamegoogle= results[0].address_components[i];
                    console.log(citynamegoogle);
                    break;
                        }
                    }
                }

                    
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }

function showIssue(infoWindow,infoWindowContent){
    var markers = null;
    var markers = [];
    var zoom = map.getZoom();
    
      if(zoom >= 14){
        callMarker(markers,zoom,map);
      }
    google.maps.event.addListener(map, 'zoom_changed', function() {
      var zoom = map.getZoom();
      callMarker(markers,zoom,map);
      for(var x=0 ; x< markers.length ; x++){
                          markers[x].setMap(null);
                          console.log(x);
                          }
      markers=[];
    });
   


                    

}
//backup
// google.maps.event.addListener(map, 'zoom_changed', function() {
//                     var zoomChanged = map.getZoom();
//                     // iterate over markers and call setVisible
//                     for (var i = 0; i < issuesData.count ; i++) {
//                         markers[i].setVisible(zoomChanged > 13);
//                         console.log(markers.length+" "+markers[i]);
//                     }
//                     //validation marker at certain zoom
//                      if(zoom <=13 ){
//                         infoWindow.close(map,marker);
//                     }
//                     });
function callMarker (markers,zoom,map){
   for(var i= 0 ; i < issuesData.count ; i++){
                     var latLng = {lat:issuesData.issues[i].location.latitude , lng : issuesData.issues[i].location.longitude}
                     var icon = "";
                     //validate for the icon
                    if(issuesData.issues[i].status == "resolved" || issuesData.issues[i].status == "closed"){
                      icon = "/img/flag-32.png"
                     }
                     else if(issuesData.issues[i].type == "problem"){
                      icon = "/img/pin-32.png";
                    }else if(issuesData.issues[i].type == "idea"){
                      icon = "/img/bulb-32.png"; 
                    }
                     var markerOption = {
                      position : latLng,
                      map : map,
                      icon: icon,
                      title: issuesData.issues[i].title,
                    };
                    //change to dutch laguage
                    var tempType = [];
                    var tempStatus = [];
                    //type
                    if(issuesData.issues[i].type=="problem"){
                      tempType[i] = "probleem"
                    }
                    else if(issuesData.issues[i].type == "idea"){
                      tempType[i] = "idee"
                    }
                    //status
                    if(issuesData.issues[i].status == "open"){
                      tempStatus[i] = "open"
                    }
                    else if(issuesData.issues[i].status == "resolved"){
                      tempStatus[i] = "opgelost"
                    }
                    else if(issuesData.issues[i].status == "confirmed"){
                      tempStatus[i] = "bevestigd"
                    }
                    else if(issuesData.issues[i].status == "closed"){
                      tempStatus[i] = "gesloten";
                    }
                    else if(issuesData.issues[i].status == "accepted"){
                      tempStatus[i] = "aanvaard"
                    }
       infoWindowContent[i]= "<a href=/meldingen/"+issuesData.issues[i].id+"><span style=color:green;>"+issuesData.issues[i].title+"</span></a><br>"+tempType[i]+", "+tempStatus[i]+"<br>"+issuesData.issues[i].location.src_address+"";
                    
                    //console.log(infoWindowContent[i]);
                    
                      marker = new google.maps.Marker(markerOption);
                      markers.push(marker);
                      google.maps.event.addListener(marker , 'click' , (function (marker,i){
                      return function(){
                      infoWindow.setContent(infoWindowContent[i]);
                      infoWindow.open(map,marker);
                      map.setCenter(marker.getPosition());
                      }
                      })(marker,i));
                    
                      
                    }

                    if(zoom < 14){
                        for(var x=0 ; x< markers.length ; x++){
                          markers[x].setMap(null);
                        }
                          markers=null;
                      }

}