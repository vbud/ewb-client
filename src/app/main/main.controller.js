'use strict';
/*jshint esnext: true */

function MainCtrl($scope, DataService, ModeService, ColorService) {

  $scope.newWhiteboardName = undefined;
  $scope.whiteboards = undefined;
  $scope.activeWhiteboard = undefined;

  // Expose the DataService functions to the scope
  $scope.createWhiteboard = DataService.createWhiteboard;
  $scope.deleteWhiteboard = DataService.deleteWhiteboard;
  $scope.changeWhiteboard = DataService.changeWhiteboard;

  $scope.isActiveMode = function(name) {
    if( ModeService.isActive(name) ) return true;
  }
  $scope.setActiveMode = function(name) {
    ModeService.setActive(name);
  }

  // Listen for new available whiteboards
  $scope.$on('whiteboards:available', function(event, d) {
    $scope.whiteboards = d;
  })
  // Listen for new active whiteboard
  $scope.$on('whiteboards:active', function(event, d) {
    $scope.activeWhiteboard = d;
  })



  // Listen for new fill, stroke, and text colors
  // $scope.$on('color:fill', function(event, color) {
  //   $scope.fillColor = color;    
  // })
  // $scope.$on('color:stroke', function(event, color) {
  //   $scope.strokeColor = color;
  // })
  // $scope.$on('color:text', function(event, color) {
  //   $scope.textColor = color;
  // })

  $scope.fillColor = ColorService.getFill();
  $scope.strokeColor = ColorService.getStroke();
  $scope.textColor = ColorService.getText();
}

MainCtrl.$inject = ['$scope', 'DataService', 'ModeService', 'ColorService'];

export default MainCtrl;
