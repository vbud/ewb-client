'use strict';

angular.module('ewbClient')
// Manages the mode (available and current modes)
.service('DrawService', function($rootScope, SvgService, PolylineService, LineService, RectangleService, CircleService, EllipseService) {

  var view = SvgService.view,
      g = SvgService.selections.g;

  var shapeToServiceMap = {
    polyline: PolylineService,
    line: LineService,
    rectangle: RectangleService
    circle: CircleService,
    ellipse; EllipseService
  };

  // Map behaviors to each shape service
  var shapeToBehaviorMap = _.mapValues(serviceMap, function(service) {
    return d3.behavior.drag()
        .on('dragstart', function() {
          service.create(g);
        })
        .on('drag', function() {
          service.draw(d3.event.x + view.x, d3.event.y + view.y);
        })
        .on('dragend', function(d) {
          service.finish();
        })
  }


  var textWriter = false;
  var writeText = function() {
    // close the text writer if it is currently open
    if(textWriter) {
      $rootScope.$broadcast('textWriter:close');
      textWriter = false;
    }
    // open the text writer if it is currently closed
    else {
      $rootScope.$broadcast('textWriter:open');
      textWriter = true;
    }

    // If the text writer is already active, save it
    if( scope.textWriter.active ) {
      scope.$apply( function() {
        scope.textWriter.active = false;
      })
      // Only save if any text was written in the text box
      var text = scope.textWriter.textarea.val();
      if(text.length > 0) {
        DataService.add({
          type: 'text',
          translate: {
            x: parseInt(scope.textWriter.style.left),
            y: parseInt(scope.textWriter.style.top)
          },
          x: 0,
          y: 0,
          text: text,
          fill: scope.textWriter.style.color,
          stroke: 'none',
          'stroke-width': 0,
          'font-size': scope.textWriter.style['font-size'],
          'font-style': 'normal'
        });
      }
      // Empty the text writer
      scope.textWriter.textarea.val('');
    }
    // Otherwise, create the text writer and position it correctly
    else {
      scope.$apply( function() {
        scope.textWriter.active = true;
        scope.textWriter.style.top = d3.event.clientY + 'px';
        scope.textWriter.style.left = d3.event.clientX + 'px';
      })
      scope.textWriter.textarea.focus();
    }

  }
  var erase = function(d) {
    DataService.remove(d);
  }

  return {
    // given a shape, return the appropriate d3 behavior
    get behavior() {
      return shapeToBehaviorMap;
    },
    text: writeText,
    erase: erase
  }
});
