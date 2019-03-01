
//var vdbApp = angular.module('vdbApp',[]);
var vdbApp = angular.module('vdbApp', 
    ['ngRoute', 
     'angularUtils.directives.dirPagination', 
     'ngFacebook', 
     'ngCookies', 
     'naif.base64',
     'angulartics', 
     'angulartics.google.analytics']);

 var LOGGING = false; 
var LOGGING = true; 

var PROTOCOL = "https";
// var PROTOCOL = "http";

 var ROOT = "www.verbeterdebuurt.nl/";
//var ROOT = "staging.verbeterdebuurt.nl/";

var API_VERSION = "api.php/json_1_3/";

var APIURL = PROTOCOL + "://" + ROOT + API_VERSION;

var ISSUE_TYPE_PROBLEM = "problem";
var ISSUE_TYPE_IDEA = "idea";

var RECENT_ISSUES_TO_SHOW = 3;
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
/*    rootScope.globaloverlay="";
    $("#errorModal").modal({backdrop: 'static', keyboard: false});
    $("#errorModal").modal('show');
    $("#errorModal").on('click','#errorModalRedirect',function(){
        $('#errorModal').modal('hide');
        $('.modal-backdrop').hide();
    });
*/    
};

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
    $scope.mentionSelected = "";
    $scope.myIssuesSelected = "";

    switch (selected) {
    case 'home':
        $scope.homeSelected = "active"
        break;
    case 'createissue':
        $scope.mentionSelected = "active"
        break;
    case 'myIssues':
        $scope.myIssuesSelected = "active"
        break;
    }
};


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
            logger('newsletterService.getNewsletter('+jsondata+')');
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
        getIssueSubmit: function (jsondata, img) {
            logger('issueSubmitServiceWithImage.getIssueSubmit('+jsondata+')');
            var dataForm = new FormData();
            dataForm.append('json', jsondata);
            dataForm.append('image', img);
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

vdbApp.controller('mainCtrl', ['$scope', '$q','$timeout', '$window', '$location', '$rootScope', '$routeParams', '$http', 'issuesService', 'reportService', '$facebook', '$cacheFactory', 'agreementSevice', '$cookies','myIssuesService', function ($scope, $q,$timeout, $window, $location, $rootScope, $routeParams, $http, issuesService, reportService, $facebook, $cacheFactory, agreementSevice, $cookies, myIssuesService) {
    
    var mainController = this;

    //very hacky, should be removed when making the google maps a service with the proper dependencies
    user = $cookies.getObject('user');
    userProfile = $cookies.getObject('user_profile');

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
        logger("updateMyIssues -->" + $cookies.getObject('user'));
        if ($cookies.getObject('user')) {
            var jsondata = {}
            jsondata.user = $cookies.getObject('user');
            jsondata = JSON.stringify(jsondata);
            logger(jsondata);
            myIssuesService.getMyIssues(jsondata).then(function (data) {
                logger("retrieving:");
                logger(data.data);
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
        return $rootScope.zoom >= $rootScope.pinsVisibleZoom;
    }

    $scope.zoomedInEnoughToRetrieveIssues = function() {
        return $rootScope.zoom >= $rootScope.retrieveIssuesZoom;
    }
    $scope.updateMapIssues = function() {
        logger("updateMapIssues");

        checkZoomLevel($rootScope);

        if ($scope.zoomedInEnoughToRetrieveIssues()) {
            var jsondata = JSON.stringify({
                "coords_criterium": {
                    "max_lat": map.getBounds().getNorthEast().lat(),
                    "min_lat": map.getBounds().getSouthWest().lat(),
                    "max_long": map.getBounds().getNorthEast().lng(),
                    "min_long": map.getBounds().getSouthWest().lng()
                }
            });
            var getIssues = issuesService.getIssues(jsondata).then(function (data) {
                var getdata = data.data;                        

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
        reportService.getReport(JSON.stringify({"council": "" + city + ""})).then(function (data) {                
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

vdbApp.controller('loginCtrl', ['$scope', '$rootScope', '$window', 'loginService', '$location', '$facebook', '$cookies', function ($scope, $rootScope, $window, loginService, $location, $facebook, $cookies) {
    $rootScope.dynamicTitle = "Login |";
    $scope.hide = "ng-hide";
    $scope.lusername = "";
    $scope.lpassword = "";

    //$scope.overlay ACTIVE WHENclick and overlay when no event
    $scope.overlay = "overlay";


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
        } else {

        }
    });

    $scope.FBlogin = function () {
        $facebook.login();
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
                expired.setHours(expired.getHours() +2);
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
                expired.setHours(expired.getHours() +2);
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


vdbApp.controller('registerCtrl', ['$scope', '$rootScope', '$window', 'registerService', 'newsletterService', '$location', '$facebook', function ($scope, $rootScope, $window, registerService, newsletterService, $location, $facebook) {
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
                "ondernemingsdossierID": "" + ondernemingsdossierID
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
                        expired.setHours(expired.getHours() +2);
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
                        expired.setHours(expired.getHours() +2);
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
        $location.path(path);
    }
}])

vdbApp.controller('createProblemCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'categoriesService', 'issueSubmitService', 'myIssuesService', '$location', 'issuesService', 'issueSubmitServiceWithImage', 'duplicateIssuesService', '$cookies', 'serviceStandardService','reportService','issuesService','agreementSevice','$routeParams', function ($scope, $rootScope, $window, $timeout, categoriesService, issueSubmitService, myIssuesService, $location, issuesService, issueSubmitServiceWithImage, duplicateIssuesService, $cookies, serviceStandardService,reportService,issuesService,agreementSevice,$routeParams) {
    logger('createProblemCtrl');
    $scope.privateMessageHide = false;
    if($location.path().includes('nieuwe-melding')){
        $rootScope.dynamicTitle = "Nieuwe melding |";
    } else {
        $rootScope.dynamicTitle = "Nieuw probleem |";
    }
    $rootScope.lastUrl = $location.path();

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
         
        var issueMarker = googleMapCreateProblem();
        attachAutoCompleteListener('searchCityProblem',issueMarker,map3,"location", $scope);        
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
            var getCategories = categoriesService.getCategories(jsondataCity).then(function (data) {
                $scope.categoriesList = data.data.categories;
                $timeout(function () {
                    $scope.loadCategory = 0;
                })
            });


        }, 3000)
    }


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

        //initial data for request
        var user = {};
        var user_profile = {};
        var issue = {};
        var location = {};
        var file = $scope.imgData;
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
        }

        //description
        issue.type = "problem";
        if ($scope.categoryId) {
            issue.category_id = $scope.categoryId;
        } else {
            issue.category_id = -1;
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
        
        var jsondataSubmit = {
            issue : {
                title : issue.title,
                description :  issue.description,
                type :  issue.type,
                category_id :  issue.category_id,
                private_message : issue.privateMessage
            }, 
            location : {
                latitude : location.latitude,
                longitude : location.longitude
            }
        }

        if ($cookies.getObject('user')) { //login
            jsondataSubmit.user = {username:user.username,password_hash:user.password_hash}
        } else {
            jsondataSubmit.user = {email:user.email}
            jsondataSubmit.user_profile = user_profile;
        }
       
        jsondataSubmit = JSON.stringify(jsondataSubmit);

        if (file) {
            issueSubmitServiceWithImage.getIssueSubmit(jsondataSubmit, file).then($scope.handleSubmit);
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
        var issueMarker = googleMapCreateIdea();
        attachAutoCompleteListener('searchCityProblem',issueMarker,map4,"location2");
        $scope.getServiceStandard(city.long_name);
    }, 1500);


    if ($cookies.getObject('user')) {
        $scope.hideNonLogin = "ng-hide"
    }

    //this is really bad, it should be combined with problem
    $scope.getServiceStandard = function(council,category_id) {
        logger("createIdeaController.getServiceStandard("+council+")")
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
                    "private_message" : issue.privateMessage
                    
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
                    "phone" : $scope.phone                   
                }, 
                "issue" : {
                    "title" : issue.title,
                    "description" :  issue.description,
                    "type" : issue.type,
                    "realization" : issue.realization,
                    "private_message" : issue.privateMessage
                    
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
