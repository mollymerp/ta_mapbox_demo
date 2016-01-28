'use strict';

var data = {
  pois: null,
  neighborhoods: null
};

var popupHover, popup;

$.getJSON('data/pois.geojson', function(dat) {
  data.pois = dat;
  $.getJSON('data/neighborhoods.geojson', function(n_dat) {
    data.neighborhoods = n_dat

    // loadData();
    assign_neighborhoods();

    var neighborhoods = {};
    data.neighborhoods.features.forEach(function(n) {
      neighborhoods[n.properties.neighborhood] = {
        "center": turf.center(turf.featurecollection([n])).geometry.coordinates,
        "extent": [turf.extent(n).slice(0, 2), turf.extent(n).slice(2)]
      };
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
      style: 'mapbox://styles/mlloyd/cigu4i3pv00059gm0p6g1b4el', //stylesheet location
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
        "type": "line",
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "line-color": "#CC7E55",
          "line-width": {
            "base": 3,
            "stops": [
              [12, 2],
              [13, 1],
              [14, 0]
            ]
          }
        },
        "interactive": true
      })

      map.addLayer({
        "id": "non-cluster-markers",
        "type": "symbol",
        "source": "poi_data",
        "layout": {
          "icon-image": "{maki}-18"
        },
        "paint": {
          "icon-color": "gray"
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
        "filter": [">", "point_count", 2],
        "paint": {
          "circle-color": "black",
          "circle-opacity": .5,
          "circle-radius": {
            "base": 30,
            "stops": [
              [12, 30],
              [13, 25],
              [13.5, 20]
            ]
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

      // tab switch views 
      var $directionsView = document.getElementById('directions-view');
      var $searchView = document.getElementById('search-view');

      // map state setting functions

      function getMapState() {
        var state = {
          "zoom": map.getZoom(),
          "neighborhood_vis": map.getLayoutProperty("neighborhoods", "visibility"),
          "directions": false
        };
        return state;
      }

      function getFeatures() {
        var center = map.getCenter()
        var center_arr = [center.lng, center.lat]

        var $popup = map.getContainer().querySelector('#popup');
        if ($popup) popup.remove();

        map.featuresAt(center_arr, {
          radius: 800,
          includeGeometry: true,
          layer: ['non-cluster-markers']
        }, function(err, features) {
          if (err) return console.error(err);
          if (features.length > 10){

            buildListings(features);
          } 
        });
      }

      function buildListings(features) {
        var $listing = document.getElementById('listing');
        $listing.innerHTML = '';
        if (features.length) {
          features.forEach(function(feature) {
            var item = document.createElement('button');
            item.innerHTML = listing_template({
              data: feature.properties
            });
            $listing.appendChild(item);

            item.addEventListener('click', function() {
              featureSelection(feature);
            });
            item.addEventListener('mouseover', function() {
              featureHover(feature);
            });
            item.addEventListener('mouseout', function() {
              var $popupHover = map.getContainer().querySelector('#popup-hover');
              if ($popupHover) popupHover.remove();
            });
            $(item).find('.get-directions').on('click', function(e) {
              e.preventDefault();
              showDirectionsView($(this).attr('id'));
            });
          });
        } else {
          var emptyState = document.createElement('div');
          emptyState.className = 'pad1 prose';
          emptyState.textContent = document.getElementById('legend').textContent;
          $listing.appendChild(emptyState);
        }
      }

      function featureHover(feature) {
        var $popupHover = map.getContainer().querySelector('#popup-hover');
        if ($popupHover) popupHover.remove();

        popupHover = new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(buildPopup(feature, 'popup-hover').outerHTML)
          .addTo(map);
      }

      function featureSelection(feature) {
        var $popupHover = map.getContainer().querySelector('#popup-hover');
        var $popup = map.getContainer().querySelector('#popup');
        if ($popupHover) popupHover.remove();
        if ($popup) popup.remove();

        var coords = feature.geometry.coordinates;

        popup = new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(buildPopup(feature, 'popup').outerHTML)
          .addTo(map);

        map.flyTo({
          "center": coords,
          "zoom": 14
        });
      }

      function getViewState() {
        // function for determining any of the filtering/interactive options on the UI
      }

      ////////// build UI
      var directions = mapboxgl.Directions({
        unit: 'metric', // Use the metric system to display distances.
        profile: 'walking', // Set the initial profile to walking.
        container: 'directions-view', // Specify an element thats not the map container.
        proximity: [-122.4766159057617, 37.77505678240509] // Give search results closer to these coordinates higher priority.
      });

      function showDirectionsView(destination) {
        console.log("destination", destination);
        $searchView.style.visibility = 'hidden';
        $directionsView.style.visibility = 'visible';
        map.addControl(directions);
        directions.setOrigin('San Francisco');
        destination ? directions.setDestination(destination) : null;
      }

      $directionsView.addEventListener('click', function(e) {
        console.log("fired", e);

      });

      map.on('click', function(e) {
        map.featuresAt(e.point, {
          "layer": "neighborhoods"
        }, function(err, features) {
          if (err) console.log(err);
          if (features) {
            if (getMapState().neighborhood_vis === "visible") {
              map.fitBounds(neighborhoods[features[0].properties.neighborhood].extent);
            }
          }
        })
      })

      map.on('zoomend', function (e){
        getFeatures();
      })

      map.on('mousemove', function(e) {
        map.featuresAt(e.point, {
          radius: 7.5,
          includeGeometry: true,
          layer: 'non-cluster-markers'
        }, function(err, feature) {
          if (err) return console.error(err);
          if (getMapState().zoom > 13) {
            if (feature.length) {
              featureHover(feature[0]);
              map.getCanvas().style.cursor = 'pointer';
            } else {
              var $popupHover = map.getContainer().querySelector('#popup-hover');
              if ($popupHover) popupHover.remove();
              map.getCanvas().style.cursor = '';
            }
          }

        });
      });

      function init() {
        buildListings(data.pois.features);
        $searchView.style.visibility = 'show';
      }

      init();

    })
  })
})
