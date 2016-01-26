module.exports = function(promise) {
  var geocode_json = promise.data;
  var batch = promise.batch;
  var merged_json = {"type": "FeatureCollection", "features": []};
  var errors = [];
  console.log("current batch", batch);
  geocode_json.forEach(function (point_res, j){
    j = (batch*50) + j;
    var query = point_res.query.slice(0,point_res.query.length-2).join(" ");
    var street = pois[j].street1 ? pois[j].street1.toLowerCase().trim().replace(/[^\w\s]|_/g,""): "";
    var name = pois[j].primaryname ? pois[j].primaryname.toLowerCase().trim().replace(/[^\w\s]|_/g,""): "";
    if (street === query || name === query) {
      console.log(j, "success")
      // make sure the POI is in SF using turf and a bounding box of the SF bay area
      var results_in_sf = turf.within(point_res, sf_bbox);
      if (!results_in_sf.features[0] || point_res.features[0].place_name !== results_in_sf.features[0].place_name) {
        console.log('non-matching')
        errors.push({index: j, street1: street, primaryname: name, query: query});
      } else {
        merged_json.features.push(results_in_sf.features[0])
      }  
    } else {
      console.log(j, street, name, query)
      errors.push({index: j, street1: street, primaryname: name, query: query});
    }
  })
  fs.writeFile(path.join(__dirname, 'merged_data',batch+'.json'), JSON.stringify(merged_json), function (err){
    if (err) {
      console.log("error saving file", batch);
    }
    else console.log("successfully wrote file", batch);
  })
  fs.writeFile(path.join(__dirname, 'merged_data',batch+'_errors.json'), JSON.stringify(errors), function (err){
    if (err) {
      console.log("error saving file", batch);
    }
    else console.log("successfully wrote file", batch);
  })

}


/////////////////////////
// helper functions

