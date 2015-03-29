'use strict';

angular.module('ewbClient')
// Manages the selected items and the box around selected elements
.service('SelectedService', function(SvgService) {

  var size = {
    w: 0,
    h: 0
  };
  var rect;

  function setup() {
    // Setup the selection rect
    rect = svg.append('rect')
        .classed('selection-box', true);
  }

  return {
    setup: setup
  }
});