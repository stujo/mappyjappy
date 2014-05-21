// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function () {

  // Private Functions

  function clear_map_markers(jMap) {
    var markers = jMap.data('google_markers');
    if (markers) {
      jQuery.each(markers, function () {
        this.setMap(null);
      });
      markers = null;
    }
    jMap.data('google_markers', null);
  }


  function set_current_location_marker(jMap, position) {
    var marker = jMap.data('google_current_location_marker');
    if (marker) {
      marker.setMap(null);
    }

    var google_map = jMap.data('google_map');

    var icon = "http://maps.google.com/mapfiles/ms/icons/" + 'green' + ".png";

    marker = new google.maps.Marker({
      position: position,
      map: google_map,
      animation: google.maps.Animation.DROP,
      title: 'You',
      icon: new google.maps.MarkerImage(icon)
    });
    jMap.data('google_current_location_marker', marker);
  }

  function reset_bounds_to_include_markers(jMap) {

    var google_map = jMap.data('google_map');

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

    google_map.fitBounds(bounds);
  }

  function agent_info_content(agent) {
    return '<div class="agent_info"><h1>Agent: ' + agent.codename + '</h1><p>' + agent.address + '</p>';
  }

  function set_agents_as_markers(jMap, data) {

    var markers = jMap.data('google_markers');
    if (!markers) {
      markers = [];
    }

    var google_map = jMap.data('google_map');

    // Add Marker for Each Agent
    jQuery.each(data, function () {
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
        var info_window = jMap.data('google_map_info_window');
        //info_window.setPosition(marker.position);
        info_window.setContent(agent_info_content(agent));
        info_window.open(google_map, this);
      });

      // Automatically center the map fitting all markers on the screen
      markers.push(marker);
    });

    jMap.data('google_markers', markers);
  }

  function hide_secret_overlay() {
    $('#secret_overlay').hide();
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
          draggable: false,
          keyboardShortcuts: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          navigationControl: false,
          scrollwheel: true,
          streetViewControl: false
        };

        var map = new google.maps.Map(dom_element, map_options);
        jMap.data('google_map', map);

        var info_window = new google.maps.InfoWindow();
        jMap.data('google_map_info_window', info_window);

        clear_map_markers(jMap);
        set_current_location_marker(jMap, position);
        set_agents_as_markers(jMap, agents);
        reset_bounds_to_include_markers(jMap);

        hide_secret_overlay();

        $(window).on('resize', function () {
          google.maps.event.trigger(map, 'resize');
          reset_bounds_to_include_markers(jMap);
        });

        // Install a click handler to redo the search and send a new location
        google.maps.event.addListener(map, 'click', function(event) {
          window.secret_agents.maps.load_nearby_agents(jMap, event.latLng.lat(), event.latLng.lng());
        });

      }
      else {
        console.log("Map Data Not Yet Ready");
      }
    }
    else {
      console.log("Google Maps Not Yet Ready");
    }
  }

  function render_maps(maps) {
    if (maps.length > 0) {
      maps.each(function () {
        render_map_if_ready($(this));
      });
    }
  }

  function send_updated_location(lat, lng) {
    var data_params = {'secret_agent': {'latitude': lat, 'longitude': lng }};
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
    load_nearby_agents: function (selector, lat, lng) {
      var selected = $(selector);

      setTimeout(function () {
        send_updated_location(lat, lng);
      }, 1000);

      selected.each(function () {
        var jMap = $(this);
        var data_params = {'lat': lat, 'lng': lng };
        jMap.data('current_location', data_params);
        $.ajax({
          dataType: 'json',
          url: '/near',
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

    google_maps_ready: function (maps) {
      google_maps_loaded = true;
      render_maps(maps);
    }
  };

  console.log('Maps Js Loaded and Initialized');
})
;
