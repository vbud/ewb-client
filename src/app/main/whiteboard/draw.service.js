'use strict';

angular.module('ewbClient')
// Manages the mode (available and current modes)
.factory('DrawService', function($rootScope, DataService, PolylineService, LineService, RectangleService, CircleService, EllipseService) {

  var shapeToServiceMap, shapeToBehaviorMap;

  var textWriter = false;

  var toggleText = function() {
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
  }

  var erase = function(d) {
    DataService.remove(d);
  }

  var setup = function(view, g) {

    // Map of shape names to services
    shapeToServiceMap = {
      polyline: PolylineService,
      line: LineService,
      rectangle: RectangleService,
      circle: CircleService,
      ellipse: EllipseService
    };

    // Map behaviors to each shape service
    shapeToBehaviorMap = _.mapValues(shapeToServiceMap, function(service) {
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
    })

  }

  return {
    // given a shape, return the appropriate d3 behavior
    get behavior() {
      return shapeToBehaviorMap;
    },
    toggleText: toggleText,
    erase: erase,
    setup: setup
  }
});
