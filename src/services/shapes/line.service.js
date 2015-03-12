'use strict';

angular.module('ewbClient')
.service('LineService', function (DataService, ColorService) {

  var shapeData, g, svg;

  function create(sel) {
    g = sel.append('g')
    svg = g.append('line');
  }

  function draw(x, y) {
    if(shapeData === undefined) {
      shapeData = {
        type: 'line',
        translate: {
          x: x,
          y: y
        },
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        stroke: ColorService.getStroke(),
        'stroke-width': 2
      };
      g.attr('transform', 'translate(' + x + ',' + y + ')');
      svg.attr({
        x1: shapeData.x1,
        y1: shapeData.y1
      })
      svg.style({
        stroke: shapeData.stroke,
        'stroke-width': shapeData['stroke-width']
      })
    } else {
      shapeData.x2 = x - shapeData.translate.x;
      shapeData.y2 = y - shapeData.translate.y;
    }
    svg.attr({
      x2: shapeData.x2,
      y2: shapeData.y2
    })
  }

  function finish() {
    //remove the existing svg, as it will be re-rendered
    g.remove();

    //send the data to DataService, if there is any data to send
    // NOTE: if #finish is called and nothing has been drawn, then there will be no data to send. This is why we check if the data even exists.
    if(shapeData !== undefined) DataService.add(shapeData);

    //undefine all local variables
    shapeData = undefined;
    g = undefined;
    svg = undefined;
  }

  return {
    create: create,
    draw: draw,
    finish: finish
  };

});
