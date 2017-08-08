// Draw text inside center of donut charts
Chart.pluginService.register({
  beforeDraw: function (chart) {
    if (chart.config.options.elements.center) {
      //Get ctx from string
      var ctx = chart.chart.ctx;

      //Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000';
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
      //Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = (chart.innerRadius * 2);

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight);

      //Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
      ctx.font = fontSizeToUse+"px " + fontStyle;
      ctx.fillStyle = color;

      //Draw text in center
      ctx.fillText(txt, centerX, centerY);
    }
  }
});

window.tempColors = {
  cold: '#10788E',
  chilly: '#5FC8E8',
  perfect: '#94BC46',
  warm: '#EF8E27',
  hot: '#EC5A29'
};

window.tempLabels = ['cold', 'chilly', 'perfect', 'warm', 'hot'];

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

function initDoughnutChart(canvasID, data) {
  return new Chart(canvasID, {
    type: 'doughnut',
    data: {
      labels: window.tempLabels,
      datasets: [{
        data: data['doughnut_data'],
        backgroundColor: [
          window.tempColors.cold, 
          window.tempColors.chilly, 
          window.tempColors.perfect, 
          window.tempColors.warm, 
          window.tempColors.hot
        ]
      }]
    },
    options: {
      responsive: true,
      animation: {
        animateScale: true,
        animateRotate: true
      },
      cutoutPercentage: 60,
      legend: {
        labels: {
          boxWidth: 10
        }
      },
      elements: {
        center: {
          text: data['percentage'] + ' ' + window.tempLabels[data['majority']],
          color: window.tempColors[window.tempLabels[data['majority']]], // Default is #000000
          fontStyle: 'Roboto', // Default is Arial
          sidePadding: 20 // Defualt is 20 (as a percentage)
        }
      }
    }
  });
}

function initLineChart(canvasID, data) {
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

/////////////////////////////////////////////////
////////////// Initialize map ///////////////////
var roads = getLayer('roadmap'),
    satellite = getLayer('satellite'),
    terrain = getLayer('terrain'),
    hybrid = getLayer('hybrid');

window.mymap = L.map('mapid', {
  layers: [satellite, terrain, hybrid, roads]
}).setView([42.3709104, -72.5170028], 16);

L.control.layers({
  "Roads": roads,
  "Satellite": satellite,
  "Terrain": terrain,
  "Hybrid": hybrid
}).addTo(window.mymap);
/////////////////////////////////////////////////
/////////////////////////////////////////////////

