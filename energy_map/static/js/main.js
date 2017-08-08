// See utilities.js for utility variables and functions used
var mymap = window.mymap;

main = {
    init: function(housingData, staticFolder) {
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
                mymap.setView(e.target.getLatLng(), mymap.getZoom());
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

            var myChart = initLineChart($('#myChart'), data);

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
          "<a id='viewFeedbackLink' href='#'>View feedbacks</a><br>" +
          "<a id='leaveFeedbackLink' href='#'>Leave feedback</a>").
              on('click', function(e) {
                mymap.setView(e.target.getLatLng(), mymap.getZoom()); // 16
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

            var myChart = initDoughnutChart($('#myDoughnut'), data);

            var fb_list = JSON.parse(data['feedbacks']);
            console.log(fb_list);

            for (var i = 0; i < fb_list.length; i++) {
              var fb_obj = fb_list[i];
              console.log(fb_obj);

              $('#fbv-feedbacks').append('<p>' + fb_obj.fields.text + '</p>');
            }

            // Make background darker
            $('#mapid').css('opacity', 0.5);
            $('.main-panel').css('background-color', 'black');

            $('.close').click(function() {
              overlay.hide();

              // Make background normal
              $('#mapid').css('opacity', 1);
              $('.main-panel').css('background-color', '');

              // Prevent hovering problem
              $('#myDoughnut').remove();
              $('#fbv-doughnut-container').append('<canvas id="myDoughnut"></canvas>');
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

