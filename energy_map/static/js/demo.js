type = ['','info','success','warning','danger'];
myUrl = "http://148.85.253.152:15675"    	

demo = {
    initLeaflet: function(housingData) {
      var mymap = L.map('mapid').setView([42.3709104, -72.5170028], 16);

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
        // TODO: search for electricity values by POST request
        // with building name as param
        
        return {
            fillColor: getColor(feature.properties.electricity),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 1
        };
      }


      function onEachFeature(feature, layer) {
        // TODO: search for electricity values by POST request
        // with building name as param

        if (feature.properties && feature.properties.marker) {
          L.marker(feature.properties.marker).
            bindPopup("<b>" + feature.properties.name + "</b><br>Curr Avg: " 
            + feature.properties.electricity + " kWh<br><a href='/energy_data?bld=' class='.popupLink'>View energy usage by hour</a>").
            addTo(mymap);
        }
      }

      var roads = L.gridLayer.googleMutant({
        type: 'roadmap' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
      }).addTo(mymap);

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

            $('#overlay-text').text(data['bld_name'] + " energy usage for past 24 hours")
            
            console.log(data['bld_name']);
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
                  pointStyle: 'circle'
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
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
      };

      legend.addTo(mymap);
    }
}
