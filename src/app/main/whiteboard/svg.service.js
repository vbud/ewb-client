'use strict';

angular.module('ewbClient')
.service('SvgService', function() {

  // size of the available canvas
  var canvas = {
        w = 4096,
        h = 4096
      };
  // size and position of current view (canvas is larger than the view)
  var view = {
        x: 0,
        y: 0,
        w: undefined,
        h: undefined
      };

  // d3 selections for parent elements, update/enter/exit
  var selections = {
    svg: undefined,
    gCanvas: undefined,
    g: undefined,
    updating: undefined,
    entering: undefined,
    exiting: undefined
  }

  function setup(element) {
    view.w = element[0].clientWidth;
    view.h = element[0].clientHeight;

    // Setup the canvas
    svg = d3.select( element[0] ).append('svg')
        .attr('width', canvas.w)
        .attr('height', canvas.h)
    gCanvas = svg.append('g')
    g = gCanvas.append('g')
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', canvas.w)
      .attr('height', canvas.h)

    // Select something so updateMode doesn't fail when there is no data
    updating = g.selectAll('g')
  }

  return {
    get canvas() { return canvas; },
    get view() { return view; },

    get selections() { return selections; },

    setup: setup
  }
});
