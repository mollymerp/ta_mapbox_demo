// Project: TripAdvisor Lab
// Description: blends geocoder results with TA raw data and outputs valid GeoJSON of 
//              all features with a relevant match from the geocoder
// Date: 1/26/2016
// Author: Molly Lloyd, @mollymerp

var turf = require('turf');
var fs = require('fs');
var path = require('path');

module.exports = function(promise, pois) {
  var geocode_json = promise.data;
  var batch = promise.batch;
  var merged_json = {
    "type": "FeatureCollection",
    "features": []
  };
  var errors = [];
  console.log("current batch", batch);
  if (batch !== 0) {
    geocode_json.forEach(function(point_res, j) {
      j = (batch * 100) + j;
      var trimmed = cleanStrings(point_res.query, pois[j]);
      var query = trimmed.clean_query;
      // make sure the POI is in SF using turf and a bounding box of the SF bay area
      var results_in_sf = turf.within(point_res, sf_bbox);
      if (!results_in_sf.features[0] || point_res.features[0].place_name !== results_in_sf.features[0].place_name) {
        errors = pushToErrors(j, trimmed.street, trimmed.name, query, "not in sf", errors)

      } else {
        var ta_properties = renameTAProperties(pois[j]);
        var merge = results_in_sf.features[0];
        for (key in ta_properties) {
          merge.properties[key] = ta_properties[key];
        }
        if ((merge['relevance'] > .7) && merge['place_name'] !== 'San Francisco, California, United States') {
          delete merge['relevance'];
          delete merge['address'];
          merged_json.features.push(merge)
        } else {
          pushToErrors(j, trimmed.street, trimmed.name, query, "not relevant: " + merge['relevance'], errors, merge)
        }
      }
    })
    writeFile(false, batch, merged_json);
    writeFile(true, batch, errors);
  }
}

/////////////////////////
// helper functions

function cleanStrings(query, poi) {
  var trimmed = {};
  // I added the string "san fransisco" to all queries, so I remove it here
  trimmed.clean_query = query.slice(0, query.length - 2).join(" ");
  // using regex to eliminate punctuation and double spaces from the TA data
  trimmed.street = poi.street1 ? poi.street1.toLowerCase().trim().replace(/[^\w\s]|_/g, "").replace(/(\s{2})/g, " ") : "";
  trimmed.name = poi.primaryname ? poi.primaryname.toLowerCase().trim().replace(/[^\w\s]|_/g, "").replace(/(\s{2})/g, " ") : "";
  return trimmed;
}

// pushToErrors signature:
// j : index of POI
// street: string representing the 'street1' field in the TA data
// name: POI name if applicable, TA field name 'primaryname'
// type: type of error produced, string in ["not relevant: " + merge['relevance'], "not in sf"]
// errors: array of all current errors
// feature: send whole record that was determined irrelevant -- only used for the optional error logging
// >> returns: new errors array with one additional error
function pushToErrors(j, street, name, query, type, errors, feature) {
  // // optional error logging for geocode results that were determined not relevant enough or just returned the city of SF
  // if (feature) {
  //   console.log("relevance error feature: ", feature, ", query", query)
  // } else {
  //   console.log('error: ' + type, j, street, name, query);
  // }
  errors.push({
    type: type,
    index: j,
    street1: street,
    primaryname: name,
    query: query
  });
  return errors;
}

function writeFile(error, batch, json) {
  var filex = error ? '_errors.json' : '.json'
  fs.writeFile(path.join(__dirname, 'merged_data/temp_dataset_merged/', batch + filex), JSON.stringify(json), function(err) {
    if (err) {
      console.log("error saving file", batch);
    }
    else console.log("successfully wrote file", batch);
  })
}

renameTAProperties = function(obj) {
  // Check for the old property name to avoid a ReferenceError in strict mode.
  var dictionary = {
    "name": "placetype",
    "primaryname": "name",
    "officialurl": "website"
  }

  for (var key in dictionary) {
    if (obj.hasOwnProperty(key)) {
      obj[dictionary[key]] = obj[key];
      delete obj[key];
    }
  }

  return obj;
};
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
          [-122.65823364257811, 37.87268533717655],
          [-122.43988037109374, 37.92253448828906],
          [-122.35061645507812, 37.860759886765194],
          [-122.25585937500001, 37.87268533717655],
          [-122.16934204101562, 37.75768707689704],
          [-122.33413696289064, 37.72510788462094],
          [-122.37396240234375, 37.70446698048763],
          [-122.53051757812499, 37.693601037244406],
          [-122.65823364257811, 37.87268533717655]
        ]
      ]
    }
  }]
}
