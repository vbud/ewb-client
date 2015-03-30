'use strict';

angular.module('ewbClient')
// Manages the mode (available and current modes)
.service('ModeService', function(SvgService, MinimapService) {

  var modes, activeMode;

  var canvas, view;
  var gCanvas, g, updating, entering, exiting;

  var zoom;



  function pan() {
    var t = d3.event.translate,
        s = d3.event.scale;

    // prevent panning to the left and right of the canvas
    if(t[0] > 0) t[0] = 0;
    else if(t[0] - view.w < - canvas.w) t[0] = view.w - canvas.w;

    // prevent panning above and below the canvas
    if(t[1] > 0) t[1] = 0;
    else if(t[1] - view.h < - canvas.h) t[1] = view.h - canvas.h;

    // old code that was also trying to handle zooming (scaling) but didn't succeed at anything
    // t[0] = Math.min(w / 2 * (s - 1), Math.max(w/2 * (1 - s) - view.w/2 * s, t[0]))
    // t[0] = Math.min(w / 2 * (s - 1), Math.max(w * (0.5 - s), t[0]));
    // t[1] = Math.min(h / 2 * (s - 1), Math.max(h/2 * (1 - s) - view.h/2 * s, t[1]));
    // t[1] = Math.min(h / 2 * (s - 1), Math.max(h * (0.5 - s), t[1]))

    zoom.translate(t)
    g.attr('transform', 'translate(' + t + ')scale(' + s + ')')
    // Update view position
    view.x = -t[0]
    view.y = -t[1]

    MinimapService.update();
  }



  // store the initial drag offset from the origin
  var dragOffset = {
    x: undefined,
    y: undefined
  };
  var grab = d3.behavior.drag()
      .on('dragstart', function(d) {
        var thisguy = d3.select(this);
            // boundingRect = thisguy.node().getBoundingClientRect();

        dragOffset.x = d3.mouse(this)[0];
        dragOffset.y = d3.mouse(this)[1];
        thisguy.classed('dragging', true);
        // position and show the dashed line selection box
        // selectBox.rect.attr({
        //   x: boundingRect.left,
        //   y: boundingRect.top,
        //   width: boundingRect.width,
        //   height: boundingRect.height
        // })
        // selectBox.rect.classed('show', true);

      })
      .on('drag', function(d) {
        var thisguy = d3.select(this);
//                    boundingRect = thisguy.node().getBoundingClientRect();
        thisguy.attr('transform', 'translate(' + (d3.event.x - dragOffset.x) + ',' + (d3.event.y - dragOffset.y) + ')');
        // selectBox.rect.attr({
        //   x: boundingRect.left,
        //   y: boundingRect.top,
        //   width: boundingRect.width,
        //   height: boundingRect.height
        // })
        // TODO: replace the above selectBox stuff
        // use d3.event.dx and dy
      })
      .on('dragend', function(d) {
        d3.select(this).classed('dragging', false);

        var newX = d3.event.sourceEvent.x + view.x - dragOffset.x,
            newY = d3.event.sourceEvent.y + view.y - dragOffset.y;
        // Only update the data if the object has actually moved (dragstart fires on mousedown)
        if(newX !== d.translate.x && newY !== d.translate.y) {
          // Just send the data that was updated (translate data), along with an id
          DataService.add({
            id: d.id,
            translate: {
              x: newX,
              y: newY
            }
          });
        }

      })



  function bindCanvasBehaviors() {
    // Make the canvas draggable and zoomable if we are in pan mode, otherwise remove the behavior
    if( activeMode === 'pan' ) gCanvas.call(zoom);
    else gCanvas.on('.zoom', null); //switch back to 'mousedown.zoom' if this doesn't work

    // NOTE: add any new modes that affect the canvas should be added here
    // If we are in any of the modes that require dragging behavior on the canvas
    if( _.contains(['polyline', 'line', 'rectangle', 'circle', 'ellipse'], activeMode) ) {
      // Add drag behavior to the canvas to draw the shape specified by activeMode
      gCanvas.call( DrawService.behavior[activeMode] );
    }
    // Otherwise remove the drag behavior from the canvas
    else gCanvas.on('.drag', null); //switch back to 'mousedown.drag' if this doesn't work

    // Add click behavior to canvas in order to write text
    if( activeMode === 'text' ) gCanvas.on('click', DrawService.toggleText, true); // capture flag set to true
    else gCanvas.on('click', null);
  }

  function bindSelectionBehaviors() {
    // Add drag behavior to all SVG elements if we are in select mode
    if( activeMode === 'select' ) updating.call(grab);
    else {
      updating.on('.drag', null);
      // selectBox.rect.classed('show', false);
    }

    // Add click behavior to all SVG elements if we are in erase mode
    if( activeMode === 'erase' ) updating.on('click', DrawService.erase);
    else updating.on('click', null);
  }

  // Updates the whiteboard mode, binding behaviors accordingly
  // NOTE: all new modes (and existing ones) should be careful not to remove event listeners that another mode is listening for. For example, look at how all the canvas dragging behaviors are handled together, with a single else statement to remove listeners only if none of those modes are active.
  function bindBehaviors() {
    bindCanvasBehaviors();
    bindSelectionBehaviors();
  }



  function setup() {
    modes = ['pan', 'select', 'polyline', 'line', 'rectangle', 'circle', 'ellipse', 'text', 'erase'];
    activeMode = 'pan'; // pan is active mode by default

    canvas = SvgService.canvas,
    view = SvgService.view,
    gCanvas = SvgService.selections.gCanvas,
    g = SvgService.selections.g,
    updating = SvgService.selections.updating,
    entering = SvgService.selections.entering,
    exiting = SvgService.selections.exiting;

    zoom = d3.behavior.zoom()
        .scaleExtent([1, 1]) // disable zooming for now
        .on('zoom', pan)
  }



  return {
    // checks if a given mode is the active mode
    isActive: function(mode) {
      if( mode === activeMode ) return true;
      else return false;
    },
    getActive: function() {
      return activeMode;
    },
    setActive: function(mode) {
      if( _.contains(modes, mode) ) {
        activeMode = mode;
        bindBehaviors();
      } else {
        console.warn('Mode "' + mode + '" is not one of the ' + modes.length + ' valid modes; therefore, it cannot be set.');
      }
    },
    setup: setup,
    bindBehaviors: bindBehaviors,
    bindSelectionBehaviors: bindSelectionBehaviors
  };
});
