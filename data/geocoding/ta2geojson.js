// Project: TripAdvisor Lab
// Description: a series of asynchronous function that
//               1. loads in TA POI data
//               2. loads in all geocode responses for TA data in batches of 100
//               3. combines TA and geocode responses to produce valid GeoJSON
//               4. outputs GeoJSON in batches of 100
//               5. combines all GeoJSON output into one file, logs total number of errors
// Date: 1/26/2016
// Author: Molly Lloyd, @mollymerp

// packaged node modules
var fs = require('fs');
var path = require('path');

// external dependencies
var q = require('q');

// custom modules
var merge_geocode_ta_data = require('./merge_geocode_ta_data');


var pois, filenames, defer;
var input_data_dir = 'geocode_responses/temp_dataset_results';
var combined_data_dir = 'merged_data/temp_dataset_merged/';

// this block is where the action is
read_json('ta_unique_poi.json', '../')
  .then(get_json_files)
  .then(function(filenames) {
    // iterate through .json files outputted by batch geocoder (127 total)
    // each file has 50 pois results
    promiseCollection(filenames, read_json)
      .then(function(json_data) {
        json_data.forEach(function(d, i) {
          merge_geocode_ta_data(d, pois);
        });
        promiseCollection(json_data, processFiles, ".json", "features")
          .then(function(feature_data) {
            all_geojson = {
              "type": "FeatureCollection",
              "features": []
            };
            feature_data.forEach(function(d){
              all_geojson.features.push(d);
            })

            fs.writeFile(path.join(__dirname, 'merged_data/TA_all.geojson'), JSON.stringify(all_geojson), function(err){
              if (err) {
                console.log("error saving file!")
              } else {
                console.log("all matched records saved!");
              }
            })
          })
        // promiseCollection(json_data, processFiles, "_errors.json", "length")
        // .then(function(error_counts) {
        //   console.log(error_counts);
        //   var error_total = error_counts.reduce(function(prev, current){
        //     if (current === parseInt(current, 10)){
        //       return prev+current;
        //     }
        //     return prev;
        //   })
        //   console.log("total number of records dropped after geocoding: ", error_total);
        // })
      })
      .catch(function(err) {
        if (err) console.log("q.error", err);
      })
  })
  .catch(function(err) {
    if (err) console.log("q error", err)
  })

//////////////////////////////////////////
// helpers

function processFiles(d, filex, attribute) {
  // console.log("processing", path.join(__dirname, combined_data_dir, d.batch + filex));
  defer = q.defer();
  fs.readFile(path.join(__dirname, combined_data_dir, d.batch + filex), function(err, data) {
    if (err) {
      console.log("error reading errors");
      defer.reject(err);
    } else {
      parsed_data = JSON.parse(data)
      defer.resolve(parsed_data[attribute]);
    }
  })
  return defer.promise;
}

function promiseCollection(collection, func, filex, attribute) {
  var currentPromise = q();
  var promises = collection.map(function(el) {
    return currentPromise = currentPromise.then(function() {
      return func(el, filex, attribute);
    })
  })
  return q.all(promises);
}

function get_json_files() {
  defer = q.defer();
  fs.readdir(path.join(__dirname, input_data_dir), function(err, files) {
    if (err) {
      console.log("error reading directory");
      defer.reject(err);
    } else {
      filenames = files.filter(function(file) {
        // make sure the files are .json and not anything crazy
        return /^.*\.(json)$/i.test(file);
      }).sort(function(a, b) {
        // and make sure they're in the order that matches our TA data
        return (+a.split(".")[0]) - b.split(".")[0];
      });
      defer.resolve(filenames);
    }
  })
  return defer.promise;
}

function read_json(filename, dir) {
  dir = dir || input_data_dir;
  defer = q.defer();
  // console.log("file", path.join(__dirname, dir) + '/' + filename)
  fs.readFile(path.join(__dirname, dir) + '/' + filename, function(err, data) {
    if (err) {
      console.log("read_json err:", filename);
      defer.reject(err);
    } else {
      parsed_data = JSON.parse(data)
      if (dir !== input_data_dir) {
        pois = parsed_data;
      }
      defer.resolve({
        data: parsed_data,
        batch: filename.replace(/(.json)/g, "")
      });
    }
  });
  return defer.promise;
}
