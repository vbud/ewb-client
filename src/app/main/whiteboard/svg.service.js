'use strict';

angular.module('ewbClient')
.service('SvgService', function(DataService, MinimapService, DrawService) {

  // size of the available canvas
  var canvas = {
    w: 4096,
    h: 4096
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

  var zoom;


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
      });

  function updateMinimap() {
    MinimapService.update(view, canvas);
  }

  function bindCanvasBehaviors(mode) {
    // Make the canvas draggable and zoomable if we are in pan mode, otherwise remove the behavior
    if( mode === 'pan' ) selections.gCanvas.call(zoom);
    else selections.gCanvas.on('.zoom', null); //switch back to 'mousedown.zoom' if this doesn't work

    // NOTE: add any new modes that affect the canvas should be added here
    // If we are in any of the modes that require dragging behavior on the canvas
    if( _.contains(['polyline', 'line', 'rectangle', 'circle', 'ellipse'], mode) ) {
      // Add drag behavior to the canvas to draw the shape specified by mode
      selections.gCanvas.call( DrawService.behavior[mode] );
    }
    // Otherwise remove the drag behavior from the canvas
    else selections.gCanvas.on('.drag', null); //switch back to 'mousedown.drag' if this doesn't work

    // Add click behavior to canvas in order to write text
    if( mode === 'text' ) selections.gCanvas.on('click', DrawService.toggleText, true); // capture flag set to true
    else selections.gCanvas.on('click', null);
  }

  function bindSelectionBehaviors(mode) {
    // Add drag behavior to all SVG elements if we are in select mode
    if( mode === 'select' ) selections.updating.call(grab);
    else {
      selections.updating.on('.drag', null);
      // selectBox.rect.classed('show', false);
    }

    // Add click behavior to all SVG elements if we are in erase mode
    if( mode === 'erase' ) selections.updating.on('click', DrawService.erase);
    else selections.updating.on('click', null);
  }

  // Updates the whiteboard mode, binding behaviors accordingly
  // NOTE: all new modes (and existing ones) should be careful not to remove event listeners that another mode is listening for. For example, look at how all the canvas dragging behaviors are handled together, with a single else statement to remove listeners only if none of those modes are active.
  function bindBehaviors(mode) {
    bindCanvasBehaviors(mode);
    bindSelectionBehaviors(mode);
  }

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
    selections.g.attr('transform', 'translate(' + t + ')scale(' + s + ')')
    // Update view position
    view.x = -t[0]
    view.y = -t[1]

    updateMinimap();
  }



  function setup(element) {
    view.w = element[0].clientWidth;
    view.h = element[0].clientHeight;

    // Setup the canvas
    selections.svg = d3.select( element[0] ).append('svg')
        .attr('width', canvas.w)
        .attr('height', canvas.h)
    selections.gCanvas = selections.svg.append('g')
    selections.g = selections.gCanvas.append('g')
    selections.g.append('rect')
      .attr('class', 'overlay')
      .attr('width', canvas.w)
      .attr('height', canvas.h)

    // Select something so updateMode doesn't fail when there is no data
    selections.updating = selections.g.selectAll('g')

    zoom = d3.behavior.zoom()
        .scaleExtent([1, 1]) // disable zooming for now
        .on('zoom', pan)

    DrawService.setup(view, selections.g);

    MinimapService.setup(selections.svg, view, canvas);
  }



  return {
    get canvas() { return canvas; },
    get view() { return view; },

    get selections() { return selections; },

    updateMinimap: updateMinimap,
    bindBehaviors: bindBehaviors,
    bindSelectionBehaviors: bindSelectionBehaviors,

    setup: setup
  }
});
