// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function () {

  // Private Functions

  function clear_map_markers(map) {
    var jMap = $(map);
    var markers = jMap.data('google_markers');
    if (markers) {
      jQuery.each(markers, function () {
        this.setMap(null);
      });
      markers = null;
    }
    jMap.data('google_markers', null);
  }


  function set_current_location_marker(map, position) {
    var jMap = $(map);
    var marker = jMap.data('google_current_location_marker');
    if (marker) {
      marker.setMap(null);
    }

    var icon = "http://maps.google.com/mapfiles/ms/icons/" + 'green' + ".png";

    marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
      title: 'You',
      icon: new google.maps.MarkerImage(icon)
    });
    jMap.data('google_current_location_marker', marker);
  }

  function reset_bounds_to_include_markers(map) {
    var jMap = $(map);

    // Keep Track of bounds
    var bounds = new google.maps.LatLngBounds();

    var marker = jMap.data('google_current_location_marker');
    if (marker) {
      bounds.extend(marker.position);
    }

    var markers = jMap.data('google_markers');
    if (!markers) {
      markers = [];
    }

    // Extend Bounds for any existing markers
    jQuery.each(markers, function () {
      bounds.extend(this.position);
    });

    map.fitBounds(bounds);
  }

  function set_agents_as_markers(map, data) {
    var jMap = $(map);

    var markers = jMap.data('google_markers');
    if (!markers) {
      markers = [];
    }

    // Add Marker for Each Agent
    jQuery.each(data, function () {
      var position = new google.maps.LatLng(this.latitude, this.longitude);
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        animation: google.maps.Animation.DROP,
        title: this.codename
      });

//      // Allow each marker to have an info window
//      google.maps.event.addListener(marker, 'click', (function(marker, i) {
//        return function() {
//          infoWindow.setContent(infoWindowContent[i][0]);
//          infoWindow.open(map, marker);
//        }
//      })(marker, i));

      // Automatically center the map fitting all markers on the screen
      markers.push(marker);
    });

    jMap.data('google_markers', markers);
  }


  function render_map_if_ready(jMap) {
    if (google_maps_loaded) {

      var agents = jMap.data('nearby_agents');
      var current_location = jMap.data('current_location');

      if (agents && current_location) {

        // Remove Agents Data Attribute since we are consuming it now
        jMap.data('nearby_agents', null);

        var position = new google.maps.LatLng(current_location.lat, current_location.lng);

        var dom_element = jMap[0];

        var map_options = {
          center: position,
          zoom: 15,
          draggable: true,
          keyboardShortcuts: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          navigationControl: false,
          scrollwheel: true,
          streetViewControl: false
        };

        var map = new google.maps.Map(dom_element, map_options);
        $(this).data('google_map', map);

        clear_map_markers(map);
        set_current_location_marker(map, position);
        set_agents_as_markers(map, agents);
        reset_bounds_to_include_markers(map);
      }
      else {
        console.log("Map Data Not Yet Ready");
      }
    }
    else {
      console.log("Google Maps Not Yet Ready");
    }
  }

  function render_maps(selector) {
    var selected = $(selector);
    if (selected.length > 0) {
      selected.each(function () {
        render_map_if_ready($(this));
      });
    }
  }


  var google_maps_loaded = false;

  window.secret_agents = window.secret_agents || {};

// Expose Our Public API
  window.secret_agents.maps = {

    /*
     Reload the nearby agents via json and store them in the
     containers data('nearby_agents')

     */
    load_nearby_agents: function (selector, lat, lng) {
      var selected = $(selector);

      selected.each(function () {
        var jMap = $(this);
        var data_params = {'lat': lat, 'lng': lng };
        jMap.data('current_location', data_params);
        $.ajax({
          dataType: 'json',
          url: '/secret_agents/near.json',
          data: data_params,
          error: function (request, status, error) {
            jMap.data('nearby_agents', null);
            set_error('Unable to retrieve data from ' + url + ' : ' + request.responseJSON.message);
            render_maps(jMap);
          },
          success: function (data) {
            jMap.data('nearby_agents', data);
            render_maps(jMap);
          }
        });
      });
    },

    google_maps_ready: function (selector) {
      google_maps_loaded = true;
      render_maps(selector);
    },

    show_nearby_agents: function (map) {
      var lat_lng = map.getCenter();
      var data_params = {'lat': lat_lng.lat(), 'lng': lat_lng.lng() };
      clear_map_markers(map);
      set_current_location_marker(map, lat_lng);

      $.ajax({
        dataType: 'json',
        url: '/secret_agents/near.json',
        data: data_params,
        error: function (request, status, error) {
          set_error('Unable to retrieve data from ' + url + ' : ' + request.responseJSON.message);
        },
        success: function (data) {
          set_agents_as_markers(map, data);
          reset_bounds_to_include_markers(map);
        }
      });
    }
  };

  console.log('Maps Js Loaded and Intialized');
})
;
