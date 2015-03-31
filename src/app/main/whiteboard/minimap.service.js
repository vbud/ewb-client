'use strict';

angular.module('ewbClient')
// Handles the minimap view
.service('MinimapService', function() {

  // minimap needs to share same ratio as SvgService.canvas w, h
  var size = {
    w: 128,
    h: 128
  };

  // selections
  var selections = {
    g: undefined,
    canvas: undefined,
    viewbox: undefined
  };

  var interpolateX = d3.interpolateNumber(0, size.w),
      interpolateY = d3.interpolateNumber(0, size.h);

  function setup(svg, view, canvas) {

    // Setup the minimap
    selections.g = svg.append('g')
        .classed('minimap', true)
        .attr('transform', 'translate(' + (view.w - size.w - 10) + ',' + (view.h - size.h - 10) + ')')
    selections.canvas = selections.g.append('rect')
        .classed('canvas', true)
        .attr('width', size.w)
        .attr('height', size.h)
    selections.viewbox = selections.g.append('rect')
        .classed('viewbox', true)

    update(view, canvas);
  }

  // TODO: make this work with zoom (once I re-enable zoom)
  function update(view, canvas) {

    selections.viewbox
      .attr('width', interpolateX( view.w/canvas.w ))
      .attr('height', interpolateY( view.h/canvas.h ))
      .attr('x', interpolateX( view.x/canvas.w ))
      .attr('y', interpolateY( view.y/canvas.h ))
  }

  return {
    get selections() { return selections; },

    setup: setup,
    update: update
  };

});
