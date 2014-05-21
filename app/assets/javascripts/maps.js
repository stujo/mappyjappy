// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function () {

  // Private Functions

  function clear_map_markers(map_container) {
    var markers = map_container.data('google_markers');
    if (markers) {
      jQuery.each(markers, function () {
        this.setMap(null);
      });
      markers = null;
    }
    map_container.data('google_markers', null);
  }


  function set_current_location_marker(map_container) {
    var current_location = map_container.data('current_location');
    var position = new google.maps.LatLng(current_location.lat, current_location.lng);

    var marker = map_container.data('google_current_location_marker');
    if (marker) {
      marker.setMap(null);
    }

    var google_map = map_container.data('google_map');

    var icon = "http://maps.google.com/mapfiles/ms/icons/" + 'green' + ".png";

    marker = new google.maps.Marker({
      position: position,
      map: google_map,
      animation: google.maps.Animation.DROP,
      title: 'You',
      icon: new google.maps.MarkerImage(icon)
    });
    map_container.data('google_current_location_marker', marker);
  }

  function reset_bounds_to_include_markers(map_container) {

    var google_map = map_container.data('google_map');

    // Keep Track of bounds
    var bounds = new google.maps.LatLngBounds();

    var marker = map_container.data('google_current_location_marker');
    if (marker) {
      bounds.extend(marker.position);
    }

    var markers = map_container.data('google_markers');
    if (!markers) {
      markers = [];
    }

    // Extend Bounds for any existing markers
    jQuery.each(markers, function () {
      bounds.extend(this.position);
    });

    google_map.fitBounds(bounds);
  }

  function agent_info_content(agent) {
    return '<div class="agent_info"><h1>Agent: ' + agent.codename + '</h1><p>' + agent.address + '</p>';
  }

  function set_agents_as_markers(map_container, data) {

    var agents = map_container.data('nearby_agents');

    map_container.data('nearby_agents', null);

    var markers = map_container.data('google_markers');
    if (!markers) {
      markers = [];
    }

    var google_map = map_container.data('google_map');

    if (agents) {
      // Add Marker for Each Agent
      jQuery.each(agents, function () {
        var agent = this;
        var position = new google.maps.LatLng(this.latitude, this.longitude);
        var marker = new google.maps.Marker({
          position: position,
          map: google_map,
          animation: google.maps.Animation.DROP,
          title: agent.codename
        });

        // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', function () {
          var info_window = ensure_info_window(map_container);
          info_window.setContent(agent_info_content(agent));
          info_window.open(google_map, this);
        });

        // Automatically center the map fitting all markers on the screen
        markers.push(marker);
      });
    }

    map_container.data('google_markers', markers);
  }

  function hide_secret_overlay() {
    $('#secret_overlay').hide();
  }

  function render_map_markers(map_container) {
    clear_map_markers(map_container);
    set_current_location_marker(map_container);
    set_agents_as_markers(map_container);
    reset_bounds_to_include_markers(map_container);
  }

  function ensure_info_window(map_container) {
    var info_window = map_container.data('google_map_info_window');
    if (!info_window) {
      info_window = new google.maps.InfoWindow();
      map_container.data('google_map_info_window', info_window);
    }
    return info_window;
  }


  function ensure_google_map(map_container) {
    var google_map = map_container.data('google_map');

    if (!google_map) {

      var current_location = map_container.data('current_location');
      var position = new google.maps.LatLng(current_location.lat, current_location.lng);

      var dom_element = map_container[0];

      var map_options = {
        center: position,
        zoom: 15,
        draggable: false,
        keyboardShortcuts: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        navigationControl: false,
        scrollwheel: true,
        streetViewControl: false
      };

      google_map = new google.maps.Map(dom_element, map_options);
      map_container.data('google_map', google_map);

      // Install a resize handler to handle changes in window size
      $(window).on('resize', function () {
        google.maps.event.trigger(google_map, 'resize');
        reset_bounds_to_include_markers(map_container);
      });

      // Install a click handler to redo the search and send a new location
      google.maps.event.addListener(google_map, 'click', function (event) {
        window.secret_agents.maps.load_nearby_agents(map_container, event.latLng.lat(), event.latLng.lng());
      });

      return google_map;
    }
  }

  // If we have something that can be redrawn do it
  // We can't render until google_maps_loaded is true
  // And we need a current_location and nearby_agents
  function update_map_display(map_container) {
    console.log('update_map_display');
    if (google_maps_loaded) {
      var agents = map_container.data('nearby_agents');
      var current_location = map_container.data('current_location');

      if (agents instanceof Array && current_location) {

        // Make sure we have all the bits initalized
        ensure_google_map(map_container);
        ensure_info_window(map_container);

        render_map_markers(map_container);

        hide_secret_overlay();
      } else {
        console.log("Map Data Not Yet Ready");
      }
    } else {
      console.log("Google Maps Not Yet Ready");
    }
  }

  function send_updated_location(lat, lng) {
    var data_params = {'secret_agent': {'latitude': lat, 'longitude': lng }};

    console.log('Sending Updated Location');
    console.log(data_params);

    $.ajax({
      dataType: 'json',
      type: 'post',
      url: '/update_location',
      data: data_params,
      error: function (request, status, error) {
        console.log('Unable to update Agent Location');
      },
      success: function (data) {
        console.log('Agent Location Updated');
      }
    });
  }


  var google_maps_loaded = false;

  window.secret_agents = window.secret_agents || {};

// Expose Our Public API
  window.secret_agents.maps = {

    /*
     Reload the nearby agents via json and store them in the
     containers data('nearby_agents')

     */
    load_nearby_agents: function (map_container, lat, lng) {

      // Asynchronously Send Updated Location
      setTimeout(function () {
        send_updated_location(lat, lng);
      }, 1000);

      var data_params = {'lat': lat, 'lng': lng };
      // Set Current Location
      map_container.data('current_location', data_params);
      $.ajax({
        dataType: 'json',
        url: '/near',
        data: data_params,
        error: function (request, status, error) {
          map_container.data('nearby_agents', []);
          set_error('Unable to retrieve data from ' + url + ' : ' + request.responseJSON.message);
          update_map_display(map_container);
        },
        success: function (data) {
          map_container.data('nearby_agents', data);
          update_map_display(map_container);
        }
      });
    },

    google_maps_ready: function (map_container) {
      google_maps_loaded = true;
      update_map_display(map_container);
    }
  };

  console.log('Maps Js Loaded and Initialized');
});
