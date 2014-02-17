
var marker, map;
var locationMarkers = [];

var DEFAULT = 0
var ADD_LOCATION = 1;
var mode = DEFAULT;

var locations;

function initialize() {

  navigator.geolocation.getCurrentPosition(function(position) {
      var mapOptions = {
        center: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
        zoom: 8
      };
      map = new google.maps.Map(document.getElementById("map-canvas"),
          mapOptions);
      $.get("/api/getAllLocations", function(locs){
        locations = locs;
        $.each(locations, function(i,item){
          var data = item._node._data.data;
          placeMarker(new google.maps.LatLng(data.latitude, data.longitude));
          markLocation(new google.maps.LatLng(data.latitude, data.longitude), data.name);
          //$('#locationsList').append('<div class="locationBox"><div>'+data.name +"(" + data.latitude + "," + data.longitude+ ")</div><div>" + data.type + '</div>')
          $('#locationsTable > tbody:last').append('<tr><td>'+data.name+'</td><td>' + data.type+'</td><td>'
            + data.latitude + '</td><td>' + data.longitude + '</td></tr>');
        });
      })
      google.maps.event.addListener(map, 'click', function(event) {
        if(mode === ADD_LOCATION){
          $("#newLocationLongitude").val(event.latLng.lng());
          $("#newLocationLatitude").val(event.latLng.lat());
          placeMarker(event.latLng);          
        }
      });
    });
}

$("#newLocationForm").submit(function(e){
  e.preventDefault();
  var location = {
    latitude: $("#newLocationLatitude").val(),
    longitude: $("#newLocationLongitude").val(),
    name: $("#newLocationName").val(),
    type: $("#newLocationType").val()
  }
  $.post("/api/newLocation", location, function(loc){


    $("#newLocationForm").trigger('reset');
    $("#addLocation").css("display", "none");
    map.setOptions({draggableCursor: null})
    mode = DEFAULT;


    locations.push(loc);
    var data = loc._node._data.data;
    $('#locationsTable > tbody:last').append('<tr><td>'+data.name+'</td><td>' + data.type+'</td><td>'
      + data.latitude + '</td><td>' + data.longitude + '</td></tr>');
  })
})
$('input,select').keypress(function(event) { 
  //$(this).next('input').focus();  
  return event.keyCode != 13; 
});


$("#newLocationLatitude, #longitude").change(function(){
  placeMarker(new google.maps.LatLng($("#newLocationLatitude").val(), $("#newLocationLongitude").val()));
}
)
$("#addLocationButton").click(function(){
  mode = ADD_LOCATION;
  $("#addLocation").css("display", "block");
  map.setOptions({draggableCursor:'crosshair'});
})

function markLocation(location, name){
  console.log('marking location' + location + name)
  locationMarkers.push(new google.maps.Marker({
    position: location,
    map: map,
    title: name
  }))
}
function placeMarker(location) {
  if ( marker ) {
    marker.setPosition(location);
    console.log(marker)
  } else {
    console.log('placing new marker');
    marker = new google.maps.Marker({
      position: location,
      map: map,
      title: "New Marker"
    });
  }
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA22IytrDmxffOQIwF0Th1jnP9VL5W7CfY&v=3.exp&sensor=false&' +
      'callback=initialize';
  document.body.appendChild(script);
}



window.onload = loadScript;

//google.maps.event.addDomListener(window, 'load', initialize);
