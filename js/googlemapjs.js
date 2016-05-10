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
                      showIssue(infoWindow,infoWindowContent);
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
                maxlat  = map.getBounds().getNorthEast().lat();
                maxlng  = map.getBounds().getNorthEast().lng();
                minlat = map.getBounds().getSouthWest().lat();
                minlng = map.getBounds().getSouthWest().lng();
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }

function showIssue(infoWindow,infoWindowContent){
    var markers = [];
    var zoom = map.getZoom();
  for(var i= 0 ; i < issuesData.count ; i++){
                     var latLng = {lat:issuesData.issues[i].location.latitude , lng : issuesData.issues[i].location.longitude}
                     var icon = "";

                     //validate for the icon
                    if(issuesData.issues[i].status == "resolved" || issuesData.issues[i].status == "closed"){
                      icon = "/img/flag_2_42_42.png"
                     }
                     else if(issuesData.issues[i].type == "problem"){
                      icon = "/img/icon_2_42_42.png";
                    }else if(issuesData.issues[i].type == "idea"){
                      icon = "/img/icon_idea_2_42_42.png"; 
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
                    infoWindowContent[i]= "<a href=/issues/"+issuesData.issues[i].id+"><span style=color:green;>"+issuesData.issues[i].title+"</span></a><br>"+tempType[i]+", "+tempStatus[i]+"<br>"+issuesData.issues[i].location.src_address+"";
                    
                    //console.log(infoWindowContent[i]);
                    
                    var marker = new google.maps.Marker(markerOption);
                    marker.setVisible(zoom > 13);

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
                    //validation marker at certain zoom
                     if(zoom <=13 ){
                        infoWindow.close(map,marker);
                    }
    });

}