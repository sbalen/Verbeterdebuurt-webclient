// ga dipake blom di apus

window.onload = function () {
            var mapOptions = {
                center: new google.maps.LatLng(52.3667, 4.9000),//amsterdam longtitude 
                zoom: 15,//zoom pembukaan
                minZoom:13,// waktu di zoom
                maxZoom:17//maximum zoom
                
            };
           
           
             map = new google.maps.Map(document.getElementById("peta"), mapOptions);

            google.maps.event.addListener(map, 'click', function (e) {
                var pengaturan = {
                	 center: new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()),//w.latLng= buat dpting koordinat di klik
                	 zoom: 20,
                     minZoom: 18,
                     maxZoom: 22

               }
               	var map2 =  new google.maps.Map(document.getElementById('peta2'),pengaturan);
                

            });
            // get the data from center of map
               google.maps.event.addListener(map, 'dragend', function (e) {
                // console.log(map.getCenter().lat());
                // console.log(map.getCenter().lng());
                // document.getElementById('lat').value = map.getCenter().lat();
                // document.getElementById('lng').value = map.getCenter().lng();
               //get The City NAme 
               geocoder = new google.maps.Geocoder();
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
                     document.getElementById('lat').value = city.short_name;
                     document.getElementById('lng').value = city.long_name;
                     console.log(city.short_name);
                     console.log(city.long_name);
                     var url = document.location.href+'city/'+city.long_name; 
                     window.location = url;
                }
                

               });

            });


            // Dragable icon
           //  var marker = new google.maps.Marker({
           //    draggable: true,
           //    position:  new google.maps.LatLng(52.3667, 4.9000),
           //    map : map,
           //    });
           //  marker.bindTo('position', map, 'center');
           // google.maps.event.addListener(map,'drag',function (e){
           //      document.getElementById('lat').value = this.getPosition().lat();
           //      document.getElementById('lng').value = this.getPosition().lng();

               
           // });
          

        }