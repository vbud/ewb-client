'use strict';

angular.module('ewbClient')
.service('PolylineService', function (DataService, ColorService) {

	var shapeData, g, svg;

	// append new g and polyline SVGs to d3 selection 'sel'
	function create(sel) {
		g = sel.append('g')
		svg = g.append('polyline');
	}

	function draw(x, y) {
		if(shapeData === undefined) {
			shapeData = {
				type: 'polyline',
  			translate: {
  				x: x,
  				y: y
  			},
  			points: '0,0',
  			fill: 'none', //polyline has no fill (I have to set it explicitly or the browser will try to fill with black as you draw)
  			stroke: ColorService.getStroke(), //get the current fill color
  			'stroke-width': 2
  		};
  		g.attr('transform', 'translate(' + x + ',' + y + ')');
  		svg.style({
  			fill: shapeData.fill,
  			stroke: shapeData.stroke,
  			'stroke-width': shapeData['stroke-width']
  		})
		} else {
			shapeData.points = shapeData.points + ' ' + (x - shapeData.translate.x) + ',' + (y - shapeData.translate.y);	
		}
		
		svg.attr('points', shapeData.points);
	}

	function finish() {
		//remove the existing svg, as it will be re-rendered
		g.remove();

    //TODO: just draw a dot if the user just tapped the canvas? (which calls #finish without having drawn anything)
    //if I do this, I may want to reconsider my create function and just start drawing upon dragstart...

		//send the data to dataService, if there is any data to send
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
