// functions snapped from a couple mapbox bites

var listing_html = `<div class='info-popup pad1 keyline-bottom'>
  <h4 class = "fancy"><%- data.name %> </h4>
  <h4>
    <span class='pad0 inline dot space-right0 fill-midnight %>'></span>
    <%- data.placetype %>
  </h4>
  <div class='quiet'>
    <% if (data.street1) { %><%- data.street1 %><% } %>
    <% if (data.street2) { %><%- data.street2 %><% } %>
  </div>
  <% if (data.telephone) { %>
    <a href='tel:+<%- data.telephone %>' class='strong micro'><%- data.telephone %></a>
  <% } %>
  <% if (data.website) { %>
    &middot;  <a href='<%- data.website %>' target='_blank' class='strong micro'>Website</a>
  <% } %>
  <% if (data.street1) { %>
    &middot;  <a href='#' target='_blank' id = '<%- data.street1 %>' class='strong micro'>Get Directions</a>
  <% } %>
</div>`;

var listing_template = _.template(listing_html);

// build interactions
var $filterQuery = document.getElementById('filter-listings');

// Input filtering
$filterQuery.addEventListener('keyup', function(e) {
  var q = e.target.value;
  if (q.length > 4) {
    fuzzyFilter(q, data.pois.features);
  }
});

function fuzzyFilter(query, features) {
  if (query) {
    features = fuzzy.filter(query, features, {
      extract: function(feature) {
        var p = feature.properties;
        return [p.name, p.street1, p.category].join();
      }
    }).map(function(d) {
      return d.original;
    });
  }

  buildListings(features);
}

function getFeatures() {
  var center = map.getCenter();

  var $popup = map.getContainer().querySelector('#popup');
  if ($popup) popup.remove();

  map.featuresAt(center, {
    radius: getComputedStyle(document.getElementById('map'), null).width.replace("px", "") / 2,
    includeGeometry: true,
    layer: 'non-cluster-markers'
  }, function(err, features) {
    if (err) return console.error(err);
    buildListings(features);
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
    });
  } else {
    var emptyState = document.createElement('div');
    emptyState.className = 'pad1 prose';
    emptyState.textContent = document.getElementById('legend').textContent;
    $listing.appendChild(emptyState);
  }
}


function buildPopup(feature, id) {
  var popupEl = document.createElement('div');
  popupEl.className = 'pad1 block';
  popupEl.id = id;
  popupEl.innerHTML = listing_template({
    data: feature.properties
  });
  return popupEl;
}

function featureHover(feature) {
  var $popupHover = map.getContainer().querySelector('#popup-hover');
  if ($popupHover) popupHover.remove();

  popupHover = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    .setHTML(buildPopup(feature, 'popup-hover').outerHTML)
    .addTo(map);
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
    .setHTML(buildPopup(feature, 'popup'))
    .addTo(map);
}
