// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function () {

  function init_maps(selector) {
    var selected = $(selector);
    if (selected.length > 0) {
      selected.each(function () {
        var map = $(this);
        console.log('Initializing : ' + map.attr('id'));
        map.gmap3({
          map: {
            options: {
              zoom: 8,
              draggable: false,
              keyboardShortcuts: false,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              mapTypeControl: false,
              navigationControl: false,
              scrollwheel: false,
              streetViewControl: false
            }
          }
        });
      });
    }
  }

  window.secret_agents = window.secret_agents || {};
  window.secret_agents.init_maps = init_maps;

  console.log('Maps Js Loaded and Intialized');
});
