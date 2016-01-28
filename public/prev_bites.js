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
    &middot;  <a href='#' target='_blank' id = '<%- data.street1 %>' class='get-directions strong micro'>Get Directions</a>
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



function buildPopup(feature, id) {
  var popupEl = document.createElement('div');
  popupEl.className = 'pad1 block';
  popupEl.id = id;
  popupEl.innerHTML = listing_template({
    data: feature.properties
  });
  return popupEl;
}

