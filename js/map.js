// setting up the icons
var glowIcon = L.icon({
  iconUrl: "leaflet/images/marker-icon-glow.png",
  iconShadow: "leaflet/images/marker-icon-shadow.png",
});

var redIcon = L.icon({
  iconUrl: "leaflet/images/marker-icon-red.png",
  iconShadow: "leaflet/images/marker-icon-shadow.png",
});

window.onload = function() {
  var $map = $("#map");

  var map = L.map('map').setView([41.85 , -87.6278], 15);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

  var locationMarker;
  
  
  function getDistance(lat1, long1, lat2, long2) {
    return Math.sqrt(Math.pow((lat1 - lat2), 2) + Math.pow((long1 - long2), 2));
  }
  
  var prevLocation = {
    lat: 0,
    lng: 0
  }
  
  function setLocation(lat, lng) {
    var dist = getDistance(lat, lng, prevLocation.lat, prevLocation.lng);
    if (dist > 0.001) {
      map.setView(new L.LatLng(lat, lng), 15);
      getMarkers(lat, lng);
    
      prevLocation.lat = lat;
      prevLocation.lng = lng;
    }
    if (locationMarker) {
      locationMarker.setLatLng(new L.LatLng(lat, lng));
    } else {
      locationMarker = L.marker([lat, lng], {icon: redIcon}).addTo(map);
    }
  }

  var markers = [];
  
  function getMarkers(lat, lng) {
    $.getJSON('/api/closest_meters/' + lat + '/' + lng, function(data) {
      // removing the old markers
      for(var i = 0; i < 5; ++i) {
        var marker = markers.pop();
        if(marker) {
          map.removeLayer(marker);
        }
      }
      // placing new markers to the map
      for(var i = 0; i < data.length; ++i) {
        (function(i) {          
          var lat = data[i]['Latitude'];
          var lng = data[i]['Longitude'];
          var marker;
          if (i === 0) {
            marker = L.marker([lat, lng], {icon: glowIcon});
          } else {
            marker = L.marker([lat, lng]);
          }
        
          marker.on('click', function() {
            $('#paypay .Address span').text(data[i].Address);
            $('#paypay .DayRateHour span').text(data[i].DayRateHour);
            $('#paypay .DayTimeLimit span').text(data[i].DayTimeLimit);
            $('#paypay .KioskId span').text(data[i].KioskId);
          });
          map.addLayer(marker);
          markers.push(marker);
        })(i);
      }
    });
  };

  $('#test-moving').click(function() {
    var lat = 41.861047;
    var lng = -87.632152;
    var i = 0;

    function mv() {
      setLocation(lat, lng);
      i++;
      lat += 0.00005;
      lng -= 0.000025;
      setTimeout(mv, 100);
    };
    mv();
  });
  
  
  //Paybox counter
  var timer = 0;
  
  function fmt(i) {
    if (i < 10) {
      return "0" + i;
    } else {
      return "" + i;
    }
  }
  
  function tick() {
    timer += 1;
    var rate = +$('#paypay .DayRateHour span').text().match(/[\d\.]+/)[0]
    var moneySpent = timer / 3600 * rate;
    
    var seconds = timer % 60;
    var minutes = ((timer / 60)|0) % 60;
    var hours = ((timer / 3600)|0) % 60;
    $('#paypay .time span').text(fmt(hours) + ':' + fmt(minutes) + ':' + fmt(seconds));
    $('#paypay .money span').text("$" + moneySpent.toFixed(2));
  }
  
  var int;
  
  function startTimer() {
    clearTimeout(int);
    if ($('#paypay .DayRateHour span').text().length > 0) {
      int = setInterval(tick, 1000);
    } else {
      alert("No meter selected!");
    }
  }
  
  $('#start-meter').click(startTimer);
  
};
