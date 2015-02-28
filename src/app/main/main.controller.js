'use strict';
/*jshint esnext: true */

function MainCtrl($scope, DataService, ModeService, ColorService) {

  $scope.isActiveMode = function(name) {
    if( ModeService.isActive(name) ) return true;
  }
  $scope.setActiveMode = function(name) {
    ModeService.setActive(name);
  }
  // Expose the DataService changeWhiteboard function on the scope
  $scope.changeWhiteboard = DataService.changeWhiteboard;



  // Listen for new available whiteboards
  $scope.$on('whiteboards:available', function(event, data) {
    $scope.whiteboards = data;
  })
  // Listen for new active whiteboard
  $scope.$on('whiteboards:active', function(event, data) {
    $scope.activeWhiteboard = data;
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
