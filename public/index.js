'use strict';

var fs = require('fs');
var path = require('path');
var turf = require('turf');

var data = {
  pois: null,
  neighborhoods: null
};

loadData();
assign_neighborhoods();

var neighborhoods = data.neighborhoods.features.map(function(neighb) {
  return neighb.properties.neighborhood;
})

function loadData() {
  for (var key in data) {
    data[key] = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/' + key + '.geojson'), 'utf8'));
  }
}

function assign_neighborhoods() {
  data.pois.features.forEach(function(feat, i) {
    data.neighborhoods.features.forEach(function(n) {
      if (turf.inside(turf.point(feat.geometry.coordinates), n)) {
        feat.properties.neighborhood = n.properties.neighborhood;
      }
    })
  })
}

mapboxgl.accessToken = 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw';

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v8', //stylesheet location
  center: [-122.44262695312501, 37.763115548102924], // starting position
  zoom: 12, // starting zoom
});

map.on('style.load', function() {
  console.log("style loaded");

  map.addSource("poi_data", {
    type: "geojson",
    data: "data/test2.geojson",
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 400 // Radius of each cluster when clustering points (defaults to 400)
  })

  map.addSource("neighborhoods_data", {
    type: "geojson",
    data: "data/neighborhoods.geojson"
  })

  map.addLayer({
    "id": "neighborhood_polygons",
    "source": "neighborhoods_data",
    "type": "fill",
    "paint":{
      "fill-color":"blue" ,
      "fill-opacity": .3,
      "fill-outline-color": "white"
    }
  })

  // map.addLayer({
  //   "id": "neighborhood_labels",
  //   "source": "neighborhoods_data",
  //   "type": "symbol",
  //   "layout":{
  //     "text-field": "{neighborhood}",
  //     "text-size": 12,
  //     "text-justify": "center"
  //   }
  // })

  // map.addLayer({
  //   "id": "non-cluster-markers",
  //   "type": "symbol",
  //   "source": "poi_data",
  //   "layout": {
  //     "icon-image": "marker-15"
  //   },
  //   "paint": {},
  //   "interactive": true
  // });

  // // Cluster categories
  // map.addLayer({
  //   "id": "cluster-low",
  //   "type": "circle",
  //   "source": "poi_data",
  //   // Set a filter the 'low' category
  //   "filter": ["<", "point_count", 15],
  //   "layout": {},
  //   "paint": {
  //     "circle-color": "#1a9641",
  //     "circle-radius": 18
  //   },
  //   "interactive": true
  // });

  // var clusters = map.addLayer({
  //     "id": "cluster-count",
  //     "type": "symbol",
  //     "source": "poi_data",
  //     "layout": {
  //         "text-field": "{point_count}",
  //         "text-size": 12
  //     },
  //     "paint": {},
  //     "interactive": true
  // });

})
