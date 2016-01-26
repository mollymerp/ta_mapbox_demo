var fs = require('fs');
var parse = require('csv-parse');
var q = require('q');
var path = require('path');
var turf = require('turf');

var pois, filenames, defer;
//ta_unique_poi


read_json('ta_unique_poi.json','../')
  .then(get_json_files)
  .then(function(filenames) {
    // iterate through .json files outputted by batch geocoder (127 total)
    // each file has 50 pois results
    for (var i = 0; i < filenames.length; i++) {
      // iife to prevent index jumbling
      (function(i) {
        read_json(filenames[i])
          .then(merge_geocode_ta_data(json, i))
      }(i))
    }
  });

function merge_geocode_ta_data(geocode_json, batch_i) {
  geocode_json.forEach(function (point_res, i){
    var query = point_res.query.join(" ");
    if ()
  })
}

function read_poi_csv(filename) {
  defer = q.defer();
  fs.readFile(path.join(__dirname, '../' + filename), function(err, buffer) {
    if (err) {
      defer.reject(err);
    } else {
      parse(buffer, function(err, parsed_data) {
        pois = parsed_data;
        defer.resolve(parsed_data);
      })
    }
  })
  return defer.promise;
}

function get_json_files() {
  defer = q.defer();
  fs.readdir(path.join(__dirname, 'geocode_responses'), function(err, files) {
    if (err) {
      defer.reject(err);
    } else {
      filenames = files.filter(function(file) {
        // make sure the files are .json and not anything crazy
        return /^.*\.(json)$/i.test(file);
      });
      defer.resolve(filenames);
    }
  })
  return defer.promise;
}

function read_json(filename, dir) {
  dir = dir || 'geocode_responses';
  defer = q.defer();
  fs.readFile(path.join(__dirname, dir) + '/' + filename, function(err, data) {
    if (err) {
      defer.reject(err);
    } else {
      if (dir !== 'geocode_responses') {
        pois = JSON.parse(data);
      }
      defer.resolve(JSON.parse(data));
    }
  });
  return defer.promise;
}

// bounding box for turf within function call
// makin sure all the POI coordinates are indeed in SF (bay area)
var sf_bbox = {
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [-122.65823364257811,37.87268533717655],
          [-122.43988037109374,37.92253448828906],
          [-122.35061645507812,37.860759886765194],
          [-122.25585937500001,37.87268533717655],
          [-122.16934204101562,37.75768707689704],
          [-122.33413696289064,37.72510788462094],
          [-122.37396240234375,37.70446698048763],
          [-122.53051757812499,37.693601037244406],
          [-122.65823364257811,37.87268533717655]
        ]
      ]
    }
  }]
}
