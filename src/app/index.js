'use strict';

angular.module('ewbClient', ['ui.router', 'ngMaterial', 'btford.socket-io'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainCtrl'
    });

  $urlRouterProvider.otherwise('/');
});
