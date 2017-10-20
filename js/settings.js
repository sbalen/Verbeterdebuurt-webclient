// var LOGGING = false; 
var LOGGING = true; 

var PROTOCOL = "https";
// var PROTOCOL = "http";

// var ROOT = "www.verbeterdebuurt.nl/";
var ROOT = "staging.verbeterdebuurt.nl/";

var API_VERSION = "api.php/json_1_3/";

var APIURL = PROTOCOL + "://" + ROOT + API_VERSION;

var ISSUE_TYPE_PROBLEM = "problem";
var ISSUE_TYPE_IDEA = "idea";

var RECENT_ISSUES_TO_SHOW = 3;

// Customer specific settings, hardcoded for now. These settings
// will be read throughout the application to determine custom display options.
var CUSTOMISATION_SETTINGS = {
  verbeterdebuurt: {
    organisation_id: 0, // Sent with new issues etc. as organisation_id.
    name: 'verbeterdebuurt',
    class: 'customisation verbeterdebuurt', // Added to <body>
    logo_src: '/img/Verbeterdebuurt-logo.png', // Top left main logo.
    logo_text_up: '',
    logo_text_down: '',
    campaign: { },
    signature: 'Team Verbeterdebuurt',
  },
  fietsersbond: {
    organisation_id: 1,
    name: 'fietsersbond',
    class: 'customisation fietsersbond',
    logo_src: '/img/fietsersbond-logo.png',
    logo_text_up: 'Fietsersbond',
    logo_text_down: 'Meldpunt',
    campaign: { },
    signature: 'De Fietsersbond',
  },
};
