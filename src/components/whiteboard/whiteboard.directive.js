'use strict';

angular.module('ewbClient')
.directive('whiteboard', function ($rootScope, DataService, ModeService, PolylineService, LineService, RectService, CircleService, EllipseService) {

  function link(scope, element, attrs) {

    var w = 4096,
        h = 4096,
        view = {
          x: 0,
          y: 0,
          w: undefined,
          h: undefined
        },
        //needs to be same ratio as w, h
        minimap = {
          w: 128,
          h: 128,
          g: undefined,
          canvas: undefined,
          viewbox: undefined
        },
        // box that goes around an element once it's selected
        selectBox = {
          w: 0,
          h: 0,
          rect: undefined
        };

    var svg, gCanvas, g,
        updating, entering, exiting;

    var data, mode;

    var zoom = d3.behavior.zoom()
            .scaleExtent([1, 1]) //disable zooming for now
            .on('zoom', move)
    var dragOffset = {x: undefined, y: undefined}; //store the initial drag offset from the origin
    var grab = d3.behavior.drag()
            .on('dragstart', function(d) {
              var thisguy = d3.select(this);
//                    boundingRect = thisguy.node().getBoundingClientRect();
              dragOffset.x = d3.mouse(this)[0];
              dragOffset.y = d3.mouse(this)[1];
              thisguy.classed('dragging', true);
              // position and show the dashed line selection box
//                selectBox.rect.attr({
//                  x: boundingRect.left,
//                  y: boundingRect.top,
//                  width: boundingRect.width,
//                  height: boundingRect.height
//                })
//                selectBox.rect.classed('show', true);

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

              var newX = d3.event.sourceEvent.clientX - dragOffset.x,
                  newY = d3.event.sourceEvent.clientY - dragOffset.y;
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
    var draw = d3.behavior.drag()
            .on('dragstart', function() {
              PolylineService.create(g);
            })
            .on('drag', function() {
              PolylineService.draw(d3.event.x + view.x, d3.event.y + view.y);
            })
            .on('dragend', function(d) {
              PolylineService.finish();
            })
    var drawLine = d3.behavior.drag()
            .on('dragstart', function() {
              LineService.create(g);
            })
            .on('drag', function() {
              console.log(d3.event);
              LineService.draw(d3.event.x + view.x, d3.event.y + view.y);
            })
            .on('dragend', function(d) {
              LineService.finish();
            })
    var drawRect = d3.behavior.drag()
            .on('dragstart', function() {
              RectService.create(g);
            })
            .on('drag', function() {
              RectService.draw(d3.event.x + view.x, d3.event.y + view.y);
            })
            .on('dragend', function(d) {
              RectService.finish();
            })
    var drawCircle = d3.behavior.drag()
            .on('dragstart', function() {
              CircleService.create(g);
            })
            .on('drag', function() {
              CircleService.draw(d3.event.x + view.x, d3.event.y + view.y);
            })
            .on('dragend', function(d) {
              CircleService.finish();
            })
    var drawEllipse = d3.behavior.drag()
            .on('dragstart', function() {
              EllipseService.create(g);
            })
            .on('drag', function() {
              EllipseService.draw(d3.event.x + view.x, d3.event.y + view.y);
            })
            .on('dragend', function(d) {
              EllipseService.finish();
            })
    var writeText = function() {

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
          console.log(scope.textWriter.style);
          console.log(d3.event);
          scope.textWriter.style.top = d3.event.clientY + 'px';
          scope.textWriter.style.left = d3.event.clientX + 'px';
          console.log(scope.textWriter.style);
        })
        scope.textWriter.textarea.focus();
      }

    }
    var erase = function(d) {
      // console.log(d);
      DataService.remove(d);
    }

    var minimapInterpX = d3.interpolateNumber(0, minimap.w),
        minimapInterpY = d3.interpolateNumber(0, minimap.h);





    create(); //construct ewhiteboard
    update(); //initial whiteboard update, sans data


    scope.$on('whiteboards:active:data', function(event, data) {
      console.log('Data updated, updating whiteboard...');
      console.log(data);

      update(data);
    })

    scope.$on('mode:update', function(event, _mode) {
      console.log('Mode updated to "' + _mode + '", updating whiteboard...');

      updateMode(_mode);
    })

    ModeService.setActive('select');

    $(element).find('.text-writer textarea').expanding();

    scope.textWriter = {
      element: $(element).find('.text-writer'),
      textarea: $(element).find('.text-writer textarea'),
      active: false,
      style: {
        'top': '0px',
        'left': '0px',
        'font-size': '12px',
        'color': '#000'
      }
    }




    // Constructor
    function create() {

      view.w = element[0].clientWidth;
      view.h = element[0].clientHeight;

      // Setup the canvas
      svg = d3.select( element[0] ).append('svg')
          .attr('width', w)
          .attr('height', h)
      gCanvas = svg.append('g')
      g = gCanvas.append('g')
      g.append('rect')
        .attr('class', 'overlay')
        .attr('width', w)
        .attr('height', h)

      // Setup the minimap
      minimap.g = svg.append('g')
          .classed('minimap', true)
          .attr('transform', 'translate(' + (view.w - minimap.w - 10) + ',' + (view.h - minimap.h - 10) + ')')
      minimap.canvas = minimap.g.append('rect')
          .classed('canvas', true)
          .attr('width', minimap.w)
          .attr('height', minimap.h)
      minimap.viewbox = minimap.g.append('rect')
          .classed('viewbox', true)
      updateMinimap()

      // Setup the selection rect
      selectBox.rect = svg.append('rect')
          .classed('selection-box', true);


      // Select something so updateMode doesn't fail when there is no data
      updating = g.selectAll('g');
    }

    // Updates the visualization with new data (if any)
    function update(newData) {

      // Safely sets attrs 'attrs' and styles 'styles' on a given selection 'sel', only applying the ones specified in data 'd'
      var setAttrsStyles = function(sel, attrs, styles, d) {
        var attrObj = {}, styleObj = {};
        attrs.forEach( function(attr) {
          if(d[attr] !== undefined) attrObj[attr] = d[attr];
        });
        styles.forEach( function(style) {
          if(d[style] !== undefined) styleObj[style] = d[style];
        });
        sel.attr( attrObj ).style( styleObj );
      };

      // updates data to new data
      if(newData !== undefined) data = newData;
      // console.log(data);

      if(data !== undefined) {
        updating = g.selectAll('g').data(data, function(d) { return d.id; }); //data constancy based on id;
        // updating.data(data, function(d) { return d.id; }); //data constancy based on id
        entering = updating.enter().append('g');
        exiting = updating.exit().remove();

        entering.each( function(d) {
          var thisguy = d3.select(this);
          // Path
          if(d.type === 'path') thisguy.append('path')
          // Polyline
          if(d.type === 'polyline') thisguy.append('polyline')
          // Line
          if(d.type === 'line') thisguy.append('line')
          // Rectangle
          if(d.type === 'rect') thisguy.append('rect')
          // Circle
          if(d.type === 'circle') thisguy.append('circle')
          // Ellipse
          if(d.type === 'ellipse') thisguy.append('ellipse')
          // Text
          if(d.type === 'text') thisguy.append('text')
        })

        // Updates each shape based on its type and valid attributes/styles for that type
        updating.each( function(d) {
          var thisguy = d3.select(this),
              attrs, styles;

          // Translate parent g element
          thisguy.attr('transform', 'translate(' + d.translate.x + ',' + d.translate.y + ')');

          // Path
          if(d.type === 'path') {
            attrs = ['d'];
            styles = ['fill', 'stroke', 'stroke-width'];
            thisguy.select('path').call(setAttrsStyles, attrs, styles, d);
          }
          // Polyline
          else if(d.type === 'polyline') {
            attrs = ['points'];
            styles = ['fill', 'stroke', 'stroke-width'];
            thisguy.select('polyline').call(setAttrsStyles, attrs, styles, d);
          }
          // Line
          else if(d.type === 'line') {
            attrs = ['x1', 'y1', 'x2', 'y2'];
            styles = ['stroke', 'stroke-width'];
            thisguy.select('line').call(setAttrsStyles, attrs, styles, d);
          }
          // Rectangle
          else if(d.type === 'rect') {
            attrs = ['x', 'y', 'rx', 'ry', 'width', 'height'];
            styles = ['fill', 'stroke', 'stroke-width'];
            thisguy.select('rect').call(setAttrsStyles, attrs, styles, d);
          }
          // Circle
          else if(d.type === 'circle') {
            attrs = ['cx', 'cy', 'r'];
            styles = ['fill', 'stroke', 'stroke-width'];
            thisguy.select('circle').call(setAttrsStyles, attrs, styles, d);
          }
          // Ellipse
          else if(d.type === 'ellipse') {
            attrs = ['cx', 'cy', 'rx', 'ry'];
            styles = ['fill', 'stroke', 'stroke-width'];
            thisguy.select('ellipse').call(setAttrsStyles, attrs, styles, d);
          }
          // Text
          if(d.type === 'text') {
            var svgText = thisguy.select('text'),
                lines = d.text.split('\n');
            attrs = ['x', 'y'];
            styles = ['fill', 'stroke', 'stroke-width', 'font-size', 'font-style'];
            svgText.call(setAttrsStyles, attrs, styles, d);
            // Text data is stored in t.text with line endings. So, to render in SVG, we must create tspans for each string.
            lines.forEach( function(str, i) {
              svgText.append('tspan')
                  .attr({
                    x: 0,
                    y: 14*i
                  })
                  .text(str);
            })
          }

        });

        updateMinimap()
        // Make sure any new elements are selectable if we are in select mode
        if( mode === 'select' ) updating.call(grab);
        // Make sure any new elements are erasable if we are in erase mode
        if( mode === 'erase' ) updating.on('click', erase);
      }

    }

    // Updates the whiteboard mode, binding behaviors accordingly
    function updateMode (newMode) {

      // NOTE: all new modes (and existing ones) should be careful not remove event listeners that another mode is listening for. For example, look at how all the canvas dragging behaviors are handled together, with a single else statement to remove listeners only if none of those modes are active.

      mode = newMode;

      // Make the canvas draggable and zoomable if we are in pan mode, otherwise remove the behavior
      if( mode === 'pan' ) gCanvas.call(zoom);
      else gCanvas.on('.zoom', null); //switch back to 'mousedown.zoom' if this doesn't work

      // Add drag behavior to all SVG elements if we are in select mode
      if( mode === 'select' ) updating.call(grab);
      else {
        updating.on('.drag', null);
        selectBox.rect.classed('show', false);
      }

      // Add click behavior to all SVG elements if we are in erase mode
      if( mode === 'erase' ) updating.on('click', erase);
      else updating.on('click', null);

      // NOTE: add any new modes that affect the canvas should be added here
      // If we are in any of the modes that require dragging behavior on the canvas
      if( _.contains(['draw', 'line', 'rectangle', 'circle', 'ellipse'], mode) ) {

        // Add drag behavior to canvas in order to draw
        if( mode === 'draw' ) gCanvas.call(draw);
        // Add drag behavior to canvas in order to draw lines
        else if( mode === 'line' ) gCanvas.call(drawLine);
        // Add drag behavior to canvas in order to draw rectangles
        else if( mode === 'rectangle' ) gCanvas.call(drawRect);
        // Add drag behavior to canvas in order to draw circles
        else if( mode === 'circle' ) gCanvas.call(drawCircle);
        // Add drag behavior to canvas in order to draw ellipses
        else if( mode === 'ellipse' ) gCanvas.call(drawEllipse);
      }
      // Otherwise remove the drag behavior from the canvas
      else gCanvas.on('.drag', null); //switch back to 'mousedown.drag' if this doesn't work

      // Add click behavior to canvas in order to write text
      if( mode === 'text' ) gCanvas.on('click', writeText, true); // capture flag set to true
      else gCanvas.on('click', null);


    }





    function move() {
      var t = d3.event.translate,
          s = d3.event.scale;

      console.log(t, s);

      // prevent panning to the left and right of the canvas
      if(t[0] > 0) t[0] = 0;
      else if(t[0] - view.w < -w) t[0] = view.w - w;

      // prevent panning above and below the canvas
      if(t[1] > 0) t[1] = 0;
      else if(t[1] - view.h < -h) t[1] = view.h - h;

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
      // Update the minimap viewbox
      updateMinimap()
    }

    // TODO: make this work with zoom (once I re-enable zoom)
    function updateMinimap() {
      minimap.viewbox
        .attr('width', minimapInterpX( view.w/w ))
        .attr('height', minimapInterpY( view.h/h ))
        .attr('x', minimapInterpX( view.x/w ))
        .attr('y', minimapInterpY( view.y/h ))
    }


  }

  return {
    template: '<div class="text-writer" data-ng-show="textWriter.active"><textarea class="expanding" data-ng-style="textWriter.style"></textarea></div>',
    restrict: 'E',
    link: link
  };

});
