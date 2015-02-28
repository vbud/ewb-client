'use strict';
/*jshint esnext: true */

function CircleService(DataService, ColorService) {

    var shapeData, g, svg;

    function create(sel) {
      g = sel.append('g')
      svg = g.append('circle');
    }

    function draw(x, y) {
      if(shapeData === undefined) {
        shapeData = {
          type: 'circle',
          translate: {
            x: x,
            y: y
          },
          cx: 0,
          cy: 0,
          r: 0,
          fill: ColorService.getFill(),
          stroke: ColorService.getStroke(),
          'stroke-width': 2
        };
        g.attr('transform', 'translate(' + x + ',' + y + ')');
        svg.attr({
              cx: shapeData.cx,
              cy: shapeData.cy
            })
            .style({
              fill: shapeData.fill,
              stroke: shapeData.stroke,
              'stroke-width': shapeData['stroke-width']
            })
      } else {
        var dx = x - shapeData.translate.x,
            dy = y - shapeData.translate.y;
        shapeData.r = Math.sqrt( dx*dx + dy*dy );
      }

      svg.attr('r', shapeData.r);
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

  }

export default CircleService;
