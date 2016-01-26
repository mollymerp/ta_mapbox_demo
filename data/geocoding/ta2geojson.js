// packaged node modules
var fs = require('fs');
var path = require('path');

// external dependencies
var q = require('q');

// custom modules
var merge_geocode_ta_data = require('./merge_geocode_ta_data');

var pois, filenames, defer, errors;

// this block is where the action is
read_json('ta_unique_poi.json', '../')
  .then(get_json_files)
  .then(function(filenames) {
    // iterate through .json files outputted by batch geocoder (127 total)
    // each file has 50 pois results
    promiseCollection(filenames, read_json)
    .then(function (json_data) {
      json_data.forEach(function (d, i){
        // if (i===0){

        merge_geocode_ta_data(d, pois);
        // }
      })
    })
    .catch(function (err){
      if (err) console.log("q.error",err);
    })
  })
  .catch(function (err){
    if (err) console.log("q error", err)
  })



//////////////////////////////////////////
// helpers

function promiseCollection(collection, func) {
  var currentPromise = q();
  var promises = collection.map(function(el) {
    return currentPromise = currentPromise.then(function() {
      return func(el);
    })
  })
  return q.all(promises);
}


function get_json_files() {
  defer = q.defer();
  fs.readdir(path.join(__dirname, 'geocode_responses'), function(err, files) {
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
  dir = dir || 'geocode_responses';
  defer = q.defer();
  fs.readFile(path.join(__dirname, dir) + '/' + filename, function(err, data) {
    if (err) {
      console.log("read_json err:", filename);
      defer.reject(err);
    } else {
      parsed_data = JSON.parse(data)
      if (dir !== 'geocode_responses') {
        pois = parsed_data;
      }
      defer.resolve({
        data: parsed_data,
        batch: filename.replace(".json","")
      });
    }
  });
  return defer.promise;
}
