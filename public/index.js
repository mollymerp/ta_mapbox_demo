'use strict';

var data = {
  pois: null,
  neighborhoods: null
};

$.getJSON('data/pois.geojson', function(dat) {
  data.pois = dat;
  $.getJSON('data/neighborhoods.geojson', function(n_dat) {
    data.neighborhoods = n_dat

    // loadData();
    assign_neighborhoods();

    var neighborhoods = {};
    data.neighborhoods.features.forEach(function(n) {
       neighborhoods[n.properties.neighborhood] = {"center": turf.center(turf.featurecollection([n])).geometry.coordinates, "extent": [turf.extent(n).slice(0,2),turf.extent(n).slice(2)]};
    });
    

    function loadData() {
      for (var key in data) {
        data[key] = JSON.parse(fs.readFile(path.join(__dirname, 'data/' + key + '.geojson'), 'utf8'));
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
      center: [-122.4766159057617, 37.77505678240509], // starting position
      zoom: 12, // starting zoom
    });

    map.on('style.load', function() {
      map.addSource("poi_data", {
        type: "geojson",
        data: "data/pois.geojson",
        cluster: true,
        clusterMaxZoom: 13, // Max zoom to cluster points on
        clusterRadius: 600 // Radius of each cluster when clustering points (defaults to 400)
      })

      map.addSource("neighborhoods_data", {
        type: "geojson",
        data: "data/neighborhoods.geojson"
      })

      map.addLayer({
        "id": "neighborhoods",
        "source": "neighborhoods_data",
        "type": "fill",
        "layout":{
          "visibility":"visible"
        },
        "paint": {
          "fill-color": "blue",
          "fill-opacity": {
            "base": 0.3,
            "stops": [[12, 0.3],[13, 0.15],[14,0]]
          } ,
          "fill-outline-color": "white"
        },
        "interactive": true
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

      map.addLayer({
        "id": "non-cluster-markers",
        "type": "symbol",
        "source": "poi_data",
        "layout": {
          "icon-image": "{maki}-15"
        },
        "paint": {
          "icon-color":"gray"
        },
        "interactive": true
      });

      // Cluster categories
      map.addLayer({
        "id": "cluster-low",
        "type": "circle",
        "source": "poi_data",
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "circle-color": "#1a9641",
          "circle-radius": {
            "base": 30,
            "stops": [[12, 30], [13, 25], [14, 20], [15,15]]
          }
        },
        "interactive": true
      });

      var clusters = map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "poi_data",
        "layout": {
          "text-field": "{point_count}",
          "text-size": 12,
          "visibility": "visibile"
        },
        "paint": {},
        "interactive": true
      });
      
      // map state setting functions
      var map_zoomed = false; 

      function getMapState() {
        var state = {
          "zoom": map.getZoom(),
          "neighborhood_vis": map.getLayoutProperty("neighborhoods", "visibility"),
          // "cluster_vis": map.getLayoutProperty("cluster", "visibility")
        };
        return state;
      }
      
      function setMapState(){
       // function for setting many map attributes at once? 
      }

      function getViewState(){
        // function for determining any of the filtering/interactive options on the UI
      }


      map.on('click', function(e) {
        map.featuresAt(e.point, {
          "layer": "neighborhoods"
        }, function(err, features) {
          if (err) console.log(err);
          if (features) {
            if (getMapState().neighborhood_vis === "visible"){
              map.fitBounds(neighborhoods[features[0].properties.neighborhood].extent);
              // map.setLayoutProperty("neighborhoods", "visibility", "none");
            }
          }
        })

      // map.on('zoomend', function(e){
      //   var state = getMapState();
      //   console.log("zoom end", state.zoom)
      //   if (state.zoom < 12 && state.neighborhood_vis === "none") {
      //     map.setLayoutProperty("neighborhoods", "visibility", "visible");
      //   } else if (state.zoom >= 12 && state.neighborhood_vis === "visible") {
      //     map.setPaintProperty("neighborhoods", "fill-color", "none");
          
      //   }
      // })

      })

    })
  })
})
