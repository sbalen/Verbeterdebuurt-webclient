/*
 * Custom funcionality used only by the GVB infra-meldpunt.
 */
var CUSTOMISATION_GVB = {

  /*
   *
   */
  "name": "gvb",


  // Keep a reference to the map stops/routes, to update the styles.
  "lines_data": {
    "main": {"stops": undefined, "routes": undefined},
    "problem": {"stops": undefined, "routes": undefined},
    "idea": {"stops": undefined, "routes": undefined},
  },


  /*
   * Methods.
   * `_<var>` arguments are expected to be given `$<var>` angular objects.
   */

  // Check if this customisation is active according to the rootScope.
  // TODO: check active based on the variable instead of rootScope?
  "is_active": function(_rootScope) {
    if ( _rootScope === undefined ) {
      return CUSTOMISATION_SITE === this.name;
    }
    return _rootScope.customisation.name === this.name;
  },

  // Check if there is a logged in user, 
  "check_login": function(_rootScope, _cookies, _location) {
    if ( ! this.is_active(_rootScope) ) { return; }

    if ( ! _cookies.getObject('user') ) {
      if ( _location.path().substring(0,6) !== '/login' ) {
        window.location = '/login';
      }
    }
  },


  // Return style function for small map stops.
  "lines_style": function(map_name, type, line_id) {
    return function(feature) {
      var style = {};

      // If the line_id was given during function generation, hide
      // stops that do not match a line.
      style.visible = ( line_id && line_id !== '-' && feature.getProperty('lines').indexOf(line_id) < 0 ) ? false : true;

      if ( type === "stops" ) {
        style.icon = feature.getProperty('is_stoparea') ? '/img/stoparea.png' : '/img/stop.png';
        if ( map_name === "main" ) {
          style.title = feature.getProperty('gvb_id') + ' / ' + feature.getProperty('name') + ' / ' + feature.getProperty('destinations').join(', ');
        }

      } else { // type === "routes"
        style.strokeColor = feature.getProperty('is_pattern') ? '#ff0000' : '#016ab5';
        if ( map_name === "main" ) {
          style.title = feature.getProperty('route_id') + ' / ' + ' / ' + feature.getProperty('trips').join(', ');
        }
        // N.B. maybe remove the "patterns" := absolute distance lines
        // entirely from the data. Hide for now.
        if ( feature.getProperty('is_pattern') ) {
          style.visible = false;
        }
      }

      if ( map_name === "main" ) {
        style.clickable = true;
      } else { // map_name === "problem"/"idea"
        style.clickable = false;
      }

      return style;
    };
  },


  // Add stops and routes to a map.
  "add_lines_to_map": function(_rootScope, google, map, map_name) {
    if ( ! this.is_active(_rootScope) ) { return; }

    var line_id = '';
    if ( _rootScope && _rootScope.gvbLinesState) {
      line_id = _rootScope.gvbLinesState.selectedId;
    }
    var stops = new google.maps.Data();
    stops.loadGeoJson('/data/stops.geojson');
    stops.setStyle( this.lines_style(map_name, 'stops', line_id) );
    stops.setMap(map);
    var routes = new google.maps.Data();
    routes.loadGeoJson('/data/routes.geojson');
    routes.setStyle( this.lines_style(map_name, 'routes', line_id) );
    routes.setMap(map);

    this.lines_data[map_name].stops = stops;
    this.lines_data[map_name].routes = routes;

    return this.lines_data[map_name];
  },


  // Update the style of all stops/routes data layers for a given line.
  "update_lines_on_maps": function(line_id) {
    if ( this.lines_data.main.stops ) {
      this.lines_data.main.stops.setStyle(
        this.lines_style('main', 'stops', line_id)
      );
    }
    if ( this.lines_data.main.routes ) {
      this.lines_data.main.routes.setStyle(
        this.lines_style('main', 'routes', line_id)
      );
    }
    if ( this.lines_data.problem.stops ) {
      this.lines_data.problem.stops.setStyle(
        this.lines_style('problem', 'stops', line_id)
      );
    }
    if ( this.lines_data.problem.routes ) {
      this.lines_data.problem.routes.setStyle(
        this.lines_style('problem', 'routes', line_id)
      );
    }
    if ( this.lines_data.idea.stops ) {
      this.lines_data.idea.stops.setStyle(
        this.lines_style('idea', 'stops', line_id)
      );
    }
    if ( this.lines_data.idea.routes ) {
      this.lines_data.idea.routes.setStyle(
        this.lines_style('idea', 'routes', line_id)
      );
    }
  },

}
