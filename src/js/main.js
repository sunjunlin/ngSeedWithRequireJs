require.config({
  paths:{
      'angular': '../bower_components/angular/angular.min',
      'angular-router': '../bower_components/angular-route/angular-route.min',   
      'angular-resource': '../bower_components/angular-resource/angular-resource.min'

 
  },
  shim:{
    'angular':{ exports:'angular' },
    'angular-router': { deps: ['angular'] },
    'angular-resource': { deps: ['angular'] }

  }
});

require([
  'angular',
  'angular-router',
  'angular-resource',
  'app',

  'controllers/pendinglist',
   'services/pendinglist',
   'filters/filters'

],function(angular){
  'use strict';
  angular.bootstrap(document, ['wxApp']);
});
