/*
 * Custom funcionality used only by the GVB infra-meldpunt.
 */
var CUSTOMISATION_GVB = {

  /*
   *
   */
  "name": "gvb",

  /*
   * Methods.
   * `_<var>` arguments are expected to be given `$<var>` angular objects.
   */

  // Check if this customisation is active according to the rootScope.
  "is_active": function(_rootScope) {
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

}
