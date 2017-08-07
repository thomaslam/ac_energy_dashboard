function getLayer(type) {
  return L.gridLayer.googleMutant({
    'type': type, // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    attribution: '&copy; 2017 AC Office of Environmental Sustainability'
  })
}

function getCustomIcon(iconUrl) {
  return L.icon({
    iconUrl: iconUrl,
    iconAnchor: [7, 7],
    iconSize: [15, 15]
  });
}

function initChart(canvasID, data) {
  return new Chart(canvasID, {
          type: 'line',
          data: {
            labels: data['time_data'],
            datasets: [{
              data: data['energy_data'],
              fill: false,
              backgroundColor: '#614488',
              borderColor: '#614488',
              borderWidth: 3,
              pointStyle: 'circle',
              tension: 0.25
            }]
          },
          options: {
            responsive: true,
            legend: {
              display: false
            },
            tooltips: {
              mode: 'index',
              intersect: false,
            },
            hover: {
              mode: 'nearest',
              intersect: true
            },
            scales: {
              xAxes: [{
                gridLines: {
                  display: false
                },
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Time'
                },
                ticks: {
                  callback: function(value, index, values) {
                    return '';
                  }
                }
              }],
              yAxes: [{
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'kWh'
                }
              }]
            }
          }
        });
}

var roads = getLayer('roadmap'),
    satellite = getLayer('satellite'),
    terrain = getLayer('terrain'),
    hybrid = getLayer('hybrid');

var mymap = L.map('mapid', {
  layers: [satellite, terrain, hybrid, roads]
}).setView([42.3709104, -72.5170028], 16);

L.control.layers({
  "Roads": roads,
  "Satellite": satellite,
  "Terrain": terrain,
  "Hybrid": hybrid
}).addTo(mymap);

main = {
    init: function(housingData, staticFolder) {
      function getColor(d) {
        return d > 300 ? '#7a0177' :
               d > 200 ? '#ae017e' :
               d > 100 ? '#dd3497' :
               d > 80 ? '#f768a1' :
               d > 50 ? '#fa9fb5' :
               d > 20  ? '#fcc5c0' :
                          '#feebe2';
      }

      function switchCoordinates(c) {
        var temp = c[0];
        c[0] = c[1];
        c[1] = temp;
        return c;
      }

      function onEachFeature(feature, layer) {
        L.circle(switchCoordinates(feature.geometry.coordinates), {
          radius: feature.properties.electricity, // change this to sth more dynamic
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties.electricity),
          weight: 0
        }).addTo(mymap);
      }

      function pointToLayer(feature, latlng) {
        var marker = L.marker(latlng, {
          icon: getCustomIcon(staticFolder + "img/marker.svg")
        });

        marker.bindPopup("<b id='bldName'>" + feature.properties.name + "</b><br>Previous day total: " 
          + feature.properties.electricity + " kWh<br><a id='viewEnergyLink' href='#'>View energy usage by hour</a>").
              on('click', function(e) {
                mymap.setView(e.target.getLatLng(), 16);
              });

        return marker;
      }

      L.geoJson(housingData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(mymap);

      mymap.on('popupopen', function(e) {
        var marker = e.popup._contentNode;

        var aLink = marker.querySelector("#viewEnergyLink");
        var bldName = marker.querySelector("#bldName").textContent;
        console.log("Clicked on bldName: " + bldName);

        aLink.onclick = function(e) {
          e.preventDefault();

          console.log('Inside viewEnergyLink onclick');

          // Show overlay element 
          $.ajax({url: '/energy_data?bld=' + bldName, success: function(data, status) {
            var overlay = $('#overlay');
            overlay.show();

            $('#overlay-text').text(bldName+ " energy usage for past 24 hours");

            console.log(data['energy_data']);

            var myChart = initChart($('#myChart'), data);

            // Make background darker
            $('#mapid').css('opacity', 0.5);
            $('.main-panel').css('background-color', 'black');

            $('.close').click(function() {
              overlay.hide();

              // Make background normal
              $('#mapid').css('opacity', 1);
              $('.main-panel').css('background-color', '');

              // Prevent hovering problem
              $('#myChart').remove();
              $('#overlay').append('<canvas id="myChart"></canvas>');
            });
          }});
        };
      });

      ////////////////// Legend ////////////////////////
      var legend = L.control({position: 'bottomright'});

      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
          // grades = [0, 500, 1000, 2000, 3000, 4000, 5000],
          grades = [0, 20, 50, 80, 100, 200, 300],
          labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        div.innerHTML = 'Total kWH previous day<br>'
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' kWH<br>' : '+ kWH');
        }
        return div;
      };

      legend.addTo(mymap);
      ////////////////////////////////////////////////
    },

    feedback: function(housingData, staticFolder) {
      function pointToLayer(feature, latlng) {
        var marker = L.marker(latlng, {
          icon: getCustomIcon(staticFolder + "img/marker.svg")
        });

        marker.bindPopup("<b id='bldName'>" + feature.properties.name + "</b><br>" +
          "cold<br>chilly<br>normal<br>warm<br>hot<br>" +
          "<a id='viewFeedbackLink' href='#'>View feedbacks</a><br>" +
          "<a id='leaveFeedbackLink' href='#'>Leave feedback</a>").
              on('click', function(e) {
                mymap.setView(e.target.getLatLng(), 16);
              });

        return marker;
      }

      L.geoJson(housingData, {
        pointToLayer: pointToLayer
      }).addTo(mymap);

      mymap.on('popupopen', function(e) {
        var marker = e.popup._contentNode;

        var viewFeedbackLink = marker.querySelector("#viewFeedbackLink");
        var leaveFeedbackLink = marker.querySelector("#leaveFeedbackLink");
        var bldName = marker.querySelector("#bldName").textContent;
        console.log("Clicked on bldName: " + bldName);

        viewFeedbackLink.onclick = function(e) {
          e.preventDefault();
          console.log("Inside viewFeedbackLink onclick");

          $.ajax({url: '/view_feedbacks?bld=' + bldName, success: function(data, status) {
            var overlay = $('#feedbackview-overlay');
            overlay.show();

            $('#feedbackview-overlay-text').text("Feedback for " + bldName);

            // Make background darker
            $('#mapid').css('opacity', 0.5);
            $('.main-panel').css('background-color', 'black');

            $('.close').click(function() {
              overlay.hide();

              // Make background normal
              $('#mapid').css('opacity', 1);
              $('.main-panel').css('background-color', '');
            });
          }});
        }

        leaveFeedbackLink.onclick = function(e) {
          e.preventDefault();
          console.log("Inside leaveFeedbackLink onclick");
        }
      });

      // var legend = L.control({position: 'bottomright'});

      // legend.onAdd = function(map) {

      // }
    }
}

