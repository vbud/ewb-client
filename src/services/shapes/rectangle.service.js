'use strict';

angular.module('ewbClient')
.service('RectangleService', function (DataService, ColorService) {

	var shapeData, g, svg;

	function create(sel) {
		g = sel.append('g')
		svg = g.append('rect');
	}

	function draw(x, y) {
		if(shapeData === undefined) {
			shapeData = {
				type: 'rect',
  			translate: {
  				x: x,
  				y: y
  			},
  			x: 0,
  			y: 0,
        width: 0,
        height: 0,
        fill: ColorService.getFill(),
  			stroke: ColorService.getStroke(),
  			'stroke-width': 2
  		};
  		g.attr('transform', 'translate(' + x + ',' + y + ')');
  		svg.style({
        fill: shapeData.fill,
  			stroke: shapeData.stroke,
  			'stroke-width': shapeData['stroke-width']
  		})
		} else {
      var dx = x - shapeData.translate.x,
          dy = y - shapeData.translate.y;

      if(dx < 0) shapeData.x = dx; //if x goes negative
      else shapeData.x = 0; //if x goes positive
      if(dy < 0) shapeData.y = dy; //if y goes negative
      else shapeData.y = 0; //if y goes positive

			shapeData.width = Math.abs(dx);
			shapeData.height = Math.abs(dy);
		}

		svg.attr({
      x: shapeData.x,
      y: shapeData.y,
			width: shapeData.width,
			height: shapeData.height
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
