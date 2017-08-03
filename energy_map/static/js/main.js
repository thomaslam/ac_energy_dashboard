type = ['','info','success','warning','danger'];
myUrl = "http://148.85.253.152:15675"    	

main = {
    init: function(housingData) {
      var roads = L.gridLayer.googleMutant({
        type: 'roadmap', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        attribution: '&copy; 2017 AC Office of Environmental Sustainability'
      });

      var satellite = L.gridLayer.googleMutant({
        type: 'satellite', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        attribution: '&copy; 2017 AC Office of Environmental Sustainability'
      });

      var terrain = L.gridLayer.googleMutant({
        type: 'terrain', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        attribution: '&copy; 2017 AC Office of Environmental Sustainability'
      });

      var hybrid = L.gridLayer.googleMutant({
        type: 'hybrid', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        attribution: '&copy; 2017 AC Office of Environmental Sustainability'
      });

      var mymap = L.map('mapid', {
        layers: [roads, satellite, terrain, hybrid]
      }).setView([42.3709104, -72.5170028], 16);

      L.control.layers({
        "Roads": roads,
        "Satellite": satellite,
        "Terrain": terrain,
        "Hybrid": hybrid
      }).addTo(mymap);

      function getColor(d) {
        return d > 300 ? '#7a0177' :
               d > 200 ? '#ae017e' :
               d > 100 ? '#dd3497' :
               d > 80 ? '#f768a1' :
               d > 50 ? '#fa9fb5' :
               d > 20  ? '#fcc5c0' :
                          '#feebe2';
      }

      function style(feature) {
        return {
            // fillColor: getColor(feature.properties.electricity),
            weight: 0,
            opacity: 0,
            color: 'white',
            // dashArray: '3'
            // fillOpacity: 1
        };
      }

      var customIcon = L.icon({
        iconUrl: 'https://ceed.ucdavis.edu/modules/campusHome/img/map/classroom-marker.svg',
        iconAnchor: [7, 7],
        iconSize: [15, 15]
      });

      function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.marker) {
          var marker = L.marker(feature.properties.marker, {icon: customIcon});

          marker.bindPopup("<b>" + feature.properties.name + "</b><br>Previous day total: " 
            + feature.properties.electricity + " kWh<br><a href='/energy_data?bld=' class='.popupLink'>View energy usage by hour</a>").
            addTo(mymap);

          L.circle(feature.properties.marker, {
            radius: 50,
            // opacity: 10,
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.electricity),
            weight: 0
          }).addTo(mymap);
        }
      }

      L.geoJson(housingData, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(mymap);

      mymap.on('popupopen', function(e) {
        console.log("popupopen event");

        var marker = e.popup._source;

        var aLink = marker._popup._contentNode.childNodes[4];
        console.log(aLink);

        var bldName = marker._popup._contentNode.childNodes[0].textContent;
        console.log(bldName);

        aLink.onclick = function(e) {
          e.preventDefault();

          console.log('Clicked inside popup');

          $.ajax({url: '/energy_data?bld=' + bldName, success: function(data, status) {
            var overlay = $('#overlay');
            overlay.show();

            $('#overlay-text').text(bldName+ " energy usage for past 24 hours")
            
            console.log(bldName);
            console.log(data['energy_data']);

            var myChart = new Chart($('#myChart'), {
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

            $('.close').click(function() {
              overlay.hide();
              // Prevent hovering problem
              $('#myChart').remove();
              $('#overlay').append('<canvas id="myChart"></canvas>');
            })
          }})
        };
      });
      
      var legend = L.control({position: 'bottomright'});

      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
          // grades = [0, 500, 1000, 2000, 3000, 4000, 5000],
          grades = [0, 20, 50, 80, 100, 200, 300],
          labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' kWH<br>' : '+ kWH');
        }
        return div;
      };

      legend.addTo(mymap);
    }
}

