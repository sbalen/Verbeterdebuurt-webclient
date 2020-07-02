// session time 7 days
const sessionTime = 168;

//var vdbApp = angular.module('vdbApp',[]);
var vdbApp = angular.module('vdbApp',
    ['ngRoute',
     'angularUtils.directives.dirPagination',
     'ngFacebook',
     'ngCookies',
     'naif.base64',
     'angulartics',
     'angulartics.google.analytics']);

// settings moved to settings.js for easier deployment without build tools

//define service
var issuesService = new Object();
var registerService = new Object();
var loginService = new Object();
var reportService = new Object();
var commentService = new Object();
var forgotService = new Object();
var myIssuesService = new Object();
var commentSubmitService = new Object();
var profileService = new Object();
var workLogService = new Object();
var categoriesService = new Object();
var issueSubmitService = new Object();
var voteSubmitService = new Object();
var syncFBService = new Object();
var loginFBService = new Object();
var statusChangeService = new Object();
var issueLogService = new Object();
var newsletterService = new Object();
var agreementSevice = new Object();
var duplicateIssuesService = new Object();
var getIssueService = new Object();
var confirmRegistrationService = new Object();
var cancelRegistrationService = new Object();
var confirmIssueService = new Object();
var remindIssueService = new Object();
var unfollowIssueService = new Object();
var serviceStandardService = new Object();
var confirmVoteService = new Object();
var departmentsService = new Object();
var departmentReportsService = new Object();
var campaignIssueSubmitService = new Object();
var campaignSubmissionsService = new Object();
var searchCreateTemp = 0;

var user = undefined;
var userProfile = undefined;
var mainControllerInitialized = false;

//polyfill for includes for internet explore not support js
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
//polyfill for endswith internet explore not support js
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
//console log() if you want to deactive it, change the parameter from true to false
var logger = LOGGING ? console.log.bind(window.console) : function(){}

//error api handler
errorhandler = function(rootScope,errorInfo){
    if (errorInfo != undefined) {
        logger('showErrorHandler -> ' + (errorInfo.message != undefined ? errorInfo.message : ""));
        logger(errorInfo);
    } else {
        logger('showErrorHandler')
    }
    // TODO FB: do not show an error when the message is empty. This
    // prevents the unnecessary error when confirming a message, and
    // the backend doesn't now what happened anyway.
    if ( false && errorInfo.message && errorInfo.message.trim() ) {
    rootScope.globaloverlay="";
    $("#errorModal").modal({backdrop: 'static', keyboard: false});
    $("#errorModal").modal('show');
    $("#errorModal").on('click','#errorModalRedirect',function(){
        $('#errorModal').modal('hide');
        $('.modal-backdrop').hide();
    });
    } else {
      logger('showErrorHandler: not shown because the message was empty.')
    }

};


// Set the current (if any) customisation.
// Run this first, to prevent unnecessary page updates.
vdbApp.run(['$location', '$rootScope', '$cookies', function($location, $rootScope, $cookies) {

  // Customisation per settings
  if ( CUSTOMISATION_SITE ) {
    $rootScope.customisation = CUSTOMISATION_SETTINGS[CUSTOMISATION_SITE];
    logger('customisation',CUSTOMISATION_SITE);

  // Customisation: Fietsersbond.
  } else if ($location.host().substring(0,12) == "fietsersbond") {
    $rootScope.customisation = CUSTOMISATION_SETTINGS.fietsersbond;
    // Redirect to the default page for the Fietsersbond, if the
    // current path is /, and if wanted. Was: to /nieuw-probleem,
    // currently: just home (so no further redirect here).
    /*
    if ($location.path() === '/') {
      $rootScope.urlBefore = "/nieuw-probleem";
      menuSelected($rootScope, 'createissue');
      $location.path('/nieuw-probleem');
    }
    */
    if ($location.path().substring(0,9) === '/campagne') {
      $rootScope.customisation.class += ' campaign';
    }
    logger('customisation','fietsersbond');

  } else if ($location.host().substring(0,3) == "gvb") {
    $rootScope.customisation = CUSTOMISATION_SETTINGS.gvb;
    logger('customisation','gvb');

  // By default, set the normal (i.e. no) customisation.
  } else {
    $rootScope.customisation = CUSTOMISATION_SETTINGS.verbeterdebuurt;
    logger('customisation','verbeterdebuurt');
  }

  CUSTOMISATION_GVB.check_login($rootScope, $cookies, $location);

  // Hide parts of the interface on GVB.
  if ( CUSTOMISATION_GVB.is_active() ) {
    $rootScope.hideReport = true;
  }  else {
    $rootScope.hideReport = false;
  }
}]);


//call google map at first
vdbApp.run(function(){
    mainControllerInitialized = false;
    googlemapinit();
})

vdbApp.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, keepstate) {
        if (keepstate) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}])


//change menu selected
function menuSelected($scope, selected) {
    $scope.homeSelected = "";
    $scope.rapportageSelected = "";
    $scope.mentionSelected = "";
    $scope.myIssuesSelected = "";

    switch (selected) {
    case 'home':
        $scope.homeSelected = "active"
        break;
    case 'rapportage':
        $scope.rapportageSelected = "active"
        break;
    case 'createissue':
        $scope.mentionSelected = "active"
        break;
    case 'myIssues':
        $scope.myIssuesSelected = "active"
        break;
    }
    hideBackgroundImage($scope, selected);
};

// When the 'selected' menu changes, check if the background should be shown.
// 'scope' parameter should typically be the $rootScope.
// TODO: is the menuSelected called often enough?
function hideBackgroundImage(scope, selected) {
  switch (selected) {
    case 'home':
      scope.backgroundImageHidden = true;
      break;
    case 'rapportage':
      scope.backgroundImageHidden = true;
      break;
    default:
      scope.backgroundImageHidden = false;
      break;
  }
}


//convert to slug
function convertToSlug(Text) {
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}



vdbApp.config(['$routeProvider', '$locationProvider', '$httpProvider', '$sceDelegateProvider', function ($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/gemeente/:cityName/', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/gemeente/:cityName/nieuwe-melding', {
            templateUrl: 'select_problem.html',
            controller: 'selectProblemCtrl'
        })
        .when('/gemeente/:cityName/nieuw-probleem', {
            templateUrl: 'create_problem.html',
            controller: 'createProblemCtrl'
        })
        .when('/gemeente/:cityName/nieuw-idee', {
            templateUrl: 'create_idea.html',
            controller: 'createIdeaCtrl'
        })
        .when('/gemeente/:cityName/:action?', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/plaats/:cityNameplaats/:nextaction?', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/postcode/:postalcode', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/postcode/:postalcode/:action?', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/melding/:id', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl'
        })
        //confirm the issue
        .when('/melding/bevestigen/hash/:hashkey', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "confirm_issue";
                    return true;
                }
            }
        })
        //delete the issue
        .when('/melding/verwijderen/:hashkey', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "delete_issue";
                    return true;
                }
            }
        })
        //resolve issue with no comment
        .when('/melding/is-opgelost/:hashkey/methode/afwijzen', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "resolve_issue_with_comment_no";
                    return true;
                }
            }
        })
        //resolve issue with comment yes
        .when('/melding/is-opgelost/:hashkey/methode/oplossen', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "resolve_issue_with_comment_yes";
                    return true;
                }
            }
        })
        //close issue
        .when('/melding/afsluiten/:hashkey', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "close_issue";
                    return true;
                }
            }
        })
        //remind issue
        .when('/melding/herinneren/:hashkey', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "remind_issue";
                    return true;
                }
            }
        })
        //unfollow issue
        .when('/melding/afmelden/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'unfollowIssueCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "unfollow_issue";
                    return true;
                }
            }
        })
        .when('/mention', {
            templateUrl: 'mention.html',
            controller: 'mentionCtrl'
        })
        .when('/mijn-meldingen', {
            templateUrl: 'my_issues.html',
            controller: 'myIssuesCtrl'
        })
        .when('/mijn-meldingen/:id', {
            templateUrl: 'my_issue_detail.html',
            controller: 'myIssuesDetailCtrl'
        })
        .when('/login', {
            templateUrl: 'login.html'
        })
        .when('/registreren', {
            templateUrl: 'register.html'
        })
        .when('/ondernemingsdossier_landingpage', {
            templateUrl: 'ondernemingsdossier.html'
        })
        .when('/bevestiging-registratie', {
            templateUrl: 'confirmation_register.html',
            controller: 'regisconfCtrl'
        })
        .when('/wachtwoord', {
            templateUrl: 'forgot_password.html',
            controller: 'forgotCtrl'
        })
        .when('/bevestiging-wachtwoord-vergeten', {
            templateUrl: 'confirmation_forgot_password.html',
            controller: 'confirmationForgotPasswordCtrl'
        })
        .when('/nieuwe-melding', {
            templateUrl: 'select_problem.html',
            controller: 'selectProblemCtrl'
        })
        .when('/nieuw-probleem', {
            templateUrl: 'create_problem.html',
            controller: 'createProblemCtrl'
        })
        // Special route for problem at a specific location.
        .when('/nieuw-probleem/:latitude/:longitude', {
            templateUrl: 'create_problem.html',
            controller: 'createProblemCtrl'
        })
        // Special route for gvb stop click.
        .when('/nieuw-probleem/gvb/:latitude/:longitude/:gvbid', {
            templateUrl: 'create_problem.html',
            controller: 'createProblemCtrl'
        })
        // Special route for gvb stop "aanpassing" click, which is almost
        // identical to a "defect" problem.
        .when('/nieuwe-aanpassing', {
            templateUrl: 'create_aanpassing.html',
            controller: 'createProblemCtrl'
        })
        .when('/nieuwe-aanpassing/gvb/:latitude/:longitude/:gvbid', {
            templateUrl: 'create_aanpassing.html',
            controller: 'createProblemCtrl'
        })
        .when('/nieuw-idee', {
            templateUrl: 'create_idea.html',
            controller: 'createIdeaCtrl'
        })
        .when('/mijn-verbeterdebuurt', {
            templateUrl: 'profile.html',
            controller: 'profileCtrl'
        })
        //success create issue
        .when('/bevestiging-nieuwe-melding', {
            templateUrl: 'confirmation_create_issue.html'
        })
        //success delete issue
        .when('/bevestiging-verwijderen', {
            templateUrl: 'confirmation_delete_issue.html'
        })
        .when('/onbekende-melding', {
            templateUrl: ' confirmation_unknown_issue.html'
        })
        //handle the hash sessions
        //confirm the vote
        .when('/stem/bevestigen/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'confirmVoteCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "confirm_vote";
                    return true;
                }
            }
        })
        //handle registration for hash session
        .when('/registratie/annuleren/hash/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'registrationHashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "cancel_register";
                    return true;
                }
            }
        })
        //cancel registration
        .when('/registratie/bevestigen/hash/:hashkey', {
            templateUrl: 'confirmation.html',
            controller: 'registrationHashCtrl',
            resolve: {
                targetAction: function ($rootScope) {
                    $rootScope.targetAction = "register";
                    return true;
                }
            }
        })
        .when('/campagne-melding/:slug/:cid', {
            // N.B. before the pretty url below, because it catches
            // this campaign id.
            templateUrl: 'campaign.html',
            controller: 'campaignCtrl'
        })
        //pretty url for issue-detail
        .when('/:location/:title/:id', {
            templateUrl: 'issue_detail.html',
            controller: 'issueCtrl'

        })
        .when('/auth/:type', {
            resolve: {
                targetAction: function ($rootScope) {
                    return true;
                }
            }
        })
        .when('/rapportage', {
            templateUrl: 'rapportage.html',
            controller: 'rapportageCtrl'
        })
        .when('/campagne', {
            templateUrl: 'campaign.html',
            controller: 'campaignCtrl'
        })
        .when('/campagne/:slug', {
            templateUrl: 'campaign.html',
            controller: 'campaignCtrl'
        })
        .when('/campagne-bedankt', {
            templateUrl: 'campaign_thanks.html',
            controller: 'campaignCtrl'
        })
        .when('/campagne-bedankt/:slug', {
            templateUrl: 'campaign_thanks.html',
            controller: 'campaignCtrl'
        })
        //redirect city / postcode
        .when('/:cityNameClone', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/:cityNameClone/:nextaction?', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })

    $locationProvider.html5Mode(true);
    $sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self'
	]);
}]);

vdbApp.directive('imgUpload', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.imgUpload);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });

        }
    };
}])

vdbApp.filter('datefilter',function(){
    return function(date){
        var newdate=[];
        newdate[0]=date[8]
        newdate[1]=date[9]
        newdate[2]=date[7]
        newdate[3]=date[5]
        newdate[4]=date[6]
        newdate[5]=date[4]
        newdate[6]=date[0]
        newdate[7]=date[1]
        newdate[8]=date[2]
        newdate[9]=date[3]
        return newdate.toString().replace( /,/g ,"");
    }
})

vdbApp.factory('issuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssues: function (jsondata) {
            logger('issuesService.getIssues('+jsondata+')');
            return $http.post(APIURL + 'issues', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        issuesService.data = data;
                        return issuesService.data;
                    }

                })
                .error(function(data, status, headers, config){
                    logger("issueService.getIssues.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    }

}]);

vdbApp.factory('campaignSubmissionsService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getCampaignSubmissions: function (jsondata) {
            logger('campaignSubmissionsService.getCampaignSubmissions('+jsondata+')');
            return $http.post(APIURL + 'getCampaignSubmissions', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        campaignSubmissionsService.data = data;
                        return campaignSubmissionsService.data;
                    }

                })
                .error(function(data, status, headers, config){
                    logger("campaignSubmissionsService.getCampaignSubmissions.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    }
}]);

vdbApp.factory('reportService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getReport: function (jsondata) {
            logger('reportService.getReport('+jsondata+')');
            return $http.post(APIURL + 'reports', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        reportService.data = data;
                        return reportService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("reportService.getReport.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });


        }
    }

}]);
vdbApp.factory('loginService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getLogin: function (jsondata) {
            logger('loginService.getLogin('+jsondata+')');

            return $http.post(APIURL + 'login', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        loginService.data = data;

                        return loginService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("loginService.getLogin.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])



vdbApp.factory('commentService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getComment: function (jsondata) {
            logger('commentService.getComment('+jsondata+')');
            return $http.post(APIURL + 'comments', jsondata).success(function (data) {
                if (angular.isObject) {
                    commentService.data = data;
                    return commentService.data;
                }
            })
                .error(function(data, status, headers, config){
                    errorhandler($rootScope)
                });
        }
    };
}])

vdbApp.factory('registerService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getRegister: function (jsondata) {
            logger('registerService.getRegister('+jsondata+')');
            return $http.post(APIURL + 'register', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        registerService.data = data;
                        return registerService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("registerService.getRegister.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('newsletterService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getNewsletter: function (jsonnewsletter) {
            logger('newsletterService.getNewsletter('+jsonnewsletter+')');
            return $http.post(APIURL + 'subscribeNewsletter', jsonnewsletter)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        newsletterService.data = data;
                        return newsletterService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("newsletterService.getNewsletter.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });

        }
    };
}])



vdbApp.factory('forgotService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getForgot: function (jsondata) {
            logger('forgotService.getForgot('+jsondata+')');
            return $http.post(APIURL + 'resetPassword', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        forgotService.data = data;
                        return forgotService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("forgotService.getForgot.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });

        }
    };
}])
vdbApp.factory('myIssuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getMyIssues: function (jsondata) {
            logger('myIssuesService.getMyIssues('+jsondata+')');
            return $http.post(APIURL + 'myIssues', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        myIssuesService.data = data;
                        return myIssuesService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("myIssuesService.getMyIssues.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('commentSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getCommentSubmit: function (jsondata) {
            logger('commentSubmitService.getCommentSubmit('+jsondata+')');
            return $http.post(APIURL + 'commentSubmit', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        commentSubmitService.data = data;
                        return commentSubmitService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("commentSubmitService.getCommentSubmit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])


vdbApp.factory('profileService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getProfile: function (jsondata) {
            logger('profileService.getProfile('+jsondata+')');
            return $http.post(APIURL + 'editSettings', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        profileService.data = data;
                        return profileService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("profileService.getProfile.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('syncFBService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getFBSync: function (jsondata) {
            logger('syncFBService.getFBSync('+jsondata+')');
            return $http.post(APIURL + 'connectFacebook', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        syncFBService.data = data;
                        return syncFBService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("syncFBService.getFBSync.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('loginFBService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getFBLogin: function (jsondata) {
            logger('loginFBService.getFBLogin('+jsondata+')');
            return $http.post(APIURL + 'connectFacebook', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        loginFBService.data = data;
                        return loginFBService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("loginFBService.getFBLogin.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])





vdbApp.factory('workLogService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getWorkLog: function (jsondata) {
            logger('workLogService.getWorkLog('+jsondata+')');
            return $http.post(APIURL + 'worklogs', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        workLogService.data = data;
                        return workLogService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("workLogService.getWorkLog.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('categoriesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getCategories: function (jsondata) {
            logger('categoriesService.getCategories('+jsondata+')');
            return $http.post(APIURL + 'categories', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        categoriesService.data = data;
                        return categoriesService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("categoriesService.getCategories.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    };
}])
vdbApp.factory('issueSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata) {
            logger('issueSubmitService.getIssueSubmit('+jsondata+')');
            return $http.post(APIURL + 'issueSubmit', jsondata)
                .success(function (data) {
                    issueSubmitService.data = data;
                    return issueSubmitService.data;
                })
                .error(function(data, status, headers, config){
                    logger("issueSubmitService.getIssueSubmit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('issueSubmitServiceWithImage', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata, img, img2, img3, img4, img5) {
            logger('issueSubmitServiceWithImage.getIssueSubmit('+jsondata+')');
            var dataForm = new FormData();
            dataForm.append('json', jsondata);
            dataForm.append('image', img);
            // For GVB
            if ( img2 ) {
              dataForm.append('image2', img2);
            }
            if ( img3 ) {
              dataForm.append('image3', img3);
            }
            if ( img4 ) {
              dataForm.append('image4', img4);
            }
            if ( img5 ) {
              dataForm.append('image5', img5);
            }
            return $http.post(APIURL + 'issueSubmit', dataForm, {
                    transformRequest: angular.identity,
                    headers : { 'Content-Type' : undefined }
                })
                .success(function (data, headers) {
                    logger(data);
                    logger(headers);
                })
                .error(function(data, status, headers, config){
                    logger("issueSubmitServiceWithImage.getIssueSubmit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    }
}]);
vdbApp.factory('campaignIssueSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata) {
            logger('campaignIssueSubmitService.getIssueSubmit('+jsondata+')');
            return $http.post(APIURL + 'campaignSubmission', jsondata)
                .success(function (data) {
                    campaignIssueSubmitService.data = data;
                    return campaignIssueSubmitService.data;
                })
                .error(function(data, status, headers, config){
                    logger("campaignIssueSubmitService.getIssueSubmit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('campaignIssueSubmitServiceWithImage', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueSubmit: function (jsondata, img) {
            logger('campaignIssueSubmitServiceWithImage.getIssueSubmit('+jsondata+')');
            var dataForm = new FormData();
            dataForm.append('json', jsondata);
            dataForm.append('image', img);
            return $http.post(APIURL + 'campaignSubmission', dataForm, {
                    transformRequest: angular.identity,
                    headers : { 'Content-Type' : undefined }
                })
                .success(function (data, headers) {
                    logger(data);
                    logger(headers);
                })
                .error(function(data, status, headers, config){
                    logger("campaignIssueSubmitServiceWithImage.getIssueSubmit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    }
}]);

vdbApp.factory('voteSubmitService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getvoteSummit: function (jsondata) {
            logger('voteSubmitService.getvoteSummit('+jsondata+')');
            return $http.post(APIURL + 'voteSubmit', jsondata)
                .success(function (data) {
                    voteSubmitService.data = data;
                    return voteSubmitService.data;
                })
                .error(function(data, status, headers, config){
                    logger("voteSubmitService.getvoteSummit.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    };
}])

vdbApp.factory('statusChangeService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getStatusChange: function (jsondata) {
            logger('statusChangeService.getStatusChange('+jsondata+')');
            return $http.post(APIURL + 'statusChange', jsondata)
                .success(function (data) {
                    statusChangeService.data = data;
                    return statusChangeService.data;
                })
                .error(function(data, status, headers, config){
                    logger("statusChangeService.getStatusChange.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('issueLogService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssueLog: function (jsondata) {
            logger('issueLogService.getIssueLog('+jsondata+')');
            return $http.post(APIURL + 'issueLog', jsondata)
                .success(function (data) {
                    issueLogService.data = data;
                    return issueLogService.data;
                })
                .error(function(data, status, headers, config){
                    logger("issueLogService.getIssueLog.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('agreementSevice', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getAgreement: function (jsondata) {
            logger('agreementSevice.getAgreement('+jsondata+')');
            return $http.post(APIURL + 'agreement', jsondata)
                .success(function (data) {
                    agreementSevice.data = data;
                    return agreementSevice.data;
                })
                .error(function(data, status, headers, config){
                    logger("agreementSevice.getAgreement.error:")
                    logger(headers);
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('duplicateIssuesService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getDuplicateIssue: function (jsondata) {
            logger('duplicateIssuesService.getDuplicateIssue('+jsondata+')');
            return $http.post(APIURL + 'duplicateIssues', jsondata)
                .success(function (data) {
                    duplicateIssuesService.data = data;
                    return duplicateIssuesService.data;
                })
                .error(function(data, status, headers, config){
                    logger("duplicateIssuesService.getDuplicateIssue.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('getIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getIssue: function (jsondata) {
            logger('getIssueService.getIssue('+jsondata+')');
            return $http.post(APIURL + 'issueForHash', jsondata)
                .success(function (data) {
                    getIssueService.data = data;
                    return getIssueService.data;
                })
                .error(function(data, status, headers, config){
                    logger("getIssueService.getIssue.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('confirmRegistrationService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirm: function (jsondata) {
            logger('confirmRegistrationService.getConfirm('+jsondata+')');
            return $http.post(APIURL + 'confirmRegistration', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        confirmRegistrationService.data = data;
                        return confirmRegistrationService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("confirmRegistrationService.getConfirm.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });

        }
    };
}])

vdbApp.factory('cancelRegistrationService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirm: function (jsondata) {
            logger('cancelRegistrationService.getConfirm('+jsondata+')');
            return $http.post(APIURL + 'cancelRegistration', jsondata)
                .success(function (data) {
                    if (angular.isObject(data)) {
                        cancelRegistrationService.data = data;
                        return cancelRegistrationService.data;
                    }
                })
                .error(function(data, status, headers, config){
                    logger("cancelRegistrationService.getConfirm.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('confirmIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getConfirmIssue: function (jsondata) {
            logger('confirmIssueService.getConfirmIssue('+jsondata+')');
            return $http.post(APIURL + 'confirmIssue', jsondata)
                .success(function (data) {
                    confirmIssueService.data = data;
                    return confirmIssueService.data;
                })
                .error(function(data, status, headers, config){
                    logger("confirmIssueService.getConfirmIssue.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    };
}])


vdbApp.factory('remindIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getRemindIssue: function (jsondata) {
            logger('remindIssueService.getRemindIssue('+jsondata+')');
            return $http.post(APIURL + 'emailLink', jsondata)
                .success(function (data) {
                    remindIssueService.data = data;
                    return remindIssueService.data;
                })
                .error(function(data, status, headers, config){
                    logger("remindIssueService.getRemindIssue.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('serviceStandardService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getServiceStandard: function (jsondata) {
            logger('serviceStandardService.getServiceStandard('+jsondata+')');
            return $http.post(APIURL + 'serviceStandard', jsondata)
                .success(function (data) {
                    serviceStandardService.data = data;
                    return serviceStandardService.data;
                })
                .error(function(data, status, headers, config){
                    logger("serviceStandardService.getServiceStandard.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }
    };
}])

vdbApp.factory('unfollowIssueService', ['$http','$rootScope', function ($http,$rootScope) {
    return {
        getUnfollowIssue: function (jsondata) {
            logger('unfollowIssueService.getUnfollowIssue('+jsondata+')');
            return $http.post(APIURL + 'unfollowIssue', jsondata)
                .success(function (data) {
                    unfollowIssueService.data = data;
                    return unfollowIssueService.data;
                })
                .error(function(data, status, headers, config){
                    logger("unfollowIssueService.getUnfollowIssue.error:")
                    errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
                });
        }

    };
}])

vdbApp.factory('confirmVoteService', ["$http",'$rootScope',function ($http,$rootScope) {
    return {
        getConfirmVote: function (jsondata){
            logger('confirmVoteService.getConfirmVote('+jsondata+')');
            return $http.post(APIURL+ 'confirmVote',jsondata)
            .success(function (data){
                confirmVoteService.data = data;
                return confirmVoteService.data;
            })
            .error(function(data, status, headers, config){
                logger("confirmVoteService.getConfirmVote.error:")
                errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
            });
        }

    };
}])


vdbApp.factory('departmentsService', ['$http','$rootScope','$q', function ($http,$rootScope,$q) {
  var departmentsCache = {};
  return {
    getDepartments: function (jsondata) {
      logger('departmentsService.getDepartments('+jsondata+')');
      // Return cached data if available.
      if ( departmentsCache[jsondata] ) {
        var deferred = $q.defer();
        var cachedData = { // mimick http response
          success: true, status: 200,
          data: departmentsCache[jsondata],
        };
        deferred.resolve(cachedData);
        return deferred.promise;
      }
      return $http.post(APIURL + 'departments', jsondata)
        .success(function (data) {
          if (angular.isObject(data)) {
            // Store retrieved departments for future calls, e.g. on every
            // map move.
            departmentsCache[jsondata] = data;
            departmentsService.data = data;
            return departmentsService.data;
          }
        })
        .error(function(data, status, headers, config){
          logger("departmentsService.getDepartments.error:")
          errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
        });
    }
  }
}]);


vdbApp.factory('departmentReportsService', ['$http','$rootScope', function ($http,$rootScope) {
  return {
    getDepartmentReports: function (jsondata) {
      logger('departmentReportsService.getDepartmentReports('+jsondata+')');
      return $http.post(APIURL + 'departmentReports', jsondata)
        .success(function (data) {
          if (angular.isObject(data)) {
            departmentReportsService.data = data;
            return departmentReportsService.data;
          }
        })
        .error(function(data, status, headers, config){
          logger("departmentReportsService.getDepartmentReports.error:")
          errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
        });
    }
  }
}]);


vdbApp.run(['$rootScope', '$window', function ($rootScope, $window) {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    $rootScope.$on('fb.load', function () {
        $window.dispatchEvent(new Event('fb.load'));
    });

    }]);

vdbApp.controller('mainCtrl', ['$scope', '$q','$timeout', '$window', '$location', '$rootScope', '$routeParams', '$http', 'issuesService', 'reportService', '$facebook', '$cacheFactory', '$location', 'agreementSevice', '$cookies','myIssuesService', 'departmentsService', 'departmentReportsService', function ($scope, $q,$timeout, $window, $location, $rootScope, $routeParams, $http, issuesService, reportService, $facebook, $cacheFactory, $location, agreementSevice, $cookies, myIssuesService, departmentsService, departmentReportsService) {


    var mainController = this;

    //very hacky, should be removed when making the google maps a service with the proper dependencies
    user = $cookies.getObject('user');
    userProfile = $cookies.getObject('user_profile');

    function setup_departments() {
      // Track the active department, use by the Fietsersbond.
      $scope.departmentState = {
        // Only active on fietsersbond.
        show: $rootScope.customisation.organisation_id === 1,
        selectedId: 0, // Value model for the select
        preClickId: 0, // Value set by council-based update
        selectedName: '',
        list: [],
        dict: {},
      }

      // Load departments, if relevant, and create a dict for easy lookup.
      if ( $scope.departmentState.show ) {
        var getDepartments = departmentsService.getDepartments('{}').then(function (data) {
          $scope.departmentState.list = data.data.departments;
          for(var i=0; i<$scope.departmentState.list.length; i++) {
            $scope.departmentState.dict[$scope.departmentState.list[i].id] = $scope.departmentState.list[i];
          }
          // TODO: - where is this city set as an actual object?
          //       - why is this function called three times, once with proper
          //       city?
          //       - keep a fetched copy of the departments in the service
          if ( city.long_name ) {
            $scope.updateDepartmentForCouncil(city);
          }
        });
      }
    }

    function setup_gvb_lines() {
      // Initialize only once.
      if ( $rootScope.gvbLinesState ) { return; }
      // Track the selected line
      $rootScope.gvbLinesState = {
        // Only active on fietsersbond.
        show: $rootScope.customisation.organisation_id === 2,
        selectedId: '-', // Value model for the select
        preClickId: '-', // Value set by council-based update
        list: ['-','1','2','3','4','5','7','11','12','13','14','15','17','18','19','21','22','24','26','34','35','36','37','38','40','41','44','47','48','49','50','51','52','53','54','61','62','63','65','66','68','69','231','245','246','247','248','267','N81','N82','N83','N84','N85','N87','N88','N89','N91','N93','461','463','464','465','900','901','902','903','905','906','907','909','910','911','912','913','914','915'],
        dict: {},
      }
    }

    function setup_gvb_listeners() {
      if ( ! CUSTOMISATION_GVB.is_active() ) { return; }
      if ( true ) {
        gvb_set_data_stops_listener(function(event) {
	  $rootScope.clickedGvbObject = event.feature.l;
          CUSTOMISATION_GVB.create_stop_info_window(event, map);
          /* TODO: the info windows contains links, do these always work
           * properly with the rootScope set above?
          var id = event.feature.getProperty('gvb_id');
          var pos = event.feature.getGeometry().get();
          var url = '/nieuw-probleem/gvb/'+pos.lat()+'/'+pos.lng()+'/'+id;
          $location.path(url);
          // TODO: find out why rootscope apply is necessary here.
          $rootScope.$apply();
          */
        });
        gvb_set_data_routes_listener(function(event) {
          console.log(event.feature);
          $rootScope.clickedGvbObject = event.feature.l;
          CUSTOMISATION_GVB.create_route_info_window(event, map);
          /* TODO: the info windows contains links, do these always work
          /*var id = event.feature.getProperty('route_id');
          var pos = event.latLng;
          var url = '/nieuw-probleem/gvb/'+pos.lat()+'/'+pos.lng()+'/'+id;
          $location.path(url);
          // TODO: find out why rootscope apply is necessary here.
          $rootScope.$apply();*/
        });
      }
    }

    mainController.init = function() {
        logger("mainController.init");

        //some vars that are needed?
        $rootScope.dynamicTitle = "";
        $scope.showuserpanel();
        $rootScope.urlBefore = $location.path();
        $rootScope.errorSession = "";

        menuSelected($rootScope, 'home');
        //if really the first time loading, listen to the map being done loading, find start location, and remove listener.
        if (!mainControllerInitialized) {
            var listenerForMapReady = google.maps.event.addListener(map,'idle',function() {
                //determine where the map should start
                mainController.determineStartLocation(mainController.startLocationDetermined);
                listenerForMapReady.remove();
            });

            mainControllerInitialized = true;
        }

        $timeout(function () {
            var listener = attachAutoCompleteListener('searchCity');
            var input = $('#searchCity');
            $('#clickSearch').mousedown(function() {input.focus();});
            $('#clickSearch').mouseup(function() {
                logger("clickSearch" +  input.val());
                moveMapToAddress(input.val());
            });
        },10);

        if ($location.path().includes('melding') && !$cookies.getObject('user')) {
            $window.sessionStorage.issueurl = $location.path();
        }

        // Set Fietsersbond departments
        setup_departments();
        // Set GVB lines
        // TODO: move definitions to CUSTOMISATION_GVB.
        setup_gvb_lines();
        setup_gvb_listeners();
    }

    mainController.rewritePathForCouncil = function() {
        logger("rewritePathForCouncil()");
        var newCouncil = "";
        var newPath = "";

        /* deeplinks with only cityname or cityname with an action or or /plaats/  need to all be rewritten to /gemeente */
        var nextaction = !(typeof $routeParams.nextaction === 'undefined') ? "/" + $routeParams.nextaction : "";


        if ($location.path() == "/plaats/" + $routeParams.cityNameplaats + nextaction) {
            newPath = 'gemeente/' + $routeParams.cityNameplaats + nextaction
            newCouncil = $routeParams.cityNameplaats;
        } else if ($location.path() == "/" + $routeParams.cityNameClone + nextaction) {
            $location.path('gemeente/' + $routeParams.cityNameClone + nextaction);
            newCouncil = $routeParams.cityNameClone;
        }

        $scope.council = newCouncil;
        $location.path(newPath);
    }

    mainController.determineStartLocation = function(doneCallBack) {
        logger("determineStartLocation ->");
        logger($routeParams);

        var result = true;

        if ($routeParams.id) {
            //should not be handled by maincontroller
            logger("location based on id should not be handled by main ctrl, but by issueCtrl")
            result = false;
        } else if ($routeParams.hashkey) {
            //should not be handled by maincontroller
            logger("location based on haskey should not be handled by main ctrl, but by hashCtrl")
            result = false;
        // Lat/lng given with nieuw-probleem in the url.
        } else if ($routeParams.latitude && $routeParams.longitude) {
            moveMapToLocation({
              lat: parseFloat($routeParams.latitude),
              lng: parseFloat($routeParams.longitude)
            });
        } else if ($routeParams.cityName) {
            moveMapToAddress($routeParams.cityName,true,doneCallBack);
        } else if ($routeParams.postalcode) {
            moveMapToAddress($routeParams.postalcode,true,doneCallBack);
        } else if (navigator.geolocation) {
            //pass on the responsibility of calling back to moveMapToBrowserLocation (boogiewoogie?)
            moveMapToBrowserLocation($rootScope,$q,true,doneCallBack);
        } else if ($cookies.getObject('user') != null) {
            moveMapToUserLocation(true,doneCallBack);
        } else {
            moveMapToDefaultLocation(doneCallBack);
            //could be that the map was already initialized on this.
        }

        if (!result) {
            if (doneCallBack != undefined && typeof doneCallBack === 'function') {
                doneCallBack(result);
            }
        }
    }

    mainController.startLocationDetermined = function(result) {
        logger('startLocationDetermined('+result+')')
        if (result) {
            $scope.updateAllInfo(true);
            $scope.updateMyIssues();
        }
        addMapChangedListener($scope.updateAllInfo,$location);
    }

    // If the manual department selection is clicked, and a different
    // department is selected, then update the current council as defined in
    // the department list, to reload the mainController with the new geo.
    $scope.departmentSelectionClick = function () {
      logger('departmentSelectionClick old new', $scope.departmentState.preClickId, $scope.departmentState.selectedId);
      if ( $scope.departmentState.selectedId &&
           $scope.departmentState.selectedId !== $scope.departmentState.preClickId ) {
        var new_department = $scope.departmentState.dict[$scope.departmentState.selectedId];
        logger('departmentSelectionClick move to', new_department);
        if ( new_department && new_department.council ) {
          // Let googlemaps determine the actual geography for the council
          // name; do not fallback to user location; after move, set the
          // backend defined zoomlevel.
          moveMapToAddress(new_department.council, false, function() {
            map.setZoom(new_department.zoom);
          });
        }
      }
    }

    $scope.gvbLinesSelectionClick = function () {
      logger('gvbLinesSelectionClick old new', $rootScope.gvbLinesState.preClickId, $rootScope.gvbLinesState.selectedId);
      if ( $rootScope.gvbLinesState.selectedId &&
           $rootScope.gvbLinesState.selectedId !== $rootScope.gvbLinesState.preClickId ) {
        var new_gvbLines = $rootScope.gvbLinesState.selectedId;
        $rootScope.gvbLinesState.preClickId = $rootScope.gvbLinesState.selectedId;
        logger('gvbLinesSelectionClick show', new_gvbLines);
        if ( new_gvbLines ) {

          CUSTOMISATION_GVB.update_lines_on_maps(new_gvbLines);
        }
      }
    }

    $scope.updatePathForCouncil = function(city) {
        logger("updatePathForCouncil(" + city + ") -> " + $location.path() + " ::: " + $routeParams.nextaction);

        var currentPath = $location.path();

        var newPath = "";
        if (currentPath.includes('gemeente') ||
            currentPath.includes('postcode') ||
            currentPath == '/' ) {
            newPath = '/gemeente/' + convertToSlug(city);
            if (currentPath.endsWith('nieuw-probleem')) newPath += "/nieuw-probleem";
            if (currentPath.endsWith('nieuw-idee')) newPath += "/nieuw-idee";
            if (currentPath.endsWith('nieuwe-melding')) newPath += "/nieuwe-melding";
        }

        if (newPath != "" && currentPath.toLowerCase() != newPath.toLowerCase()) {
            $location.path('/gemeente/' + convertToSlug(city), true);
        }
    }

    $scope.updateSearchBoxForCouncil = function(city) {
        logger("updateSearchBoxForCouncil(" + city + ")");
        logger($scope.searchCity);
        $scope.searchCity = city;
    }

    $scope.updateMyIssues = function() {
        logger("updateMyIssues mainCtrl -->" + $cookies.getObject('user'));
        if ($cookies.getObject('user')) {
            var jsondata = {}
            jsondata.user = $cookies.getObject('user');
            jsondata = JSON.stringify(jsondata);
            logger(jsondata);
            myIssuesService.getMyIssues(jsondata).then(function (data) {
                logger("myissues", data.data);
                $rootScope.myIssueCount = data.data.count;
                $rootScope.myIssuesList = data.data.issues;
            })
        }

    }

    mainController.recentIssuesOfType = function(type, count) {
        if (!$scope.zoomedInEnoughToRetrieveIssues() || $rootScope.newProblemList == undefined || $rootScope.newProblemList.length <= 0) return [];
        if (count == undefined) count = RECENT_ISSUES_TO_SHOW;
        var curIssue;
        var result = [];
        var foundIssues = 0;
        //orderBy : 'created_at' : true

        for (var i=0; i < $rootScope.newProblemList.length; i++) {
            curIssue = $rootScope.newProblemList[i];
            if(curIssue.type == type && curIssue.status != 'closed') {
                result.push(curIssue);
                if (++foundIssues >= count) { break; }
            }
        }

        return result;
    }

    $scope.recentProblems = function() {
        return mainController.recentIssuesOfType(ISSUE_TYPE_PROBLEM);
    }

    $scope.recentIdeas = function() {
        return mainController.recentIssuesOfType(ISSUE_TYPE_IDEA);
    }

    $scope.showAgreement = function () {
        if (!$rootScope.agreement) return false;
        return $rootScope.agreement.success && $rootScope.agreement.agreement && $scope.zoomedInEnoughToShowIssues();
    }

    $scope.zoomedInEnoughToShowIssues = function() {
        // Never show zoom-in-messages on GVB.
        if ( CUSTOMISATION_GVB.is_active() ) { return true; }
        return $rootScope.zoom >= $rootScope.pinsVisibleZoom;
    }

    $scope.zoomedInEnoughToRetrieveIssues = function() {
        return $rootScope.zoom >= $rootScope.retrieveIssuesZoom;
    }
    // N.B. The updateMapIssues is called many times on many occasions.
    // It serves more or less as the go to place to fill the left-column
    // issue list.
    $scope.updateMapIssues = function() {
        logger("updateMapIssues");
        // If this is a campaign page, ignore update by map triggers.
        // Instead, get the issues after retrieving the campaing data.
        if ( $rootScope.is_campaign ) {
          logger("updateMapIssues", 'ignore because is_campaign');
          return;
        }

        checkZoomLevel($rootScope);

        if ($scope.zoomedInEnoughToRetrieveIssues()) {
            var data_request = {
                "coords_criterium": {
                    "max_lat": map.getBounds().getNorthEast().lat(),
                    "min_lat": map.getBounds().getSouthWest().lat(),
                    "max_long": map.getBounds().getNorthEast().lng(),
                    "min_long": map.getBounds().getSouthWest().lng()
                }
            };
            // If the page loaded is from fietsersbond, only
            // get those items. If on verbeterdebuurt, show all issues.
            if ( $rootScope.customisation.organisation_id === 1 ) {
              data_request.organisation_id = 1;
            }

            logger('issues data request', data_request);
            var jsondata = JSON.stringify(data_request);
            var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                var getdata = data.data;
                logger('issues data result', getdata);

                $rootScope.newProblemList = getdata.issues;
                //sort the issues descending for created date
                if ($rootScope.newProblemList != undefined && $rootScope.newProblemList.length > 1) {
                   $rootScope.newProblemList.sort(function(a, b){return b.created_at.localeCompare( a.created_at ) });
                }
                if (getdata.count != 0 || !getdata) {
                    $window.issuesData = getdata;
                    showIssuesOnMap();
                }
            });
        } else {
            $window.issuesData = null;
            showIssuesOnMap();
        }
    }
    $scope.updateCouncilReport = function(city)  {
        logger("updateCouncilReport");
        report_query = {"council": "" + city + ""};
        // Request specific organisation report.
        if ( $rootScope.customisation.organisation_id > 0 ) {
          report_query.organisation_id = $rootScope.customisation.organisation_id;
        }
        logger("updateCouncilReport query", report_query);
        reportService.getReport(JSON.stringify(report_query)).then(function (data) {
            $rootScope.reportList = data.data.report;
        });
    }

    $scope.updateCouncilAgreement = function(city) {
        logger("updateCouncilAgreement");
        agreementSevice.getAgreement(JSON.stringify({"council": "" + city + ""})).then(function (data) {
            $rootScope.agreement = data.data;
            $timeout(function () { $rootScope.hideLogo = !data.data.logo; });
        });
    }

    //click function at map
    $scope.alrCity = function () {
        logger("mainCtrl.alrCity() -> getreport / getagreement / getIssues if city.long_name");
        $scope.updateAllInfo();
    }


    $scope.updateAllInfo = function(forceUpdate) {
        logger("updateAllInfo("+forceUpdate+") --> ");

        //if force, just reload all, regardless of the city name
        if(forceUpdate && city.long_name != null) {
            $scope.updatePathForCouncil(city.long_name);
            $scope.updateSearchBoxForCouncil(city.long_name);
            $scope.updateCouncilReport(city.long_name);
            $scope.updateCouncilAgreement(city.long_name);
        } else { // otherwise, get the cityname and check it it has changed, only then reload info
            var currentCity = city.long_name;
            determineCityForGeocode(function() {
                if (currentCity == undefined || city.long_name != currentCity.long_name) {
                    $scope.updatePathForCouncil(city.long_name);
                    $scope.updateSearchBoxForCouncil(city.long_name);
                    $scope.updateCouncilReport(city.long_name);
                    $scope.updateCouncilAgreement(city.long_name);
                }
            });
        }

        // $scope.updateMyIssues();
        $scope.updateMapIssues();
    }

    $scope.updateDepartmentForCouncil = function(city) {
      if ( $scope.departmentState.show ) {
        var query = { "council": city.long_name };
        query = JSON.stringify(query);
        departmentsService.getDepartments(query).then(function (data) {
          if ( data.data.success && data.data.counts > 0 ) {
            var new_department = data.data.departments[0];
            $scope.departmentState.selectedId = new_department.id;
            $scope.departmentState.preClickId = new_department.id;
            $scope.departmentState.selectedName = new_department.name;
          }
        });
      }
    }

    $scope.isUserLoggedIn = function() {
        return ($cookies.getObject('user') != undefined);
    }


    $scope.updateLoginStatus = function() {
        //isn't this double, zee below?
        $scope.hideLogin = $cookies.getObject('user')
    }


    //login session
    $scope.loginStatus = function () {
        return $scope.isUserLoggedIn() && ($rootScope.lusername = $cookies.getObject('user').username);
    }

    //logOut
    $scope.logout = function () {
        logger("mainCtrl.logout()");

        $cookies.remove('user');
        $cookies.remove('user_profile');
        // $('.dropdown-menu').hide();
        $scope.userpanel = 0;
        $rootScope.myIssuesList = null;

        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $facebook.logout();
        }

        $location.path('/');
    }

    $scope.showuserpanel = function () {
        $scope.userpanel = 1;
    }

    //move page
    $scope.clickMenu = function (selected) {
        logger("mainCtrl.clickMenu()");

        if (selected == "myissues" || selected == "createissue") {
            if (!$cookies.getObject('user')) {
                if (selected == 'myissues') {
                    $rootScope.urlBefore = "/mijn-meldingen";
                    menuSelected($rootScope, 'myIssues');
                    $location.path('/' + "login");
                }
                if (selected == 'createissue') {
                    $rootScope.urlBefore = "/nieuwe-melding";
                    menuSelected($rootScope, 'createissue');
                    $location.path('/nieuwe-melding');
                }
            } else {
                if (selected == "createissue") {
                    $location.path('/nieuwe-melding');
                } else if (selected == "myissues") {
                    $location.path('/mijn-meldingen');
                } else {
                    $location.path('/' + selected);
                }
            }
        } else {
            $location.path('/' + selected);
        }
    }

    $scope.noProtocol = function(url) {
        return url.replace('http:','').replace('https:','');
    }

    mainController.init();
}]);

vdbApp.controller('issueCtrl', ['$scope', '$rootScope', '$window', '$routeParams', 'issuesService', 'reportService', '$location', '$anchorScroll', 'issueLogService', 'commentService', '$timeout', 'voteSubmitService', '$cookies', 'confirmIssueService', 'remindIssueService', 'unfollowIssueService','myIssuesService', 'statusChangeService','getIssueService',function ($scope, $rootScope, $window, $routeParams, issuesService, reportService, $location, $anchorScroll, issueLogService, commentService, $timeout, voteSubmitService, $cookies, confirmIssueService, remindIssueService, unfollowIssueService,myIssuesService,statusChangeService,getIssueService) {
    logger("issueCtrl");

    var issueController = this;
    var lat;
    var lng;

    issueController.init = function() {
        $rootScope.globaloverlay = "active";
        $scope.hide = "ng-hide";
        $scope.overlay = "overlay";
        $scope.hideStatus = "ng-hide";
        $scope.errorVote = "";
        $scope.hideError = 1;
        $scope.highlightid = $routeParams.id;
        $rootScope.dynamicTitle = "Melding |";
        $scope.hideSelection = true;
        $scope.changeid = $routeParams.id;
        $scope.showSocial = ! CUSTOMISATION_GVB.is_active();

        $scope.keepTrackOfURL();

        //what for again?
        issueController.checkAndShowConfirmation();

        if ($routeParams.hashkey) {

            issueController.getIssueForHash($routeParams.hashkey,function(issueId) {
                if (issueId) {
                    issueController.handleIssueActions($rootScope.targetAction,issueId,$routeParams.hashkey, function() {
                        $scope.showIssueDetail(issueId, function(issue) {
                            $location.path('/melding/'+convertToSlug(issue.title)+'/'+issue.id,true);
                        });
                    });
                } else {
                    $rootScope.globaloverlay = "";
                    $location.path('/onbekende-melding');
                }
            });
        } else {
            $scope.showIssueDetail($routeParams.id);
        }
    }

    issueController.getIssueForHash = function(hashkey,callBackWithIssueId) {

        var jsonhash = JSON.stringify({
            "authorisation_hash": "" + hashkey + ""
        });

        getIssueService.getIssue(jsonhash).then(function (data) {
            logger("foundIssueForHash ->" + data.data.issue_id);
            if (data.data.success) {
                if (callBackWithIssueId != undefined && typeof callBackWithIssueId === "function") {
                    callBackWithIssueId(data.data.issue_id);
                }
            } else {
                callBackWithIssueId();
            }
        });
    }


    issueController.checkAndShowConfirmation = function() {
        logger("checkAndShowConfirmation");
        if ($rootScope.successCreateLogin == 1) {
            $rootScope.successCreateLogin = 0;
            $scope.showConfirmationMessage("Je melding is verstuurd!",$rootScope.standardTemp);
        }
        if ($rootScope.successCreateNonLogin == 1 ) {
            $rootScope.successCreateNonLogin = 0;
            $scope.showConfirmationMessage("Bevestiging probleem bij uw e-mail");
        }
        if($rootScope.successVote == 1){
            $rootScope.successVote = 0;
            $scope.showConfirmationMessage($rootScope.voteMessage);
        }
        //still needed?
        $rootScope.standardTemp = null;

    }

    $scope.showConfirmationMessage = function(message,tempMessage) {
        logger("showConfirmationMessage("+message+")")
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = message;
        $scope.successMessage = tempMessage;
    }

    $scope.keepTrackOfURL = function() {
        if ($rootScope.lastUrl == null) {
            $rootScope.lastUrl == '/';
        }
        $rootScope.urlBefore = $location.path();
    }

    $scope.showIssueDetail = function (issueId,callBackWithIssue) {

        var jsondata = JSON.stringify({
            "issue_id": issueId
        });
        issuesService.getIssues(jsondata).then(function (data) {
            logger("issueCtrl getIssuesResult ")

            $scope.hide = "";
            $rootScope.globaloverlay = "";
            var issues = undefined;
            var currentIssue = undefined;
            if (data.data.count >= 1) {

                issues = data.data.issues;
                currentIssue = data.data.issues[0];
                $rootScope.problemIdList = issues;
                $rootScope.dynamicTitle = ''+currentIssue.title+' |';

                $scope.sateliteimg = $scope.getSateliteImage(currentIssue.location);

                issueController.hideLogStatus();
                issueController.updateComments();
                moveMapToIssue(currentIssue);

            } else {
                $location.path('/onbekende-melding');
            }

            if (callBackWithIssue != undefined && typeof callBackWithIssue === "function" ) {
                callBackWithIssue(currentIssue);
            }

        });
    }


    issueController.handleIssueActions = function(action,issueId,hashkey,callBack) {

        logger("handleIssueActions("+action+","+issueId+","+hashkey+")");

         //close issue with hashcode

        $rootScope.hashToDelete = hashkey;
        //this is where delete issue with hash was

        $rootScope.getStatusId = issueId;
        $rootScope.hashSession = hashkey;

        switch (action) {
            case "close_issue" :
                $('#CloseModal').modal('show');
                break;
            case "delete_issue":
                $('#DeleteModal').modal('show');
                break;
            case "resolve_issue_with_comment_no":
                $('#ResolveModalSimple').modal('show');
                break;
            case "resolve_issue_with_comment_yes":
                $('#ResolveModal').modal('show');
                break;
            case "confirm_issue":
                $scope.confirmIssue(hashkey,callBack);
                break;
            case "remind_issue":
                $scope.remindIssue(hashkey,callBack);
                break;
        }
        if (callBack != null && typeof callBack === "function") {
            callBack();
        }
    }

    $scope.remindIssue = function(authorisation_hash,callBack) {
        logger("remindIssue("+authorisation_hash+")")
        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "link" : ROOT + "melding/herinneren/" + authorisation_hash
        });
        var getRemindIssue = remindIssueService.getRemindIssue(jsondata).then(function (data) {
            var getRemindIssue = data.data;
            $scope.hideError = 0;
            $rootScope.globaloverlay = "";
            if (!getRemindIssue.success) {
                $scope.errorConfirmed = getRemindIssue.error;
            } else if (callBack != null && typeof callBack === "function") {
                $scope.successClass = "successAlert";
                $scope.successMessageNonApi = "De gemeente is herinnerd aan de melding.";
                callBack();
            }

        });
    }

    $scope.confirmIssue = function(authorisation_hash,callBack) {
        logger("confirmIssue("+authorisation_hash+")")

        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "authorisation_hash" : authorisation_hash
        });
        var getConfirmIssue = confirmIssueService.getConfirmIssue(jsondata).then(function (data) {
            var getConfirmIssue = data.data;
            $scope.hideError = 0;

            $rootScope.globaloverlay = "";
            if (!getConfirmIssue.success) {
                $scope.errorConfirmed = getConfirmIssue.error;
            } else if (callBack != null && typeof callBack === "function") {
                $scope.successClass = "successAlert";
                $scope.successMessageNonApi = "De melding is bevestigd.";
                callBack();
            }

        });
    }

    $scope.deleteIssueWithHash = function () {
        logger("issueCtrl.deleteIssueWithHash() --> " + $rootScope.hashToDelete);
        $rootScope.globaloverlay = "active";


        var jsondata = {};
        jsondata.user = {};
        jsondata.user.authorisation_hash = $rootScope.hashToDelete;
        jsondata.status = "deleted";
        jsondata.issue_id = $rootScope.getStatusId;

        jsondata = JSON.stringify(jsondata);


        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
            var getStatusChange = data.data;

            //validate error or not
            if (getStatusChange.success) {
                $('#DeleteModal').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.globaloverlay = "";
                $scope.error = "";
                $scope.hideError = "ng-hide";
                $location.path("/bevestiging-verwijderen");

                $scope.updateMyIssues();

            } else {
                $scope.errorVote = getStatusChange.error;
                $scope.hideError = "";
                $rootScope.globaloverlay = "";
            }
        });
    }

    $scope.getSateliteImage = function(location) {
        return "//maps.googleapis.com/maps/api/staticmap?center="+location.latitude+","+location.longitude+"&zoom=18&size=515x300&maptype=hybrid&format=jpg&key=AIzaSyCk3yxCifnV67hIJ2iyRupfH2iHvshna3I&markers=color:red%7C"+location.latitude+","+location.longitude+"&sensor=false";
    }

    $scope.id = function () {
        return $routeParams.id;
    }

    //validity must login when comment
    $scope.sessionValid = function () {
        if (!$cookies.getObject('user')) {
            $location.path("/login");
            $scope.stemModal = "";
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
        } else {
            $scope.stemModal = "#StemModal";
        }
    }

    //selectionvote
    $scope.voteSelect = function(){
        if ($scope.hideSelection) {
            $scope.hideSelection = false;
        } else {
            $scope.hideSelection = true;
        }

    }

    //validation for submit vote
    $scope.voteSubmit = function () {
        logger("issueController.voteSubmit()");

        if (!$cookies.getObject('user')) {
             $('#voteModal').modal('show');
        } else {
            $rootScope.globaloverlay = "active";

            var jsonVoteSubmit = JSON.stringify({
                "user": {
                    "username": "" + $cookies.getObject('user').username + "",
                    "password_hash": "" + $cookies.getObject('user').password_hash + ""
                },
                "issue_id": $routeParams.id
            });
            voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
                // TODO FB: Voting for an idea the first time returns an
                // empty array (an object with success: true/false is expected).
                // The second time, an error message is shown (correctly) that
                // a vote was already cast. (This is not presented in the idea
                // description, and thus does not show in the stats below.)
                logger('vote result', data);
                var getvoteSummit = data.data;
                if (!getvoteSummit.success) {
                    $scope.hideError = 0;
                    $scope.errorVote = "" + getvoteSummit.error + "";
                    $(window).scrollTop(0);
                } else {
                    var jsondata = JSON.stringify({
                        "issue_id": $routeParams.id
                    });
                    var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.problemIdList = getdata.issues;
                    });

                }

                $rootScope.globaloverlay = "";
            });
        }
    }

    $scope.selfVote = function(){
        $rootScope.globaloverlay = "active";
        var jsonVoteSubmit = JSON.stringify({
                "user": {
                    "username": "" + $cookies.getObject('user').username + "",
                    "password_hash": "" + $cookies.getObject('user').password_hash + ""
                },
                "issue_id": $routeParams.id
            });
            var getvoteSummit = voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
                var getvoteSummit = data.data;
                if (!getvoteSummit.success) {
                    $scope.hideError = 0;
                    $scope.errorVote = "" + getvoteSummit.error + "";
                    $(window).scrollTop(0);
                } else {
                    var jsondata = JSON.stringify({
                        "issue_id": $routeParams.id
                    });
                    var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.problemIdList = getdata.issues;
                    });

                }
                //vote reload

                $rootScope.globaloverlay = "";
                $scope.hideSelection = true;
            });
    }
    $scope.otherVote = function(){
            $('#voteModal').modal('show');
            $scope.hideSelection = true;
    }

    //close the detail;
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }

    //facebook & twitter share
    $scope.sharefacebook = function () {
        var text = encodeURI($location.absUrl());
        var url = "//www.facebook.com/sharer/sharer.php?u=" + text;
        var win = window.open(url, '_blank');
        win.focus();

    }

    $scope.sharetwitter = function () {
        var text = encodeURI($location.absUrl());
        var url = "https://twitter.com/intent/tweet?text=" + text;
        var win = window.open(url, '_blank');
        win.focus();

    }

    //googlemap
    $scope.googleMapIssue = function (lat, lng, type) {
            googleMapIssue(lat, lng, type);
    }

    issueController.hideLogStatus = function() {
        var parameters = {issue_id:$routeParams.id}
        //hide log Status
        if ($cookies.getObject('user')) {
            parameters.user = {
                username:$cookies.getObject('user').username,
                password_hash:$cookies.getObject('user').password_hash
            }
        }
        var logjsondata = JSON.stringify(parameters);

        var getIssueLog = issueLogService.getIssueLog(logjsondata).then(function (data) {
            var getdata = data.data;
            var success = data.data.success;
            var counts = data.data.counts;

            $scope.hideLogStatus = success || counts == 0 ? "ng-hide" : "";

            if (success || counts == 0) {
                $scope.hideLogStatus = "ng-hide";
            } else {
                $scope.hideLogStatus = "";
                $scope.showDataText = "Meer >>";
                $scope.issueLogList = getdata.logs;
            }
        });
    }

    //to hide and show log status
    $scope.logStatus = function () {
        if ($scope.hideStatus == "ng-hide") {
            $scope.hideStatus = "";
            $scope.showDataText = "Minder <<";
        } else {
            $scope.hideStatus = "ng-hide";
             $scope.showDataText = "Meer >>";
        }
    }


    issueController.updateComments = function() {
        logger('updatecomments() ->' + $routeParams.id);
        if ($routeParams.id == undefined) return;
        var commentjsondata = JSON.stringify({
            "issue_id": "" + $routeParams.id + ""
        });

        var getComment = commentService.getComment(commentjsondata).then(function (data) {
            var getComment = data.data;
            $rootScope.commentList = getComment.comments;
        });

    }

    //close error
    $scope.closeError = function () {
        $scope.hideError = 1;
        $scope.errorVote = "";
    }

    issueController.init();
}]);

vdbApp.controller('mentionCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
    menuSelected($rootScope, 'mention');
    if ($window.sessionStorage.username == null) {
        $rootScope.urlBefore = $location.path();
        $location.path('/login');
    }
}])

vdbApp.controller('myIssuesCtrl', ['$scope', '$rootScope', '$window', '$location', 'myIssuesService', '$cookies', function ($scope, $rootScope, $window, $location, myIssuesService, $cookies) {


    var myIssuesController = this;


    myIssuesController.init = function() {


        $rootScope.dynamicTitle = "Mijn meldingen |";
        $scope.hide = "";
        menuSelected($rootScope, 'myIssues');

        $rootScope.currentPage = 1;
        $scope.totalPage = 3;
        if ($cookies.getObject('user') == null) {
            $rootScope.urlBefore = $location.path();
            $location.path('/login');
        }

        $scope.updateMyIssues();

    }
    $scope.myIssueDetailClick = function (id) {
        $location.path("/mijn-meldingen/" + id);
    }

    $scope.getIdStatus = function (id) {
        $rootScope.getStatusId = id;
    }

    myIssuesController.init();

}]);

vdbApp.controller('myIssuesDetailCtrl', ['$scope', '$routeParams', '$http', '$rootScope', '$location', '$window', 'myIssuesService', 'issueLogService', 'commentService', 'voteSubmitService', '$cookies','$timeout', function ($scope, $routeParams, $http, $rootScope, $location, $window, myIssuesService, issueLogService, commentService, voteSubmitService, $cookies,$timeout) {
    $rootScope.dynamicTitle = "Mijn meldingen |";
    $scope.hide = "";
    $scope.hideStatus = "ng-hide";
    $scope.errorVote = "";
    $scope.hideError = 1;
    $scope.successClass = "";
    menuSelected($rootScope, 'myIssues');
    $rootScope.globaloverlay = "active";
    $scope.hideSelection = true;
    $scope.showSocial = ! CUSTOMISATION_GVB.is_active();
    $scope.id = function () {
        return $routeParams.id;
    }
    if ($cookies.getObject('user') == null) {
        $rootScope.urlBefore = $location.path();
        $location.path('/login');
    }
    if ($rootScope.standardTemp) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessage = $rootScope.standardTemp;
    }

    if ($rootScope.successCreateNonLogin == 1 ) {
        $scope.hideError = 0;
        $scope.successClass = "successAlert";
        $scope.successMessageNonApi = "Bevestiging probleem bij uw e-mail";
    }

    //what is happening here? getting all issues for a user, if found yours, set the sateliteimg??????
    var jsondata = JSON.stringify({
        "user": {
            "username": "" + $cookies.getObject('user').username + "",
            "password_hash": "" + $cookies.getObject('user').password_hash + ""
        }
    });

    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
        var getdata = data.data;
        $rootScope.count = getdata.count;
        $rootScope.myIssuesList = getdata.issues;
        $rootScope.globaloverlay = "";
        for(var i = 0 ; i < getdata.count ; i++){
            if(getdata.issues[i].id == $routeParams.id){
                $timeout(function(){
                    mainLat = getdata.issues[i].location.latitude;
                    mainLng = getdata.issues[i].location.longitude;
                    map.setCenter({ lat: mainLat, lng: mainLng});
                },1000);

                var lat = getdata.issues[i].location.latitude;
                var lng = getdata.issues[i].location.longitude;
                $scope.sateliteimg = "//maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&zoom=18&size=515x300&maptype=hybrid&format=jpg&key=AIzaSyCk3yxCifnV67hIJ2iyRupfH2iHvshna3I&markers=color:red%7C"+lat+","+lng+"&sensor=false";
                break;
            }
        }
    })
    $scope.id = function () {
        return $routeParams.id;
    }

    //call googlemap
    $scope.googleMapIssue = function (lat, lng, type) {
        googleMapIssue(lat, lng, type);
    }

    //hidelog
    if ($cookies.getObject('user')) {
        var logjsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""
            },
            "issue_id": "" + $routeParams.id + ""
        });
        var getIssueLog = issueLogService.getIssueLog(logjsondata).then(function (data) {
            var getdata = data.data;
            if (!getdata.success) {
                $scope.hideLogStatus = "ng-hide";
            } else if (getdata.success && getdata.count == 0) {
                $scope.hideLogStatus = "ng-hide";
            } else {
                $scope.hideLogStatus = "";
                $scope.showDataText = "Meer >>";
                $scope.issueLogList = getdata.logs;
            }
        });
    } else {
        $scope.hideLogStatus = "ng-hide";
    }

    //to hide and show log
    //to hide and show log status
    $scope.logStatus = function () {
        if ($scope.hideStatus == "ng-hide") {
            $scope.hideStatus = "";
            $scope.showDataText = "Minder <<";
        } else {
            $scope.hideStatus = "ng-hide";
            $scope.showDataText = "Meer >>";
        }
    }
    //comment
    //validity must login when comment
    $scope.sessionValid = function () {
        if (!$cookies.getObject('user')) {
            $location.path("/login");
            $scope.stemModal = "";
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
        } else {
            $scope.stemModal = "#StemModal";
        }
    };

    //voteSubmit
    $scope.voteSubmit = function () {

        if (!$cookies.getObject('user')) {
            $location.path("/login");
            $rootScope.errorSession = "Voor deze actie moet je ingelogd zijn."
        } else {
            $rootScope.globaloverlay = "active";
            var jsonVoteSubmit = JSON.stringify({
                "user": {
                    "username": "" + $cookies.getObject('user').username + "",
                    "password_hash": "" + $cookies.getObject('user').password_hash + ""
                },
                "issue_id": $routeParams.id
            });
            var getvoteSummit = voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
                var getvoteSummit = data.data;
                if (!getvoteSummit.success) {
                    $scope.hideError = 0;
                    $scope.errorVote = "" + getvoteSummit.error + "";
                } else {
                var jsondata = JSON.stringify({
                    "user": {
                    "username": "" + $cookies.getObject('user').username + "",
                    "password_hash": "" + $cookies.getObject('user').password_hash + ""
                    },
                    "issue_id": $routeParams.id
                });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        $rootScope.myIssuesList = getdata.issues;
                    });

                }
                //vote reload

                $rootScope.globaloverlay = "";
            });
        }
    }

    $scope.selfVote = function(){
        $rootScope.globaloverlay = "active";
        var jsonVoteSubmit = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""
            },
            "issue_id": $routeParams.id
        });
        var getvoteSummit = voteSubmitService.getvoteSummit(jsonVoteSubmit).then(function (data) {
            var getvoteSummit = data.data;
            if (!getvoteSummit.success) {
                $scope.hideError = 0;
                $scope.errorVote = "" + getvoteSummit.error + "";
                $(window).scrollTop(0);
            } else {
                var jsondata = JSON.stringify({
                    "issue_id": $routeParams.id
                });
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });

            }
            //vote reload

            $rootScope.globaloverlay = "";
            $scope.hideSelection = true;
        });
    }
    $scope.otherVote = function(){
            $('#voteModal').modal('show');
            $scope.hideSelection = true;
    }
    //show comment
    var commentjsondata = JSON.stringify({
        "issue_id": "" + $routeParams.id + ""
    });
    var getComment = commentService.getComment(commentjsondata).then(function (data) {
        var getComment = data.data;
        $rootScope.commentList = getComment.comments;
    });
    //close error
    $scope.closeError = function () {
        $scope.hideError = 1;
        $scope.errorVote = "";
    }
    //delete success Create
    $rootScope.standardTemp = null;
    $rootScope.successCreateLogin = 0;
    $rootScope.successCreateNonLogin = 0;
    $rootScope.successVote = 0;

    //show my issue
    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""

            }
        });
        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
            var getdata = data.data;
            var count = getdata.count;
            $rootScope.myIssueCount = count;
            $rootScope.myIssuesList = getdata.issues;
        })
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }

}])

vdbApp.controller('loginCtrl', ['$scope', '$rootScope', '$window', 'loginService', '$location', '$facebook', '$cookies', '$http', function ($scope, $rootScope, $window, loginService, $location, $facebook, $cookies, $http) {
    $rootScope.dynamicTitle = "Login |";
    $scope.hide = "ng-hide";
    $scope.lusername = "";
    $scope.lpassword = "";

    //$scope.overlay ACTIVE WHENclick and overlay when no event
    $scope.overlay = "overlay";

    if ($window.sessionStorage.issueurl) {
        $rootScope.urlBefore = $window.sessionStorage.issueurl;
        $window.sessionStorage.removeItem('issueurl');
    }

    if ($rootScope.urlBefore == null || $rootScope.urlBefore == '/login') {
        $rootScope.urlBefore = '/';
    }

    if ($cookies.getObject('user') != null) {
        $location.path('/');
    }

    //error session
    if ($rootScope.errorSession) {
        $scope.hide = "";
    }
    //remember me
    if ($cookies.get('username') && $cookies.get('password')) {
        $scope.rememberMe = true;
        $scope.lusername = $cookies.get('username');
        $scope.lpassword = $cookies.get('password');
    }
    //facebook login
    //this is the function to do the login or do redirect to registration
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {

            $facebook.api('/me?fields=first_name,last_name,email').then(function (user) {

                $rootScope.globaloverlay = "active";
                $scope.facebookuser = user;


                //here we create the json to login
                var facebookID = $scope.facebookuser.id;
                var jsondata = JSON.stringify({ "user": { "facebookID" : facebookID } });

                logger($scope.facebookuser);

                //logger(jsondata);

                var getLogin = loginService.getLogin(jsondata).then(function (data) {

                    var result = data.data;
                    logger(result);
                    if (!result.success) {
                        //fix this if false
                        $location.path('/registreren');
                        //in here we already had our facebook session!
                        $window.sessionStorage.facebookID = $scope.facebookuser.id;
                        $window.sessionStorage.name = $scope.facebookuser.first_name;
                        $window.sessionStorage.email = $scope.facebookuser.email;
                        $window.sessionStorage.surname = $scope.facebookuser.last_name;
                        $rootScope.globaloverlay = "";

                    } else if (result.success) {
                        //we got user data here, please log me in!
                        $cookies.putObject('user', result.user);
                        $cookies.putObject('user_profile', result.user_profile);

                        $rootScope.loginStatus = function () {
                            return true;
                        }
                        $rootScope.globaloverlay = "";
                        $rootScope.errorSession = "";
                        if ($rootScope.urlBefore == '/registreren' || $rootScope.urlBefore == '/bevestiging-registratie') {
                            $location.path('/map');
                        } else {
                            $location.path($rootScope.urlBefore);
                        }
                    }
                    $rootScope.globaloverlay = "";
                });
            });
        }
    });

    $scope.FBlogin = function () {
      if ( $rootScope.customisation.name === 'gvb' ) { return; }
        $facebook.login();
    }

    $scope.FietsersbondLogin = function () {
      if ( $rootScope.customisation.name === 'gvb' ) { return; }
      logger('login with fietsersbond oauth');
      hello.init({
        fietsersbond: {
          id: OAUTH_ID_FIETSERSBOND,
          name: 'fietsersbond',
          oauth : {
            version : 2,
            auth : 'https://www.fietsersbond.nl/oauth/authorize',
          },
          response_type: 'token',
          // Direct oauth...me does not work because of CORS.
          base : 'https://www.fietsersbond.nl/oauth/',
          get : {
            "me": "me/"
          },
        }
      }, { redirect_uri: '/oauth.html' });

      // Login through Fietsersbond oauth popup, then get the /me.ID through
      // the backend and use it to log in.
      hello('fietsersbond').login().then(function(auth){
        var query_me = { access_token: auth.authResponse.access_token };
        $http
          .post(APIURL + 'fietsersbondOauthMe', query_me)
          .success(function (datame) {
            var jsondata = JSON.stringify({ "user" : { "fietsersbond_token" : datame.ID } });

            var getLogin = loginService.getLogin(jsondata).then(function (data) {
              // Received a login response. If successful, set login cookies
              // and continue. If not successful, redirect to the register page
              // with some prefilled fields. N.B. The logic is copied from
              // previous oauth setups for facebook/organisationId.
              var result = data.data;
              logger(result);

              if (!result.success) {
                $window.sessionStorage.fbOauthID = datame.ID;
                $window.sessionStorage.username = datame.user_login;;
                $window.sessionStorage.email = datame.user_email;
                $window.sessionStorage.surname = datame.display_name;
                $rootScope.globaloverlay = "";
                $scope.hide = "";
                $location.path('/registreren');

              } else if (result.success) {
                // N.B. mostly copied from ondernemingsDossier.
                var getLogin = result;
                var expired = new Date();
                expired.setHours(expired.getHours() + sessionTime);
                logger(expired);
                $cookies.putObject('user', getLogin.user, {
                    expires: expired
                });
                $cookies.putObject('user_profile', getLogin.user_profile, {
                    expires: expired
                });
                logger($cookies.getObject('user'));
                //remember me
                if ($scope.rememberMe === true) {
                    var expired = new Date();
                    expired.setDate(expired.getDate() + 7);
                    logger(expired);
                    $cookies.put('username', $scope.lusername, {
                        expires: expired
                    });
                    $cookies.put('password', $scope.lpassword, {
                        expires: expired
                    });
                    $cookies.putObject('user', getLogin.user, {
                        expires: expired
                    });
                    $cookies.putObject('user_profile', getLogin.user_profile, {
                        expires: expired
                    });
                } else {
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                $rootScope.loginStatus = function () {
                    return true;
                }
                $rootScope.globaloverlay = "";
                $rootScope.errorSession = "";
                $location.path('/');
                }
                $rootScope.globaloverlay = "";
              });
            });
        },
        // Some error, e.g. popup closed.
        function(e) {
          logger('hellojs login error', e);
        }
      );
    }

    $scope.loginWithOndernemingsDossier = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "ondernemingsdossierURL": "" + $location.url() + ""
        });
        logger("jsondata:" + jsondata);
        var getLogin = loginService.getLogin(jsondata).then(function (data) {
            var getLogin = data.data;

            if (!getLogin.success && getLogin.ondernemingsDossier != undefined) {
                //go to register with data prefilled
                //fix this if false
                $scope.errorMessage = getLogin.error;
                //in here we already had our facebook session!
                $scope.hide = "";
                $rootScope.globaloverlay = "";
                $location.path('/registreren');
                $window.sessionStorage.ondernemingsdossierID = getLogin.ondernemingsDossier.ondernemingsdossierID;
                $window.sessionStorage.name = getLogin.ondernemingsDossier.naam;
                $window.sessionStorage.email = getLogin.ondernemingsDossier.email;
                $window.sessionStorage.postcode = getLogin.ondernemingsDossier.postcode;
                $window.sessionStorage.address_number = getLogin.ondernemingsDossier.huisnummer;
                $rootScope.errorSession = getLogin.error;
            } else if (!getLogin.success) {
                $scope.errorMessage = getLogin.error;
                $scope.hide = "";
                $rootScope.globaloverlay = "";
            } else if (getLogin.success) {
                //this is the same code as login succes, better to separate?
                //temp for data session
                var expired = new Date();
                expired.setHours(expired.getHours() + sessionTime);
                logger(expired);
                $cookies.putObject('user', getLogin.user, {
                    expires: expired
                });
                $cookies.putObject('user_profile', getLogin.user_profile, {
                    expires: expired
                });
                logger($cookies.getObject('user'));
                //remember me
                if ($scope.rememberMe === true) {
                    var expired = new Date();
                    expired.setDate(expired.getDate() + 7);
                    logger(expired);
                    $cookies.put('username', $scope.lusername, {
                        expires: expired
                    });
                    $cookies.put('password', $scope.lpassword, {
                        expires: expired
                    });
                    $cookies.putObject('user', getLogin.user, {
                        expires: expired
                    });
                    $cookies.putObject('user_profile', getLogin.user_profile, {
                        expires: expired
                    });
                } else {
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                $rootScope.loginStatus = function () {
                    return true;
                }
                $rootScope.globaloverlay = "";
                $rootScope.errorSession = "";
                var postcode = $location.search().postcode;
                logger(postcode);
                if (postcode != undefined) {
                    $location.search({});
                    $location.path('/postcode/' + (postcode.replace(/ /g, "").toUpperCase()));
                } else {
                    $location.path('/');
                }

            }
        })

    }

    $scope.login = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $scope.lusername + "",
                "password": "" + $scope.lpassword + ""
            }
        });
        var getLogin = loginService.getLogin(jsondata).then(function (data) {
            var getLogin = data.data;
            if (!getLogin.success) {
                $scope.errorMessage = getLogin.error;
                $scope.hide = "";
                $rootScope.globaloverlay = "";
            } else if (getLogin.success) {
                //temp for data session
                var expired = new Date();
                expired.setHours(expired.getHours() + sessionTime);
                $cookies.putObject('user', getLogin.user, {
                    expires: expired
                });
                $cookies.putObject('user_profile', getLogin.user_profile, {
                    expires: expired
                });
                //remember me
                if ($scope.rememberMe === true) {
                    var expired = new Date();
                    expired.setDate(expired.getDate() + 7);
                    $cookies.put('username', $scope.lusername, {
                        expires: expired
                    });
                    $cookies.put('password', $scope.lpassword, {
                        expires: expired
                    });
                    $cookies.putObject('user', getLogin.user, {
                        expires: expired
                    });
                    $cookies.putObject('user_profile', getLogin.user_profile, {
                        expires: expired
                    });
                } else {
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                $rootScope.loginStatus = function () {
                    return true;
                }
                $rootScope.globaloverlay = "";
                $rootScope.errorSession = "";
                if ($rootScope.urlBefore == '/registreren') {
                    $location.path('/map');
                } else {
                    $location.path($rootScope.urlBefore);
                }

            }
        })

    }
    $scope.close = function () {
            $scope.hide = "ng-hide";
            $rootScope.errorSession = "";
        }
        //move to register page
    $scope.register = function () {
        $location.path('/registreren');
    }

    $scope.forgotpass = function () {
        $location.path('/wachtwoord');

    }

    //check for ondernemingsDossier
    if ($rootScope.urlBefore == '/ondernemingsdossier_landingpage') {
        $scope.loginWithOndernemingsDossier();
    }

}])


vdbApp.controller('registerCtrl', ['$scope', '$rootScope', '$window', 'registerService', 'newsletterService', '$location', '$facebook', '$http', function ($scope, $rootScope, $window, registerService, newsletterService, $location, $facebook, $http) {
    $rootScope.dynamicTitle = "Registreren";
    $scope.home = function () {
        $location.path('/');
    }

    $scope.hide = "ng-hide";
    //$scope.overlay="overlay";
    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.errorFB = "";
    $scope.facebookID = "";
    $scope.fbOauthID = "";
    $scope.sexoption = [
        {
            'name': 'Dhr.',
            'value': 'm'
        },
        {
            'name': 'Mw.',
            'value': 'f'
        }
    ];


    //if facebook session is present from previous login with facebook
    $scope.fbstatus = $facebook.isConnected();
    if ($scope.fbstatus) {

        if ($window.sessionStorage.name) $scope.username = $window.sessionStorage.name;
        if ($window.sessionStorage.email) $scope.email = $window.sessionStorage.email;
        if ($window.sessionStorage.surname) $scope.surname = $window.sessionStorage.surname;
        $scope.facebookID = $window.sessionStorage.facebookID;

    }

    if ($window.sessionStorage.ondernemingsdossierID != undefined) {
        logger($window.sessionStorage.name);
        if ($window.sessionStorage.name) $scope.username = $window.sessionStorage.name.replace(/\+/g, "").replace(/-/g, "").replace(/_/g, "").replace(/\//g, "").replace(/ /g, "").toLowerCase();
        if ($window.sessionStorage.email) $scope.email = $window.sessionStorage.email;
        if ($window.sessionStorage.postcode) $scope.postcode = $window.sessionStorage.postcode;
        if ($window.sessionStorage.address_number) $scope.address_number = $window.sessionStorage.address_number;
        $scope.ondernemingsdossierID = $window.sessionStorage.ondernemingsdossierID;

    }

    // Load Fietsersbond oauth data, set during /login connect call for a
    // non-existing user (username).
    if ($window.sessionStorage.fbOauthID != undefined) {
      if ($window.sessionStorage.username) {
        $scope.username = $window.sessionStorage.username;
      }
      if ($window.sessionStorage.email) {
        $scope.email = $window.sessionStorage.email;
      }
      if ($window.sessionStorage.surname) {
        $scope.surname = $window.sessionStorage.surname;
      }
      $scope.fbOauthID = $window.sessionStorage.fbOauthID;
      $scope.fbOauthStatus = 1;
    }

    //set default message for facebook button
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = ($scope.fbstatus) ? 1 : 0;
    if ($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";


    //this is the function to get the facebook ID for new user
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $facebook.api('/me?fields=first_name,last_name,email').then(function (user) {
                $scope.facebookuser = user;
                $scope.errorFB = "";

                //set button to connected
                $scope.facebookMessages = "Gekoppeld met Facebook";
                $scope.facebookExist = 1;
                $scope.facebookID = $scope.facebookuser.id;

                //set value of the field if still blank
                if ($scope.email == "") $scope.email = $scope.facebookuser.email;
                if ($scope.initials == "") $scope.initials = $scope.facebookuser.first_name;
                if ($scope.surname == "") $scope.surname = $scope.facebookuser.last_name;


            });
        }
    });

    $scope.connectFacebook = function () {
        $facebook.login();
    }

    $scope.fbOauthMessages = "Koppel Fietsersbond";
    $scope.fbOauthExist = ($scope.fbOauthStatus) ? 1 : 0;
    // If already coupled with Fietsersbond when reaching the register
    // page (i.e. fbOauthExist === 1, e.g. when trying to login with
    // Fietsersbond without a Vdb account), authResponse.access_token
    // is not available.
    if ($scope.fbOauthExist) {
      $scope.fbOauthMessages = "Gekoppeld met Fietsersbond";
      var _access_token = Array.apply(0, Array(32)).map(function() { return (function(charset){ return charset.charAt(Math.floor(Math.random() * charset.length)) }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')); }).join('');
      $scope.password = _access_token;
      $scope.password2 = _access_token;
    }

    $scope.connectFietsersbond = function () {
      // See: http://adodson.com/hello.js/modules#hellojs-already-has-you-connected
      // See: http://adodson.com/hello.js/#hellologin
      hello.init({
        fietsersbond: {
          id: OAUTH_ID_FIETSERSBOND,
          name: 'fietsersbond',
          oauth : {
            version : 2,
            auth : 'https://www.fietsersbond.nl/oauth/authorize',
          },
          response_type: 'token',
          // Direct oauth...me does not work because of CORS.
          base : 'https://www.fietsersbond.nl/oauth/',
          get : {
            "me": "me/"
          },
        }
      }, { redirect_uri: '/oauth.html' });

      // Alternative to login().then, subscribe to listeners.
      //hello.on('auth.login', function(auth) {
      //  console.log('hello','on.auth.login',auth);
      //});

      hello('fietsersbond').login().then(
        // Successful login, request /me and fill the form.
        function(auth){
          logger('hellojs success',auth);
          // Now, request info about the user and put it in the form.
          // N.B. the hellojs me function doest not work with the
          // verbeterdebuurt backend; probably expects application/json.
          //hello('fietsersbond').api('me').then(function(r){
          var query_me = {
            access_token: auth.authResponse.access_token,
          };
          $http
            .post(APIURL + 'fietsersbondOauthMe', query_me)
            .success(function (data) {
              console.log('hellojs me', data);

              $scope.fbOauthUser = data;
              $scope.errorFbOauth = "";

              //set button to connected
              $scope.fbOauthMessages = "Gekoppeld met Fietsersbond";
              $scope.fbOauthExist = 1;
              $scope.fbOauthID = $scope.fbOauthUser.ID;

              //set value of the field if still blank
              if ($scope.email == "") $scope.email = $scope.fbOauthUser.user_email;
              if ($scope.username == "") $scope.username = $scope.fbOauthUser.user_login;
              if ($scope.surname == "") $scope.surname = $scope.fbOauthUser.display_name;

              // Hide the password field (show as login only with the
              // Fietsersbond) and fill with a random string that we happen
              // to have on hand.
              // Password could be left empty in the future if the backend
              // allows it.
              $scope.password = auth.authResponse.access_token;
              $scope.password2 = auth.authResponse.access_token;
            });
        },
        // Some error, e.g. popup closed.
        function(e) {
          logger('hellojs error', e);
        }
      );
    }



    $scope.sex = $scope.sexoption[0].value;

    if ($rootScope.errorSession) {
        $scope.errorNewUsername = $rootScope.errorSession;
        $scope.hide = "";
    }



    $scope.register = function () {

        if ($scope.ondernemingsdossierID == null) {
            var ondernemingsdossierID = "";
        }

        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $scope.username + "",
                "password": "" + $scope.password + "",
                "email": "" + $scope.email + ""
            },

            "user_profile": {
                "initials": "" + $scope.initials + "",
                "tussenvoegsel": "" + $scope.tussenvoegsel + "",
                "surname": "" + $scope.surname + "",
                "sex": "" + $scope.sex + "",
                "address": "" + $scope.address + "",
                "address_number": "" + $scope.address_number + "",
                "address_suffix": "" + $scope.address_suffix + "",
                "postcode": "" + $scope.postcode + "",
                "city": "" + $scope.city + "",
                "phone": "" + $scope.phone + "",
                "facebookID": "" + $scope.facebookID + "",
                "fietsersbondID": "" + $scope.fbOauthID + "",
                "ondernemingsdossierID": "" + ondernemingsdossierID,
                "organisation_id": $rootScope.customisation.organisation_id,
            }
        });

        $rootScope.tempemail = $scope.email;

        var getRegister = registerService.getRegister(jsondata).then(function (data) {
            var getRegister = data.data;
            $scope.errorPassword = ""

            if ($scope.password != $scope.password2) {
                $scope.errorPassword = "Wachtwoord komt niet niet overeen"
                $scope.hide = "";
            }

            if (!getRegister.success) {

                $scope.errorEmail = getRegister.errors.email;
                $scope.errorNewPassword = getRegister.errors.password;
                $scope.errorPassword1 = getRegister.errors.password_repeat;
                $scope.errorNewUsername = getRegister.errors.username;
                $scope.errorSurname = getRegister.errors.surname;
                $scope.errorAddress = getRegister.errors.address;
                $scope.errorAddressN = getRegister.errors.address_number;
                $scope.errorPost = getRegister.errors.postcode;
                $scope.errorCity = getRegister.errors.city;
                $scope.errorMiddle = getRegister.errors.tussenvoegsel;
                $scope.errorPost = getRegister.errors.postcode;
                $scope.errorInitials = getRegister.errors.initials;

                $scope.hide = "";
                $rootScope.globaloverlay = "";
                $(window).scrollTop(0);
            }

            if (getRegister.success) {
                $location.path('/bevestiging-registratie');
                $rootScope.globaloverlay = "";

                if ($scope.newsletter == true) {

                    var jsonnewsletter = JSON.stringify({
                        "user": {
                            "username": "" + $scope.username + "",
                            "password": "" + $scope.password + ""
                        },
                        "user_profile": {
                            "organisation_id": $rootScope.customisation.organisation_id,
                        }
                    })

                    var getNewsletter = newsletterService.getNewsletter(jsonnewsletter).then(function (data) {
                        var getNewsletter = data.data;
                    })
                }

            }
        })
    }
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
}])


vdbApp.controller('regisconfCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
    $scope.home = function () {
        $location.path('/');
    }
}]);

vdbApp.controller('commentSubmitCtrl', ['$scope', '$route', '$rootScope', '$window', '$routeParams', '$location', 'commentSubmitService', 'commentService', 'issuesService', 'myIssuesService', '$cookies', function ($scope, $route, $rootScope, $window, $routeParams, $location, commentSubmitService, commentService, issuesService, myIssuesService, $cookies) {
    //comment Service :v
    $scope.hide = "ng-hide";
    $scope.commentSubmit = function (issueType) {
        // validation for issue type
        if (issueType == "problem") {
            $scope.tempIssueType = "problem";
        } else {
            $scope.tempIssueType = "reaction";
        }
        $rootScope.globaloverlay = "active";

        var user = {};
        user.username = $cookies.getObject('user').username;
        user.password_hash = $cookies.getObject('user').password_hash;
        var issue_id = $routeParams.id;
        var type = $scope.tempIssueType;
        if (!$scope.comment) {
            var body = "";
        } else {
            var body = $scope.comment;
        }
        var jsondata = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash
            },
            "issue_id" : issue_id,
            "type" : type,
            "body" : body
        });
        var getCommentSubmit = commentSubmitService.getCommentSubmit(jsondata).then(function (data) {
            var getCommentSubmit = data.data;
            if (!getCommentSubmit.success) {
                $rootScope.globaloverlay = "";
                $scope.hide = "";
                $scope.errorBody = "" + getCommentSubmit.error + ""
            } else {
                $rootScope.globaloverlay = "";
                //bad practice hide modal
                $('#StemModal').modal('hide');
                $('.modal-backdrop').hide();
                $scope.comment = "";
                $scope.hide = "ng-hide";
                //refresh comment list
                var commentjsondata = JSON.stringify({
                    "issue_id": "" + $routeParams.id + ""
                });
                var getComment = commentService.getComment(commentjsondata).then(function (data) {
                    var getComment = data.data;
                    $rootScope.commentList = getComment.comments;
                });
                var jsondata = JSON.stringify({
                    "issue_id": $routeParams.id
                });
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
                var jsondatamyIssue = JSON.stringify({
                    "user": {
                        "username": "" + $cookies.getObject('user').username + "",
                        "password_hash": "" + $cookies.getObject('user').password_hash + ""
                    }
                });
                var getMyIssues = myIssuesService.getMyIssues(jsondatamyIssue).then(function (data) {
                    var getdata = data.data;
                    $rootScope.myIssuesList = getdata.issues;
                })
            }
            //comment count
        })

    }
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
 }])

vdbApp.controller('forgotCtrl', ['$scope', '$rootScope', '$window', 'forgotService', '$location', function ($scope, $rootScope, $window, forgotService, $location) {
    $scope.hide = "ng-hide";
    $scope.overlay = "overlay";
    $rootScope.dynamicTitle = "Wachtwoord vergeten |";

    $scope.forgotpass = function () {
        $rootScope.globaloverlay = "active";
        var jsondata = JSON.stringify({
            "email": "" + $scope.femail + ""
        });

        $rootScope.tempemail1 = $scope.femail;

        var getForgot = forgotService.getForgot(jsondata).then(function (data) {

            var getForgot = data.data;
            $scope.errorFEmail = ""

            if (getForgot.success == "false") {
                $scope.errorFEmail = getForgot.error;
                $scope.hide = "";
            } else {
                $location.path('/bevestiging-wachtwoord-vergeten');
            }

            $rootScope.globaloverlay = "";
        });
    }
    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
}])

vdbApp.controller('confirmationForgotPasswordCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {
    $rootScope.dynamicTitle = "Wachtwoord |";
    $scope.home = function () {
        $location.path('/');
    }
}]);

vdbApp.controller('profileCtrl', ['$scope', '$rootScope', '$window', 'profileService', 'loginService', '$location', '$facebook', 'syncFBService', '$cookies', function ($scope, $rootScope, $window, profileService , loginService, $location, $facebook, syncFBService, $cookies) {
    $scope.hide = "ng-hide";
    $rootScope.dynamicTitle = "Mijn profiel |";
    $scope.home = function () {
        $location.path('/');
    }

    //error session
    if ($rootScope.errorSession) {
        $scope.hide = "";
    }

    var c_user = $cookies.getObject('user');
    var c_user_profile = $cookies.getObject('user_profile');

    //set default message for facebook button
    // Hide Facebook connect for GVB;
    $scope.allowFacebookConnect = ! CUSTOMISATION_GVB.is_active();
    $scope.facebookMessages = "Connect Facebook";
    $scope.facebookExist = (c_user_profile.facebookID) ? 1 : 0;
    if ($scope.facebookExist) $scope.facebookMessages = "Gekoppeld met Facebook";

    //this is the function to sync the profile
    $scope.$on('fb.auth.authResponseChange', function () {
        $scope.fbstatus = $facebook.isConnected();
        if ($scope.fbstatus) {
            $rootScope.globaloverlay = "active";
            //sync data here
            $facebook.api('/me').then(function (user) {
                $scope.facebookuser = user;


                //here we create the json
                var username = $scope.username;
                var facebookID = $scope.facebookuser.id;
                var jsondata = JSON.stringify({
                    "username" : username,
                    "facebookID" : facebookID
                });

                //API call to connectFB
                var connectFB = syncFBService.getFBSync(jsondata).then(function (data) {

                    var result = data.data;

                    if (result.success == 'false') {
                        var error = result.error;
                        $scope.errorFB = error;
                        $facebook.logout();
                        $scope.hide = "";
                        $scope.successAlert = "";
                        $scope.successClass = "";
                        $scope.errorEmail = "";
                        $scope.errorOldPassword = "";
                        $scope.errorNewPassword = "";
                        $scope.errorInitials = "";
                        $scope.errorSurname = "";
                        $scope.errorAddress = "";
                        $scope.errorAddressN = "";
                        $scope.errorPostcode = "";
                        $scope.errorCity = "";
                        $scope.errorSex = "";
                        $scope.errorPasshash = "";

                        $(window).scrollTop(0);


                    } else if (result.success) {
                        $scope.errorFB = "";

                        //set button to connected
                        $scope.facebookMessages = "Gekoppeld met Facebook";
                        $scope.facebookExist = 1;

                        //fix this into cookies
                        $window.sessionStorage.facebookID = facebookID;
                        var user = $cookies.getObject('user');
                        var user_profile = $cookies.getObject('user_profile');
                        var expired = new Date();
                        expired.setHours(expired.getHours() + sessionTime);
                        user_profile.facebookID = facebookID;
                        $cookies.putObject('user', user, {
                            expires: expired
                        });
                        $cookies.putObject('user_profile', user_profile, {
                            expires: expired
                        });
                    }

                    $rootScope.globaloverlay = "";
                });
            });
        }
    });

    $scope.connectFacebook = function () {
        $facebook.login();
    }

    $scope.username = c_user.username;
    $scope.email = c_user.email;
    if (c_user_profile.sex == 'man') {
        $scope.selected1 = 1;
        $scope.selected2 = 0;
    } else {
        $scope.selected2 = 1;
        $scope.selected1 = 0;
    }

    $scope.initials = c_user_profile.initials;
    if (c_user_profile.tussenvoegsel == 'null') {
        $scope.tussenvoegsel = "";
    } else {
        $scope.tussenvoegsel = c_user_profile.tussenvoegsel;
    }

    $scope.surname = c_user_profile.surname;
    $scope.address = c_user_profile.address;
    $scope.address_number = c_user_profile.address_number;
    $scope.postcode = c_user_profile.postcode;
    $scope.city = c_user_profile.city;
    $scope.phone = c_user_profile.phone;

    //logger({user,password,user_profile});
    $scope.profile = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorEmail = "";
        $scope.errorOldPassword = null;
        $scope.errorNewPassword = null;
        $scope.errorInitials = "";
        $scope.errorSurname = "";
        $scope.errorAddress = "";
        $scope.errorAddressN = "";
        $scope.errorPostcode = "";
        $scope.errorCity = "";
        $scope.errorSex = "";
        $scope.errorPasshash = "";
        $scope.errorFB = "";
        $scope.errorPassword3 = null;

        $scope.hide = "ng-hide";
        c_user = $cookies.getObject('user');
        c_user_profile = $cookies.getObject('user_profile');
        var user = {};
        user.username = c_user.username;
        user.password_hash = c_user.password_hash;
        var password = {}
        if ($scope.password_old != null) {
            password.password_old = $scope.password_old;
        }
        if ($scope.password_new != null) {
            password.password_new = $scope.password_new;
        }
        if ($scope.rpassword != null) {
            password.rpassword = $scope.rpassword;
        }

        var user_profile = {}

        if ($scope.initials != null) {
            user_profile.initials = $scope.initials;
        }
        if ($scope.tussenvoegsel != null) {
            user_profile.tussenvoegsel = $scope.tussenvoegsel;
        }
        if ($scope.surname != null) {
            user_profile.surname = $scope.surname;
        }
        if ($scope.email != null) {
            user_profile.email = $scope.email;
        }
        if ($scope.sex != null) {
            user_profile.sex = $scope.sex;
        }
        if ($scope.address_old != null) {
            user_profile.address_old = $scope.address_old;
        }
        if ($scope.address != null) {
            user_profile.address = $scope.address;
        }
        if ($scope.address_number != null) {
            user_profile.address_number = $scope.address_number;
        }
        if ($scope.address_suffix != null) {
            user_profile.address_suffix = $scope.address_suffix;
        }
        if ($scope.postcode != null) {
            user_profile.postcode = $scope.postcode;
        }
        if ($scope.city != null) {
            user_profile.city = $scope.city;
        }
        if ($scope.phone != null) {
            user_profile.phone = $scope.phone;
        }


        if ($scope.password_new != $scope.rpassword) {

            $scope.errorPassword3 = "Wachtwoord komt niet overeen"
            $scope.hide = "";
            $(window).scrollTop(0);
            $rootScope.globaloverlay = "";


        } else if ($scope.password_new == $scope.rpassword) {

            var jsondataObj = new Object();
            jsondataObj.user = user;
            jsondataObj.password = password;
            jsondataObj.user_profile = user_profile;
            var jsondata = JSON.stringify(jsondataObj);

            var getProfile = profileService.getProfile(jsondata).then(function (data) {

                var getProfile = data.data;


                if (!getProfile.success) {

                    $scope.errorEmail = getProfile.errors.email;
                    $scope.errorOldPassword = getProfile.errors.password_old;
                    $scope.errorNewPassword = getProfile.errors.password_new;
                    $scope.errorInitials = getProfile.errors.initials;
                    $scope.errorSurname = getProfile.errors.surname;
                    $scope.errorAddress = getProfile.errors.address;
                    $scope.errorAddressN = getProfile.errors.address_number;
                    $scope.errorPostcode = getProfile.errors.postcode;
                    $scope.errorCity = getProfile.errors.city;
                    $scope.errorSex = getProfile.errors.sex;
                    $scope.errorPasshash = getProfile.errors.password_hash;
                    $scope.errorFB = "";
                    $scope.hide = "";
                    $scope.successAlert = "";
                    $scope.successClass = "";
                    $scope.overlay = "overlay";

                    $(window).scrollTop(0);

                    $rootScope.globaloverlay = "";

                } else {

                    if ($scope.password_old != null && $scope.password_new != null) {
                        var password = $scope.password_new;
                        var jsondatalogin = JSON.stringify({
                            "user": {
                                "username": "" + c_user.username + "",
                                "password" : $scope.password_new
                            }
                        });
                    } else {
                        var password_hash = c_user.password_hash;
                        var jsondatalogin = JSON.stringify({
                            "user": {
                                "username": "" + c_user.username + "",
                                "password_hash" : password_hash
                            }
                        });
                    }
                    var getLogin = loginService.getLogin(jsondatalogin).then(function (data) {
                        var getLogin = data.data;

                        $cookies.putObject('user', getLogin.user);
                        $cookies.putObject('user_profile', getLogin.user_profile);
                        var expired = new Date();
                        expired.setHours(expired.getHours() + sessionTime);
                        $cookies.putObject('user', getLogin.user, {
                            expires: expired
                        });
                        $cookies.putObject('user_profile', getLogin.user_profile, {
                            expires: expired
                        });
                        $rootScope.globaloverlay = "";
                        $(window).scrollTop(0);
                        $scope.successAlert = "Profiel geüpdatet";
                        $scope.successClass = "successAlert";
                        $scope.hide = "";
                        $scope.password_new = "";
                        $scope.password_old = "";
                        $scope.rpassword = "";

                    })
                }
            });
        }

        $scope.successAlert = "";
        $scope.successClass = "";

        $scope.close = function () {
            $scope.hide = "ng-hide";
        }
    }

}])

vdbApp.controller('selectProblemCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandardService','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandardService,reportService,issuesService,agreementSevice,$routeParams) {
    var selectProblemController = this;
    $rootScope.dynamicTitle = "Nieuwe melding |";
    $scope.redirectproblem = function() { selectProblemController.redirectTo(ISSUE_TYPE_PROBLEM); }
    $scope.redirectidea = function() { selectProblemController.redirectTo(ISSUE_TYPE_IDEA); }

    selectProblemController.redirectTo = function(type) {
        var path = '/' + ($routeParams.cityName ? 'gemeente/' + $routeParams.cityName + '/': '') + (type == ISSUE_TYPE_IDEA ? 'nieuw-idee' : 'nieuw-probleem');
        if ( type === ISSUE_TYPE_IDEA && CUSTOMISATION_GVB.is_active() ) {
          path = '/nieuwe-aanpassing';
        }
        $location.path(path);
    }
}])

vdbApp.controller('createProblemCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandardService','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandardService,reportService,issuesService,agreementSevice,$routeParams) {
    logger('createProblemCtrl');
    CUSTOMISATION_GVB.check_login($rootScope, $cookies, $location);
    var is_gvb_aanpassing = $location.path().includes('nieuwe-aanpassing') && CUSTOMISATION_GVB.is_active();

    $scope.privateMessageHide = false;

    if($location.path().includes('nieuwe-melding')){
        $rootScope.dynamicTitle = "Nieuwe melding |";
    } else if( is_gvb_aanpassing ){
        $rootScope.dynamicTitle = "Nieuwe aanpassing |";
    } else {
        $rootScope.dynamicTitle = "Nieuw probleem |";
    }

    $rootScope.lastUrl = $location.path();

    // $routeParams.latitude are used in mainController.determineStartLocation
    if ( $routeParams.gvbid ) {
      if ( ! $rootScope.clickedGvbObject ) {
        $rootScope.clickedGvbObject = {
          name: '',
          meta: {},
        };
      }
      $scope.is_urgent = false;
      $scope.description = "";
      // Text from the stop/route is shown separately, and added to the description field before sending to the backend.
      $scope.description_meta = "";
      $scope.title = "Melding bij: "+$rootScope.clickedGvbObject.name;

      if ( $rootScope.clickedGvbObject.lines ) {
        $scope.description_meta += 'Lijnen: '+$rootScope.clickedGvbObject.lines.join(', ') + "\n\n";
      }

      if ( $rootScope.clickedGvbObject.destinations ) {
        $scope.description_meta += "Richtingen:\n"+$rootScope.clickedGvbObject.destinations.join("\n") + "\n\n";
      }

      $scope.description_meta += "Meta-data:\n";
      angular.forEach($rootScope.clickedGvbObject.meta, function(v,k) {
        $scope.description_meta += k + ' : ' + v + "\n";
      });

      angular.forEach($rootScope.clickedGvbObject, function(v,k) {
        if ( k === 'meta' || k === 'lines' || k === "destinations" ) { return; }
        $scope.description_meta += k + ' : ' + v + "\n";
      });
      // Move the map (and small map) to the targeted/clicked location.
      if ( $routeParams.latitude && $routeParams.longitude ) {
        moveMapToLocation({
          lat: parseFloat($routeParams.latitude),
          lng: parseFloat($routeParams.longitude)
        });
      }
    }

    $scope.hide = "ng-hide";
    $scope.issueName = "Probleem"
    $scope.hideIssue = 1;
    $scope.myIssueCount = 0;
    $scope.slide = "";
    $scope.initslide = "toggle-button";
    $scope.loadCategory = 1;
    $scope.count = 0;
    $scope.standardMessage = "";
    $rootScope.urlBefore = $location.path();

    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.newsletter = false;
    $scope.sexoption = [{'name': 'Dhr.', 'value': 'm'},
                        {'name': 'Mw.','value': 'f'}];

    $scope.sex = $scope.sexoption[0].value;

    $timeout(function () {
        $scope.slide = "toggle-button-selected-left";
    }, 0)

    menuSelected($rootScope, 'createissue');
    //show my issue

    $scope.updateMyIssues();

    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""
            }
        });
        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
            var getdata = data.data;
            var count = getdata.count;
            $rootScope.myIssueCount = count;
            $rootScope.myIssuesList = getdata.issues;
        })
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }
    //first initial
    $timeout(function () {

        if ( is_gvb_aanpassing ) {
          var issueMarker = googleMapCreateIdea($rootScope);
          attachAutoCompleteListener('searchCityProblem',issueMarker,map4,"location2", $scope);
        } else {
        var issueMarker = googleMapCreateProblem($rootScope);
        attachAutoCompleteListener('searchCityProblem',issueMarker,map3,"location", $scope);
        }
        $scope.categoriesData();
        $scope.getServiceStandard(city.long_name);
    }, 1500);

    $scope.categoriesData = function () {
        $scope.loadCategory = 1;
        $scope.count = 0;
        $scope.duplicateDataList = null;
        var latitude = markerLat;
        var longitude = markerLng;
        var jsondataCity = JSON.stringify({
            "latitude" : latitude,
            "longitude" : longitude
        });
        $timeout(function () {
            $scope.categoriesList = null;
            $scope.subcategoriesList = [];
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                // GVB has special two-tier double categories.
                if ( CUSTOMISATION_GVB.is_active() ) {
                  var problemCategories = [];
                  angular.forEach(data.data.categories, function(v,k) {
                    if ( v.type === 'problem' ) {
                      problemCategories.push(v);
                      $scope.subcategoriesList[v.id] = v.subcategories;
                    }
                  });
                  $scope.categoriesList = problemCategories;
                } else {
                  $scope.categoriesList = data.data.categories;
                }
                $timeout(function () {
                    $scope.loadCategory = 0;
                })
            });


        }, 3000)
    }


    // Called during "enter"/button search from new problem.
    // GVB TODO: search would break the flow.. Disable
    $scope.clickSearchCreateIssue = function () {
        $scope.loadCategory = 1;
        if(document.getElementById('searchCityProblem').value){
           var citytemp = document.getElementById('searchCityProblem').value ;
           city.long_name =  citytemp.substring(citytemp.lastIndexOf(',')+1).replace(" ","");
           $location.path('/gemeente/'+city.long_name+'/nieuw-probleem',false);
        }
        $rootScope.lastCity = city.long_name;
        $timeout(function(){
            marker.setPosition(map3.getCenter());
        },1000)
        $timeout(function () {
            var latitude = marker.getPosition().lat();
            var longitude = marker.getPosition().lng();
            var jsondataCity = JSON.stringify({
                "latitude" : latitude,
                "longitude" : longitude
            });
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $scope.loadCategory = 0;
            });
            $scope.updateCouncilReport(city.long_name);
            $scope.updateCouncilAgreement(city.long_name);
            $scope.updateMapIssues();

            marker.setPosition(map3.getCenter());
        },2000)

    }

    $scope.createIssue = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorTitle = "";
        $scope.errorDescription = "";
        $scope.errorId = "";
        $scope.errorIdStyle = "";
        $scope.errorLocation = "";
        $scope.errorInitials = "";
        $scope.errorCity = "";
        $scope.errorSurname = "";
        $scope.errorEmail = "";
        $scope.errorPostcode = "";
        $scope.errorStreet = "";
        $scope.errorStreetNumber = "";
        $scope.errorImg = "";

        //initial data for request
        var user = {};
        var user_profile = {};
        var issue = {};
        var location = {};
        var file = $scope.imgData;
        // For GVB
        var file2 = $scope.imgData2;
        var file3 = $scope.imgData3;
        var file4 = $scope.imgData4;
        var file5 = $scope.imgData5;

        // Photos are required for the GVB.
        if ( CUSTOMISATION_GVB.is_active() && $scope.categoryId !== 13 && ! file) {
          $scope.errorImg = "Foto is vereist";
          $scope.hide = "";
          $rootScope.globaloverlay = "";
          $(window).scrollTop(0);
          return;
        }

        //login
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        //not login
        else {
            user.email = $scope.email;
            user_profile.initials = $scope.initials;
            user_profile.sex = $scope.sex;
            user_profile.tussenvoegsel = $scope.tussenvoegsel;
            user_profile.surname = $scope.surname;
            user_profile.address = $scope.address;
            user_profile.address_number = $scope.address_number;
            user_profile.address_suffix = $scope.address_suffix;
            user_profile.postcode = $scope.postcode;
            user_profile.city = $scope.city;
            user_profile.phone = $scope.phone;
            user_profile.newsletter = $scope.newsletter;
        }

        //description
        if ( is_gvb_aanpassing ) {
          issue.type = "idea";
        } else {
        issue.type = "problem";
        }
        if ($scope.categoryId) {
            issue.category_id = $scope.categoryId;
        } else {
            issue.category_id = -1;
        }
        if ($scope.subcategoryId) {
            issue.subcategory_id = $scope.subcategoryId;
        } else {
            issue.subcategory_id = -1;
        }

        if ($scope.title) {
            issue.title = $scope.title;
        } else {
            issue.title = "";
        }
        if ($scope.description) {
            issue.description = $scope.description;
        } else {
            issue.description = "";
        }
        if ($scope.privateMessage) {
            issue.privateMessage = $scope.privateMessage;
        } else {
            issue.privateMessage = "";
        }
        //location
        location.latitude = markerLat;
        location.longitude = markerLng;
        logger("createlat:"+location.latitude);
        logger("createlong:"+location.longitude);
        issue.is_urgent = $scope.is_urgent;

        var jsondataSubmit = {
            issue : {
                title : issue.title,
                description :  issue.description,
                type :  issue.type,
                category_id :  issue.category_id,
                private_message : issue.privateMessage,
                organisation_id: $rootScope.customisation.organisation_id,
            },
            location : {
                latitude : location.latitude,
                longitude : location.longitude
            }
        }

        if ( CUSTOMISATION_GVB.is_active() ) {
          jsondataSubmit.issue.description += "\n\n" + $scope.description_meta;
          jsondataSubmit.issue.subcategory_id = issue.subcategory_id;
          jsondataSubmit.issue.is_urgent = issue.is_urgent ? true : false;
          // GVB TODO: parse from stop information if available/possible
          jsondataSubmit.issue.lines = "1";
          jsondataSubmit.issue.direction = "Cs";
        }

        if ($cookies.getObject('user')) { //login
            jsondataSubmit.user = {username:user.username,password_hash:user.password_hash}
        } else {
            jsondataSubmit.user = {email:user.email}
            jsondataSubmit.user_profile = user_profile;
        }

        jsondataSubmit = JSON.stringify(jsondataSubmit);

        if (file) {
            issueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file, file2, file3, file4, file5).then($scope.handleSubmit);
        } else {
            issueSubmitService.getIssueSubmit(jsondataSubmit).then($scope.handleSubmit);
        }
    }

    $scope.handleSubmit = function(data) {

        var issueData = data.data;
        if (!issueData.success) {
            $scope.hide = "";
            if (issueData.errors.title) {
                $scope.errorTitle = "Onderwerp " + issueData.errors.title;
            }
            if (issueData.errors.description) {
                $scope.errorDescription = "Beschrijving " + issueData.errors.description;
            }
            if (issueData.errors.category_id) {
                $scope.errorId = issueData.errors.category_id;
                $scope.errorIdStyle = 'border-color: #a94442';
            }
            if (issueData.errors.location) {
                $scope.errorLocation = issueData.errors.location;
            }
            if (issueData.errors.initials) {
                $scope.errorInitials = "Voorletters " + issueData.errors.initials;
            }
            if (issueData.errors.owner_city) {
                $scope.errorCity = "Plaats " + issueData.errors.owner_city;
            }
            if (issueData.errors.surname) {
                $scope.errorSurname = "Achternaam " + issueData.errors.surname;
            }
            if (issueData.errors.owner_email) {
                $scope.errorEmail = issueData.errors.owner_email;
            }
            if (issueData.errors.owner_postcode) {
                $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
            }
            if (issueData.errors.street) {
                $scope.errorStreet = "Straat " + issueData.errors.street;
            }
            if (issueData.errors.street_number) {
                $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
            }
            $rootScope.globaloverlay = "";
            $(window).scrollTop(0);
        } else if (issueData.success == "false") {
            $scope.hide = "";
            $scope.errorEmail = issueData.error;
            $rootScope.globaloverlay = "";
            $(window).scrollTop(0);
        } else {
            //success
            $rootScope.successCreate = 1;
            var issueId = issueData.issue_id;
            if ($cookies.getObject('user')) {
                $location.path(/mijn-meldingen/ + issueId);
                $rootScope.successCreateLogin = 1;
            } else {
                // $location.path(/melding/ + issueId);
                 $location.path("/bevestiging-nieuwe-melding");
            }
            $rootScope.globaloverlay = "";
            $scope.updateMapIssues();
        }
    }

    $scope.alrCityCreate = function () {
        logger('alrCityCreate');
        //Get city problem when click/drag
        $scope.updateCouncilReport(city.long_name);
        $scope.updateCouncilAgreement(city.long_name);
        $scope.updateMapIssues();
    }

    $scope.close = function () {
        $scope.hide = "ng-hide";
    }

    $scope.reset = function () {
        $scope.title = "";
        $scope.description = "";
    }

    //switch bar change
    $scope.switchButton = function () {
        $location.path('/nieuw-idee');
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
    }

    $scope.setCategoryUrgent = function () {
        // category name: Verkeerslichten /  Waarschuwingslichten
        $scope.is_urgent = $scope.is_urgent_disabled = $scope.hideFormField = $scope.categoryId === 13 ? true : false;
    }

     //dulicate data
    $scope.duplicateData = function () {

        $('#duplicate-bubble').hide();
        var user = {};
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        var lat = markerLat;
        var long = markerLng;
        var council = city.long_name;
        var category_id = $scope.categoryId;
        $rootScope.currentPage = 1;
        $scope.totalPage = 5;

        var jsondataDuplicate = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash
            }
            ,
            "lat" : lat,
            "long" : long,
            "category_id" : category_id
        });
        logger(jsondataDuplicate);
        var getDuplicateIssue = duplicateIssuesService.getDuplicateIssue(jsondataDuplicate).then(function (data) {
            var getDuplicateIssue = data.data;
            $scope.count = data.data.count;
            $scope.duplicateDataList = getDuplicateIssue.issues;
            logger(getDuplicateIssue);

        });

        $scope.getServiceStandard(council,category_id);

        $scope.blockstyle = "margin-left:0%";
        $scope.duplicateposition = 0;

    }

    $scope.getServiceStandard = function(council,category_id) {
        logger("createProblemController.getServiceStandard("+council+")")
        // TODO FB: this council is a hardcoded hack, maybe it can be removed
        // entirely? See also at createIdeaController.
        console.warn('council cPC',council);
        if ( ! council ) { council = ''; }
        if (council.toLowerCase().replace(' ','-') == 'utrechtse-heuvelrug') {
            $scope.standardMessage = "U kunt uw ideeën aandragen tot 2 januari 2017";
        } else {

            var jsondata = {};
            jsondata.council = council;
            jsondata.category_id = category_id;
            jsondata = JSON.stringify(jsondata);
            serviceStandardService.getServiceStandard(jsondata).then(function (data) {
                $scope.standardMessage = $rootScope.standardTemp = data.data.standard;
            })
        }
    }



    $scope.moveDuplicate = function (move) {

        var limit = $scope.count - 3;
        $scope.duplicateposition = $scope.duplicateposition + move;

        if ($scope.duplicateposition < 0) $scope.duplicateposition = 0;

        if ($scope.duplicateposition > limit) $scope.duplicateposition = limit;

        var move = $scope.duplicateposition * -33.333;
        $scope.blockstyle = "margin-left:" + move + "%";

    }


}])

vdbApp.controller('createIdeaCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', 'serviceStandardService','$location', 'issuesService', 'issueSubmitServiceWithImage', '$cookies','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, serviceStandardService, $location, issuesService, issueSubmitServiceWithImage, $cookies,reportService,issuesService,agreementSevice,$routeParams) {
    logger("createIdeaCtrl");
    CUSTOMISATION_GVB.check_login($rootScope, $cookies, $location);

    if ($location.path().includes('utrechtse-heuvelrug')) {
        $rootScope.ideaExplanation = "Wij delen je idee met de gemeente & met buurtbewoners. Niet alle ideeën kunnen worden uitgevoerd, maar een goed verhaal en veel medestanders vergroot de kans wel.";
    } else {
        $rootScope.ideaExplanation = "Wij delen je idee met de gemeente & met buurtbewoners. De ervaring leert dat de gemeente lang niet met alle ideeën kan helpen, maar een goed verhaal en veel medestanders vergroot de kans wel.";
    }

    $rootScope.dynamicTitle = "Nieuw idee |";
    $scope.hide = "ng-hide";
    $scope.issueName = "Probleem"
    $scope.hideIssue = 1;
    $scope.myIssueCount = 0;
    $scope.initslide = "toggle-button2 ";
    $rootScope.urlBefore = $location.path();
    $scope.privateMessageHide = false;

    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.initials = "";
    $scope.tussenvoegsel = "";
    $scope.surname = "";
    $scope.sex = "";
    $scope.address = "";
    $scope.address_number = "";
    $scope.address_suffix = "";
    $scope.postcode = "";
    $scope.city = "";
    $scope.phone = "";
    $scope.newsletter = false;
    $scope.sexoption = [
        {
            'name': 'Dhr.',
            'value': 'm'
        },
        {
            'name': 'Mw.',
            'value': 'f'
        }
   		];
    $scope.sex = $scope.sexoption[0].value;

    $timeout(function () {
        $scope.slide = "toggle-button-selected-right";
    }, 0)

    menuSelected($rootScope, 'createissue');

    //show my issue
    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
        var jsondata = JSON.stringify({
            "user": {
                "username": "" + $cookies.getObject('user').username + "",
                "password_hash": "" + $cookies.getObject('user').password_hash + ""

            }
        });
        var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
            var getdata = data.data;
            var count = getdata.count;
            $rootScope.myIssueCount = count;
            $rootScope.myIssuesList = getdata.issues;
        })
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }


    //first initial
    $timeout(function () {
        var issueMarker = googleMapCreateIdea($rootScope);
        attachAutoCompleteListener('searchCityProblem',issueMarker,map4,"location2");
        $scope.getServiceStandard(city.long_name);
    }, 1500);


    if ($cookies.getObject('user')) {
        $scope.hideNonLogin = "ng-hide"
    }

    //this is really bad, it should be combined with problem
    $scope.getServiceStandard = function(council,category_id) {
        logger("createIdeaController.getServiceStandard("+council+")")
        // TODO FB: this council is a hardcoded hack, maybe it can be removed
        // entirely? See also at createProblemController.
        console.warn('council cIC',council);
        if ( ! council ) { council = ''; }
        if (council.toLowerCase().replace(' ','-') == 'utrechtse-heuvelrug') {
            $scope.standardMessage = "U kunt uw ideeën aandragen tot 2 januari 2017";
        } else {

            var jsondata = {};
            jsondata.council = council;
            jsondata.category_id = category_id;
            jsondata = JSON.stringify(jsondata);
            serviceStandardService.getServiceStandard(jsondata).then(function (data) {
                $scope.standardMessage = $rootScope.standardTemp = data.data.standard;
            })
        }
    }



    $scope.clickSearchCreateIssue = function () {
        if(document.getElementById('searchCityProblem').value){
           var citytemp = document.getElementById('searchCityProblem').value ;
           city.long_name =  citytemp.substring(citytemp.lastIndexOf(',')+1).replace(" ","");
           $location.path('/gemeente/'+city.long_name+'/nieuw-idee');
        }
        var latitude = markerLat;
        var longitude = markerLng;
        $rootScope.lastCity = $scope.searchCityCreate;
        var jsondataCity = JSON.stringify({
            "latitude" : latitude,
            "longitude" : longitude
        });

        $timeout(function () {
            $scope.updateCouncilReport(city.long_name);
            $scope.updateCouncilAgreement(city.long_name);
            $scope.updateMapIssues();

            marker.setPosition(map4.getCenter());

            //change location after search
            markerLat = marker.getPosition().lat();
            markerLng = marker.getPosition().lng();


        }, 1000)
        $timeout(function(){
            marker.setPosition(map4.getCenter());
        },1500)

    }

    $scope.alrCityCreate = function () {
        //Get city problem when click/drag
        $scope.updateCouncilReport(city.long_name);
        $scope.updateCouncilAgreement(city.long_name);
        $scope.updateMapIssues();
    }

    $scope.createIdea = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorTitle = "";
        $scope.errorDescription = "";
        $scope.errorId = "";
        $scope.errorIdStyle = "";
        $scope.errorLocation = "";
        $scope.errorInitials = "";
        $scope.errorCity = "";
        $scope.errorSurname = "";
        $scope.errorEmail = "";
        $scope.errorPostcode = "";
        $scope.errorStreet = "";
        $scope.errorStreetNumber = "";
        var file = $scope.imgData;

        //initial data for request
        var user = {};
        var user_profile = {};
        var issue = {};
        var location = {};

        //login
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        }
        //not login
        else {
            user.email = $scope.email;
            user_profile.initials = $scope.initials;
            user_profile.sex = $scope.sex;
            user_profile.tussenvoegsel = $scope.tussenvoegsel;
            user_profile.surname = $scope.surname;
            user_profile.address = $scope.address;
            user_profile.address_number = $scope.address_number;
            user_profile.address_suffix = $scope.address_suffix;
            user_profile.postcode = $scope.postcode;
            user_profile.city = $scope.city;
            user_profile.phone = $scope.phone;
            user_profile.newsletter = $scope.newsletter;
        }

        //description
        issue.type = "idea";
        if ($scope.ideaRealization) {
            issue.realization = $scope.ideaRealization;
        } else {
            issue.realization = "";
        }

        if ($scope.ideaTitle) {
            issue.title = $scope.ideaTitle;
        } else {
            issue.title = "";
        }
        if ($scope.ideaDescription) {
            issue.description = $scope.ideaDescription;
        } else {
            issue.description = "";
        }
        if ($scope.privateMessage) {
            issue.privateMessage = $scope.privateMessage;
        } else {
            issue.privateMessage = "";
        }
        //location
        location.latitude = markerLat;
        location.longitude = markerLng;
        var jsondataSubmit;
        if ($cookies.getObject('user')) { //login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "username" : user.username,
                    "password_hash" : user.password_hash,
                },
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" : issue.type,
                    "realization" : issue.realization,
                    "private_message" : issue.privateMessage,
                    "organisation_id" : $rootScope.customisation.organisation_id

                },
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });

        } else {
            //not login
            jsondataSubmit = JSON.stringify({
                "user" : {
                    "email" : user.email
                },
                "user_profile" : {
                    "initials" : $scope.initials,
                    "tussenvoegsel" : $scope.tussenvoegsel,
                    "surname" : $scope.surname,
                    "sex" : $scope.sex,
                    "address" : $scope.address,
                    "address_number": $scope.address_number,
                    "address_suffix": $scope.address_suffix,
                    "postcode" : $scope.postcode,
                    "city" : $scope.city,
                    "phone" : $scope.phone,
                    "newsletter" : $scope.newsletter,
                },
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" : issue.type,
                    "realization" : issue.realization,
                    "private_message" : issue.privateMessage,
                    "organisation_id" : $rootScope.customisation.organisation_id

                },
                "location" : {
                    "latitude" : location.latitude,
                    "longitude" : location.longitude
                }
            });
        }

        if (!file) {
            var getIssueSubmit = issueSubmitService.getIssueSubmit(jsondataSubmit).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorRealization = "Realisatie " + issueData.errors.realization;
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Achternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }


                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    $rootScope.successCreate = 1;
                    var issueId = issueData.issue_id;
                     if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        // $location.path(/melding/ + issueId);
                        // $rootScope.successCreateNonLogin = 1;
                         $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    $scope.updateMapIssues();
                }
            });
        } else if (file) {
            issueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file).then(function (data) {
                var issueData = data.data;
                if (!issueData.success) {
                    $scope.hide = "";
                    if (issueData.errors.title) {
                        $scope.errorTitle = "Onderwerp " + issueData.errors.title;
                    }
                    if (issueData.errors.description) {
                        $scope.errorDescription = "Beschrijving " + issueData.errors.description;
                    }
                    if (issueData.errors.category_id) {
                        $scope.errorId = issueData.errors.category_id;
                        $scope.errorIdStyle = 'border-color: #a94442';
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.location) {
                        $scope.errorLocation = issueData.errors.location;
                    }
                    if (issueData.errors.initials) {
                        $scope.errorInitials = "Voorletters " + issueData.errors.initials;
                    }
                    if (issueData.errors.owner_city) {
                        $scope.errorCity = "Plaats " + issueData.errors.owner_city;
                    }
                    if (issueData.errors.surname) {
                        $scope.errorSurname = "Achternaam " + issueData.errors.surname;
                    }
                    if (issueData.errors.owner_email) {
                        $scope.errorEmail = issueData.errors.owner_email;
                    }
                    if (issueData.errors.owner_postcode) {
                        $scope.errorPostcode = "Postcode " + issueData.errors.owner_postcode;
                    }
                    if (issueData.errors.street) {
                        $scope.errorStreet = "Straat " + issueData.errors.street;
                    }
                    if (issueData.errors.street_number) {
                        $scope.errorStreetNumber = "Huisnummer " + issueData.errors.street_number;
                    }
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else if (issueData.success == "false") {
                    $scope.hide = "";
                    $scope.errorEmail = issueData.error;
                    $rootScope.globaloverlay = "";
                    $(window).scrollTop(0);
                } else {
                    //success
                    var issueId = issueData.issue_id;
                    $rootScope.successCreate = 1;
                     if ($cookies.getObject('user')) {
                        $location.path(/mijn-meldingen/ + issueId);
                        $rootScope.successCreateLogin = 1;
                    } else {
                        // $location.path(/melding/ + issueId);
                        // $rootScope.successCreateNonLogin = 1;
                        $location.path("/bevestiging-nieuwe-melding");
                    }
                    $rootScope.globaloverlay = "";
                    $scope.updateMapIssues();

                }
            });

        }

    }

    $scope.close = function () {
        $scope.hide = "ng-hide";
    }
    $scope.reset = function () {
        $scope.title = "";
        $scope.description = "";
    }
        //switch bar change
    $scope.switchButton = function () {
        $location.path('/nieuw-probleem');
        markerLat = marker.getPosition().lat();
        markerLng = marker.getPosition().lng();
    }

}]);


vdbApp.controller('deleteIssueCtrl', ['$scope', '$rootScope', '$location','$routeParams', '$window', 'statusChangeService', 'myIssuesService', '$cookies', function ($scope, $rootScope, $location, $routeParams, $window, statusChangeService, myIssuesService, $cookies) {
    $scope.hideError = "ng-hide";
    $scope.error = "";
    $scope.deleteIssue = function () {
        $rootScope.globaloverlay = "active";
        var user = {};
        user.username = $cookies.getObject('user').username;
        user.password_hash = $cookies.getObject('user').password_hash;
        var issue_id = $rootScope.getStatusId;
        var status = "deleted";
        var jsondata = JSON.stringify({
            "user" : {
                "username" : user.username,
                "password_hash" : user.password_hash,
            },
            "issue_id" : issue_id,
             "status" : status
        });
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
            var getStatusChange = data.data;
            //validate error or not
            if (getStatusChange.success) {
                $scope.updateMyIssues();
                $('#DeleteModal').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.globaloverlay = "";
                $scope.error = "";
                $scope.hideError = "ng-hide";
                $location.path('/bevestiging-verwijderen')

            } else {
                $scope.error = getStatusChange.error;
                $scope.hideError = "";
                $rootScope.globaloverlay = "";
            }
            //load myissue

        });
    }
    $scope.close = function () {
        $scope.hideError = "ng-hide";
        $scope.error = "";
    }
    $scope.cancel = function () {
        $scope.error = "";
        $scope.hideError = "ng-hide";
    }
}])

vdbApp.controller('closeIssueCtrl', ['$scope', '$rootScope', '$routeParams', '$window', 'statusChangeService', 'myIssuesService', '$cookies', function ($scope, $rootScope, $routeParams, $window, statusChangeService, myIssuesService, $cookies) {
    $scope.hideError = "ng-hide";
    $scope.errorClose = "";

    $scope.closeIssueClick = function () {
        $rootScope.globaloverlay = "active";
        var user = {};
        if ($cookies.getObject('user')) {
            user.username = $cookies.getObject('user').username;
            user.password_hash = $cookies.getObject('user').password_hash;
        } else {
            user.authorisation_hash = $rootScope.hashSession;
        }

        var issue_id = $rootScope.getStatusId;
        if (!$scope.feedback) {
            var result = null;
        } else {
            var result = $scope.feedback;
        }
        if (!$scope.rating) {
            var appreciation = null;
        } else {
            var appreciation = parseInt($scope.rating);
        }
        var status = "closed";

            var jsondata = JSON.stringify({
            "user" : {
            "username" : user.username,
            "password_hash" : user.password_hash,
            "authorisation_hash": user.authorisation_hash
            ,
        },
          "issue_id" : issue_id,
          "result" : result,
          "appreciation" : appreciation,
          "status" : status
          });


        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data) {
            var getStatusChange = data.data;
            if (!getStatusChange.success) {
                $scope.hideError = "";
                $scope.errorClose = getStatusChange.error;
                $rootScope.globaloverlay = "";
            } else {
                //load myissue
                if ($cookies.getObject('user')) {
                    var jsondata = JSON.stringify({
                        "user": {
                            "username": "" + $cookies.getObject('user').username + "",
                            "password_hash": "" + $cookies.getObject('user').password_hash + ""
                        }
                    });
                    var getMyIssues = myIssuesService.getMyIssues(jsondata).then(function (data) {
                        var getdata = data.data;
                        var count = getdata.count;
                        $rootScope.myIssueCount = count;
                        $rootScope.myIssuesList = getdata.issues;
                        $('#CloseModal').modal('hide');
                        $('.modal-backdrop').hide();
                        $rootScope.globaloverlay = "";
                        $scope.errorClose = "";
                        $scope.feedback = "";
                        $scope.rating = null;
                    })
                } else {
                    $('#CloseModal').modal('hide');
                    $('.modal-backdrop').hide();
                    $rootScope.globaloverlay = "";
                    $scope.errorClose = "";
                    $scope.feedback = "";
                    $scope.rating = null;
                }

            }

        });
    }
    $scope.close = function () {
        $scope.hideError = "ng-hide";
        $scope.errorClose = "";
        $scope.feedback = "";
        $scope.rating = null;
    }

}])


vdbApp.controller('unfollowIssueCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'unfollowIssueService', function ($scope, $rootScope, $routeParams, $window, $location, unfollowIssueService, targetAction) {

    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;
    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    //unfollow issue with hash code
    $rootScope.globaloverlay = "active";
    var authorisation_hash = $rootScope.hashSession;
    var jsondata = JSON.stringify({
        "hash": "" + authorisation_hash + ""});
    var getUnfollowIssue = unfollowIssueService.getUnfollowIssue(jsondata).then(function (data) {
        var getUnfollowIssue = data.data;
        if (!getUnfollowIssue.success) {
            $scope.message = getUnfollowIssue.error;
            $rootScope.globaloverlay = "";
            $scope.errorUnfollow = true;
        } else {
            $scope.message = getUnfollowIssue.message;
            if(!$scope.message) $scope.message = "Je volgt deze melding niet meer.";
            $rootScope.globaloverlay = "";
            $rootScope.standardTemp = $scope.message;
            var issueID = getUnfollowIssue.issue_id;
            $location.path("/melding/" + issueID);
        }

    });

}])

//registration hash handling
vdbApp.controller('registrationHashCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'confirmRegistrationService', 'cancelRegistrationService', function ($scope, $rootScope, $routeParams, $window, $location, confirmRegistrationService, cancelRegistrationService, targetAction) {

    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;

    $rootScope.urlBefore = null;
    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    if ($rootScope.targetAction === "register") {
        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "hash": "" + $rootScope.hashSession + ""
        });

        var getConfirm = confirmRegistrationService.getConfirm(jsondata).then(function (data) {
            var confirmation = data.data;
            if (!confirmation.success) {
                $rootScope.globaloverlay = "";
                $scope.message = confirmation.message;
                $scope.showerror = true;


            } else {
                $rootScope.globaloverlay = "";
                $scope.successConfirm = true;
            }
        });

        $rootScope.hashSession = null;
        $rootScope.targetAction = null;
    } else if ($rootScope.targetAction === "cancel_register") {
        $rootScope.globaloverlay = "active";

        var jsondata = JSON.stringify({
            "hash": "" + $rootScope.hashSession + ""
        });

        var getConfirm = cancelRegistrationService.getConfirm(jsondata).then(function (data) {
            var confirmation = data.data;
            if (!confirmation.success) {
                $rootScope.globaloverlay = "";
                $scope.message = confirmation.message;
                $scope.showerror = true;

            } else {
                $rootScope.globaloverlay = "";
                $scope.cancelConfirm = true;
            }
        });
    }

}])

vdbApp.controller('voteCtrl', ['$scope','$rootScope','$routeParams','voteSubmitService', function ($scope,$rootScope,$routeParams,voteSubmitService) {
    $scope.hide = 1;

    $scope.submit = function(){
        logger("voteController.submit()")
        $rootScope.globaloverlay = "active";
        var jsondata = {};
        jsondata.user = {};
        jsondata.user.name = $scope.name;
        jsondata.user.email = $scope.email;
        jsondata.issue_id = $routeParams.id;
        jsondata = JSON.stringify(jsondata);
        voteSubmitService.getvoteSummit(jsondata).then(function (data) {
            if(data.data.success){
                $rootScope.globaloverlay = "";
                $scope.name="";
                $scope.email="";
                $('#voteModal').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.voteMessage = "Klik op de link in de email die gestuurd is naar " + $scope.email + " om de stem te bevestigen";
                $rootScope.successVote = 1;
            } else {
                $rootScope.globaloverlay = "";
                $scope.hide = 0;
                $scope.error = "" + data.data.error + ""
            }
        });
    }
    $scope.close = function () {
        $scope.hide = 1;
    }
}]);

vdbApp.controller('confirmVoteCtrl', ['$scope','$rootScope','$routeParams','confirmVoteService','$location', function ($scope,$rootScope,$routeParams,confirmVoteService,$location) {
    $scope.successConfirm = false;
    $scope.cancelConfirm = false;
    $scope.showerror = false;
    $scope.errorUnfollow = false;
    $scope.errorVote = false;
    $scope.notCreateIssue = true;

    var hash = $routeParams.hashkey;
    $rootScope.hashSession = hash;

    $rootScope.globaloverlay = "active";
    var authorisation_hash = $rootScope.hashSession;
    var jsondata = JSON.stringify({
        "hash": "" + authorisation_hash + ""
    });
    var getConfirmVote = confirmVoteService.getConfirmVote(jsondata).then(function (data) {
        var getConfirmVote = data.data;
        if (!getConfirmVote.success) {
            $scope.message = getConfirmVote.error;
            $rootScope.globaloverlay = "";
            $scope.errorVote = true;
        } else {
            $scope.message = getConfirmVote.message;
            var getdata = data.data;
            $rootScope.globaloverlay = "";
            $location.path('/melding/'+getdata.issue_id);
            $rootScope.voteMessage = getdata.message;
            $rootScope.successVote = 1;
        }

    });
}])

vdbApp.controller('resolveIssueCommentNoCtrl', ['$scope','$rootScope','$routeParams','statusChangeService','$location','issuesService',function ($scope,$rootScope,$routeParams,statusChangeService,$location,issuesService) {
    $scope.hide= "ng-hide";
    $scope.resolve = function(){
        logger("resolveIssueCommentNoCtrl.resolve() --> " + $rootScope.hashSession);
        $rootScope.globaloverlay = "active";
        var user = {};
        user.authorisation_hash = $rootScope.hashSession;
        var comment = $scope.resolveComment;
        var issue_id = $rootScope.getStatusId;
        var status = "resolved";
        var jsondata = JSON.stringify({
           "user" : {
                    "authorisation_hash" : user.authorisation_hash
            },
            "comment" : comment,
            "issue_id" : issue_id,
            "status" : status});

        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data){
            var getStatusChange = data.data;
            if(!getStatusChange.success){
                $rootScope.globaloverlay = "";
                $scope.hide="";
                $scope.error = getStatusChange.error;
            }
            else{
                $rootScope.globaloverlay = "";
                $('#ResolveModalSimple').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.hashSession = null;
                $rootScope.targetAction = null;
                var jsondata = JSON.stringify({"issue_id" : issue_id});
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
            }
        });
    }
    $scope.close =function(){
        $scope.error="";
        $scope.comment="";
    }
}])

vdbApp.controller('resolveIssueCommentYesCtrl', ['$scope','$rootScope','$routeParams','statusChangeService','issuesService', function ($scope,$rootScope,$routeParams,statusChangeService,issuesService) {
    $scope.hide="ng-hide";
    $scope.resolve = function(){
        logger("resolveIssueCommentYesCtrl.resolve() --> " + $rootScope.hashSession);
        $rootScope.globaloverlay = "active";
        var user = {};
        user.authorisation_hash = $rootScope.hashSession;
        var comment = $scope.resolveComment;
        var issue_id = $rootScope.getStatusId;
        var status = "resolved";

        var jsondata = JSON.stringify({
            "user" : {
                "authorisation_hash" : user.authorisation_hash
            },
            "comment" : comment,
            "issue_id" : issue_id,
            "status" : status});
        var getStatusChange = statusChangeService.getStatusChange(jsondata).then(function (data){
            var getStatusChange = data.data;
            if(!getStatusChange.success){
                $rootScope.globaloverlay = "";
                $scope.hide="";
                $scope.error = getStatusChange.error;
            }
            else{
                $rootScope.globaloverlay = "";
                $('#ResolveModal').modal('hide');
                $('.modal-backdrop').hide();
                $rootScope.hashSession = null;
                $rootScope.targetAction = null;
                var jsondata = JSON.stringify({"issue_id" : issue_id});
                //get data for count comment
                var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                    var getdata = data.data;
                    $rootScope.problemIdList = getdata.issues;
                });
            }

        });
    }
    $scope.close =function(){
        $scope.error="";
        $scope.comment="";
    }
}])


// TODO FB: mainCtrl used as basis.
vdbApp.controller('rapportageCtrl', ['$scope', '$q','$timeout', '$window', '$location', '$rootScope', '$routeParams', '$http', 'issuesService', 'reportService', '$facebook', '$cacheFactory', 'agreementSevice', '$cookies','myIssuesService', 'departmentsService', 'departmentReportsService', function ($scope, $q,$timeout, $window, $location, $rootScope, $routeParams, $http, issuesService, reportService, $facebook, $cacheFactory, agreementSevice, $cookies, myIssuesService, departmentsService, departmentReportsService) {

    var rapportageController = this;
    $rootScope.is_rapportage = true;

    //very hacky, should be removed when making the google maps a service with the proper dependencies
    user = $cookies.getObject('user');
    userProfile = $cookies.getObject('user_profile');
    $scope.departmentIdSelected = 0;
    $scope.departmentSelected = {
      id: 0,
      name: '[Afdeling]'
    }
    // Default from and to date, the first of the current month until today.
    $scope.to_date = new Date();
    $scope.from_date = new Date($scope.to_date.getFullYear(), $scope.to_date.getMonth(), 1);
    $scope.reportData = {
      reports: '-',
      solutions: '-',
      average_running_time: '-',
      average_feedback: '-',
      totals: [],
      overviewByDay: [],
    };
    $scope.showCharts = false;
    $scope.departmentsList = [];
    $scope.departmentsDict = {};

    rapportageController.init = function() {
        // TODO FB: rapportageController.init appears to be called twice, why is this?
        //          because the index.html contains <body ng-controller="rapportageCtrl as rapportageController" >?
        logger("rapportageController.init");

        //some vars that are needed?
        $rootScope.dynamicTitle = "Rapportage";
        //$scope.showuserpanel();
        $rootScope.urlBefore = $location.path();
        $rootScope.errorSession = "";

        menuSelected($rootScope, 'rapportage');

        // TODO FB: implement a date picker for selecting rapportage data; for
        // now, just show the current dates.
        $('#rapportage-from-date').text($scope.from_date.toLocaleDateString('nl-NL'));
        $('#rapportage-to-date').text($scope.to_date.toLocaleDateString('nl-NL'));

        $timeout(function () {
            var listener = attachAutoCompleteListener('searchCity');
            var input = $('#searchCity');
            $('#clickSearch').mousedown(function() {input.focus();});
            $('#clickSearch').mouseup(function() {
                logger("clickSearch" +  input.val());
                moveMapToAddress(input.val());
            });
        },10);


        var jsondata = '{}';
        var getDepartments = departmentsService.getDepartments(jsondata).then(function (data) {
          $scope.departmentsList = data.data.departments;
          for(var i=0; i<$scope.departmentsList.length; i++) {
            $scope.departmentsDict[$scope.departmentsList[i].id] = $scope.departmentsList[i];
          }
        });
    }

    // TODO FB: apart from manual selection, also react to geolocation
    // and update below again.
    $scope.departmentSelectionClick = function () {
      if ( $scope.departmentIdSelected ) {
        $scope.departmentSelected = $scope.departmentsDict[$scope.departmentIdSelected];
        var report_query = {
          department_id: $scope.departmentIdSelected,
          from_date: $scope.from_date.toISOString().substr(0,10),
          to_date: $scope.to_date.toISOString().substr(0,10),
          output: "JSON"
        }
        logger('department report query', report_query);
        report_query = JSON.stringify(report_query);
        var getReportData = departmentReportsService.getDepartmentReports(report_query).then(function (data) {
          $scope.reportData = data.data;
          logger('department report data',data.data);
          if ( $scope.showCharts ) {
            $scope.showRapportageCharts();
          }
        });
      }
    };

    $scope.showRapportageCharts = function() {
      logger('chart showing', $scope.reportData);
      $scope.showCharts = true;
      // Call externally defined chart creation method.
      rapportage_show_details($scope.reportData);
    }

    $scope.hideRapportageCharts = function() {
      logger('chart hiding');
      $scope.showCharts = false;
      // Call externally defined chart creation method.
      rapportage_hide_details()
    }

    $scope.updateSearchBoxForCouncil = function(city) {
        logger("updateSearchBoxForCouncil(" + city + ")");
        logger($scope.searchCity);
        $scope.searchCity = city;
    }

    $scope.updateCouncilAgreement = function(city) {
        logger("updateCouncilAgreement");
        agreementSevice.getAgreement(JSON.stringify({"council": "" + city + ""})).then(function (data) {
            $rootScope.agreement = data.data;
            $timeout(function () { $rootScope.hideLogo = !data.data.logo; });
        });
    }

    //click function at map
    $scope.alrCity = function () {
        logger("rapportageCtrl.alrCity() -> getreport / getagreement / getIssues if city.long_name");
        $scope.updateAllInfo();
    }


    $scope.updateAllInfo = function(forceUpdate) {
        logger("updateAllInfo("+forceUpdate+") --> ");

        //if force, just reload all, regardless of the city name
        if(forceUpdate && city.long_name != null) {
            //$scope.updatePathForCouncil(city.long_name);
            $scope.updateSearchBoxForCouncil(city.long_name);
            $scope.updateCouncilReport(city.long_name);
            $scope.updateCouncilAgreement(city.long_name);
        } else { // otherwise, get the cityname and check it it has changed, only then reload info
            var currentCity = city.long_name;
            determineCityForGeocode(function() {
                if (currentCity == undefined || city.long_name != currentCity.long_name) {
                    //$scope.updatePathForCouncil(city.long_name);
                    $scope.updateSearchBoxForCouncil(city.long_name);
                    $scope.updateCouncilReport(city.long_name);
                    $scope.updateCouncilAgreement(city.long_name);
                }
            });
        }

        // $scope.updateMyIssues();
        $scope.updateMapIssues();
    }

    //move page
    $scope.clickMenu = function (selected) {
        logger("rapportageCtrl.clickMenu()");

        if (selected == "myissues" || selected == "createissue") {
            if (!$cookies.getObject('user')) {
                if (selected == 'myissues') {
                    $rootScope.urlBefore = "/mijn-meldingen";
                    menuSelected($rootScope, 'myIssues');
                    $location.path('/' + "login");
                }
                if (selected == 'createissue') {
                    $rootScope.urlBefore = "/nieuwe-melding";
                    menuSelected($rootScope, 'createissue');
                    $location.path('/nieuwe-melding');
                }
            } else {
                if (selected == "createissue") {
                    $location.path('/nieuwe-melding');
                } else if (selected == "myissues") {
                    $location.path('/mijn-meldingen');
                } else {
                    $location.path('/' + selected);
                }
            }
        } else {
            $location.path('/' + selected);
        }
    }

    $scope.noProtocol = function(url) {
        return url.replace('http:','').replace('https:','');
    }
    rapportageController.init();
}]);

// createProblemCtrl used as basis for campaignCtrl
vdbApp.controller('campaignCtrl', ['$http', '$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'campaignIssueSubmitService', 'myIssuesService', '$location', 'issuesService', 'campaignIssueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandardService','reportService','issuesService','agreementSevice','campaignSubmissionsService','$routeParams', function ($http, $scope, $rootScope, $window, $timeout, categoriesService, campaignIssueSubmitService, myIssuesService, $location, issuesService, campaignIssueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandardService,reportService,issuesService,agreementSevice,campaignSubmissionsService,$routeParams) {
    logger('campaignCtrl');

    $rootScope.is_campaign = true;
    // Assume the campaign is not active by default, update when the
    // actual campaign is loaded.
    $scope.active_campaign = false;
    $scope.inactive_campaign_message = '';
    $scope.campaignSubmissionList = null;
    hideBackgroundImage($rootScope, 'campagne');
    // Normally, show the form. If a specific id is given, show an
    // existing issue instead.
    $scope.showForm = false;
    $scope.showId = false;
    $scope.showIdContent = {};

    // Check if we're viewing a specific existing submission.
    // If so, get (and show) the fields instead of the form.
    var campaign_submission_id = $routeParams.cid;
    console.log('cSI', campaign_submission_id);
    if ( campaign_submission_id ) {
      $scope.showId = true;
      var campaign_id_query = {
        id: campaign_submission_id,
      };
      console.log('cSI', campaign_id_query);
      campaign_id_query = JSON.stringify(campaign_id_query);
      console.log(APIURL + 'getCampaignSubmission');
      $http
        .post(APIURL + 'getCampaignSubmission', campaign_id_query)
        .success(function (data) {
          console.log('cSI', 'getting data 2');
          if (angular.isObject(data) && data.success) {
            console.log('cSI', data);
            $scope.showIdContent = data.campaign_submission;
          }
        });
    } else {
      $scope.showForm = true;
    }


    // Load issues for the current active campaign.
    function get_campaign_issues() {
      var campaign_id = $rootScope.customisation.campaign.id;
      if ( ! campaign_id ) {
        logger('no campaign id found:', campaign_id);
        return;
      }
      var jsondata = JSON.stringify({
          "campaign_id": campaign_id
      });

      $scope.campaignSubmissionList = [];
      return campaignSubmissionsService.getCampaignSubmissions(jsondata).then(function (data) {
          var getdata = data.data;
          if ( getdata && getdata.success ) {
            $scope.campaignSubmissionList = getdata.campaign_submissions;
          }
      });
    };

    // Retrieve a specific campaign based on the url. If not specific campaign
    // is requested, show the first found active campaign. If no valid
    // campaign can be found, show a message.
    var campaign_slug = $routeParams.slug;
    var campaign_query = {
      organisation_id: $rootScope.customisation.organisation_id
    };
    if ( ! campaign_slug ) {
      campaign_query.active_only = true;
    }
    campaign_query = JSON.stringify(campaign_query);
    // Default campaign with "not found" settings. Updated if a matching
    // campagin is found;
    var campaign = {
      id: 0,
      title: 'Geen campagne gevonden',
      url_title: '',
      description: '',
      question: '',
      background_image: '../img/background_fietsersbond.jpg',
      //logo: 'http://meldpunt.fietsersbond.nl/images/logo.png',
      logo_text_up: 'Geen campagne',
      logo_text_down: 'Gevonden',
      has_answer: false,
      answer_title: '',
      has_photo: false,
      start_date: undefined,
      end_date: undefined,
      active: false,
    };

    // Something something Safari..
    function Date_parse(s) {
      var s = s.split(/[^0-9]/);
      return new Date(s[0],s[1]-1,s[2]);
    }

    // TODO FB: to conform to the existing setup, build a campaignsService
    // factory and use that.
    $http
      .post(APIURL + 'campaigns', campaign_query)
      .success(function (data) {

        if (angular.isObject(data) && data.success) {
          // No slug, take the first active:
          if ( ! campaign_slug && data.campaigns.length ) {
            campaign = data.campaigns[0];
          // With slug, find matching campaign.
          } else {
            for(var i=0; i<data.campaigns.length; i++) {
              if ( data.campaigns[i].url_title === campaign_slug ) {
                campaign = data.campaigns[i];
              }
            }
          }
        }

        // Parse the campaign dates/activity.
        if ( campaign.start_date && campaign.end_date ) {
          var start_date = Date_parse(campaign.start_date);
          var end_date = Date_parse(campaign.end_date);
          var date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          campaign.start_date = start_date.toLocaleDateString('nl-NL', date_options);
          campaign.end_date = end_date.toLocaleDateString('nl-NL', date_options);
          var today = new Date();
          if ( today > end_date ) {
            $scope.inactive_campaign_message = 'De uiterste termijn van deze campagne is verlopen.';
          } else if ( ! campaign.active ) {
            $scope.inactive_campaign_message = 'Deze campagne is nu niet actief.';
          } else {
            $scope.active_campaign = true;
          }
        } else {
          $scope.inactive_campaign_message = 'De campagne is niet gevonden.';
        }

        // Set the campaign data.
        $rootScope.customisation.campaign = campaign;
        // Set the left-top site logo text.
        $rootScope.customisation.logo_text_up = campaign.logo_text_up;
        $rootScope.customisation.logo_text_down = campaign.logo_text_down;
        // Set the page background.
        $('#background-customisation-image').css('background-image', "url('"+$rootScope.customisation.campaign.background_image+"')");
        // Retrieve issues for this campaign.
        get_campaign_issues();
      })
      .error(function(data, status, headers, config){
        logger("campaigns.http.post.error:")
        errorhandler($rootScope,{url:config.url,'data':config.data,'status':status,'message':data})
      });

    $scope.privateMessageHide = false;
    $rootScope.dynamicTitle = "Campagne |";
    $rootScope.lastUrl = $location.path();

    if ( $rootScope.formDataBeforeLogin ) {
      $scope.categoryId = $rootScope.formDataBeforeLogin.categoryId;
      $scope.title = $rootScope.formDataBeforeLogin.title;
      $scope.description = $rootScope.formDataBeforeLogin.description;
    }

    $scope.hide = "ng-hide";
    $scope.issueName = "Probleem"
    $scope.hideIssue = 1;
    $scope.myIssueCount = 0;
    $scope.slide = "";
    $scope.initslide = "toggle-button";
    $scope.loadCategory = 1;
    $scope.count = 0;
    $scope.standardMessage = "";
    $rootScope.urlBefore = $location.path();

    $scope.notify = false;
    $scope.newsletter = false;
    $scope.email = "";
    $scope.username = "";
    $scope.password = "";

    $timeout(function () {
        $scope.slide = "toggle-button-selected-left";
    }, 0)

    if ($cookies.getObject('user')) {
        $scope.hideLogin = true
    } else {
        $scope.hideLogin = false;
    }

    //first initial
    $timeout(function () {

        // TODO FB: on the campaign_thanks page, there is no searchCityProblem,
        // the code below probably gives a small error. Check here, and test
        // if the normal campaigns stil work properly.
        var issueMarker = googleMapCreateProblem($rootScope);
        attachAutoCompleteListener('searchCityProblem',issueMarker,map3,"location-campagne");
    }, 1500);

    // TODO FB: see if it possible to also store an uploaded image..
    // Remember fields filled in before moving away from the login page.
    $scope.rememberFormBeforeLogin = function($event) {
      $rootScope.formDataBeforeLogin = {
        title: $scope.title,
        categoryId: $scope.categoryId,
        description: $scope.description,
      };
      logger('formDataBeforeLogin',$rootScope.formDataBeforeLogin);
    }

    $scope.clickSearchCreateIssue = function () {
        if(document.getElementById('searchCityProblem').value){
           var citytemp = document.getElementById('searchCityProblem').value ;
           city.long_name =  citytemp.substring(citytemp.lastIndexOf(',')+1).replace(" ","");
           $location.path('/gemeente/'+city.long_name+'/nieuw-probleem',false);
        }
        $rootScope.lastCity = city.long_name;
        $timeout(function(){
            marker.setPosition(map3.getCenter());
        },1000)
    }

    // Set the map position to that of the given campaign "issue-like" item.
    $scope.highlightCampaignSubmission = function(cS) {
      moveMapToIssue(cS, null);
      // `marker` is the marker on `map3`, the small map for issues.
      marker.setPosition(issueLocationToGoogleLocation(cS.location));
    }

    $scope.createIssue = function () {
        $rootScope.globaloverlay = "active";
        $scope.errorDescription = "";
        $scope.errorLocation = "";
        $scope.errorSurname = "";
        $scope.errorEmail = "";

        //initial data for request
        var submission = {};
        var location = {};
        var file = $scope.imgData;

        //login
        if ($cookies.getObject('user')) {
          submission.name = $cookies.getObject('user').username;
          submission.email = $cookies.getObject('user').email;
        }
        //not login
        else {
          submission.name = $scope.surname;
          submission.email = $scope.email;
        }

        if ($scope.description) {
          submission.answer = $scope.description;
        }
        submission.campaign_id = $rootScope.customisation.campaign.id;
        submission.organisation_id = $rootScope.customisation.organisation_id;
        submission.notify = $scope.notify;
        submission.newsletter = $scope.newsletter;

        //location
        location.latitude = markerLat;
        location.longitude = markerLng;
        logger("createlat:"+location.latitude);
        logger("createlong:"+location.longitude);

        var jsondataSubmit = {
            campaign_submission : submission,
            location : {
                latitude : location.latitude,
                longitude : location.longitude
            }
        }

        jsondataSubmit = JSON.stringify(jsondataSubmit);

        if (file) {
            campaignIssueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file).then($scope.handleSubmit);
        } else {
            campaignIssueSubmitService.getIssueSubmit(jsondataSubmit).then($scope.handleSubmit);
        }
    }

    $scope.handleSubmit = function(data) {

        var issueData = data.data;
        if (!issueData.success) {
            $scope.hide = "";
            if (issueData.errors.answer) {
                $scope.errorDescription = "Beschrijving " + issueData.errors.answer;
            }
            if (issueData.errors.location) {
                $scope.errorLocation = issueData.errors.location;
            }
            if (issueData.errors.name) {
                $scope.errorSurname = "Naam " + issueData.errors.name;
            }
            if (issueData.errors.email) {
                $scope.errorEmail = issueData.errors.email;
            }
            $rootScope.globaloverlay = "";
            $(window).scrollTop(0);
        } else if (issueData.success == "false") {
            $scope.hide = "";
            $scope.errorEmail = issueData.error;
            $rootScope.globaloverlay = "";
            $(window).scrollTop(0);
        } else {
            //success
            $rootScope.successCreate = 1;
            var issueId = issueData.issue_id;
            if ($cookies.getObject('user')) {
                $rootScope.successCreateLogin = 1;
            }
            var to = campaign_slug ? campaign_slug: '';
            $location.path('/campagne-bedankt/'+to);
            $rootScope.globaloverlay = "";
            //$scope.updateMapIssues();
        }
    }

    $scope.alrCityCreate = function () {
        logger('alrCityCreate');
        //Get city problem when click/drag
        $scope.updateCouncilReport(city.long_name);
        $scope.updateCouncilAgreement(city.long_name);
        $scope.updateMapIssues();
    }

    $scope.close = function () {
        $scope.hide = "ng-hide";
    }

    $scope.reset = function () {
        $scope.title = "";
        $scope.description = "";
    }
}])
