'use strict';

angular.module('ewbClient')
.directive('whiteboard', function ($rootScope, DataService, SvgService, DrawService, ModeService) {

  function link(scope, element, attrs) {

    // convenience variables for assigning to SvgService selections
    var svg, g, updating, entering, exiting;

    var data;



    // Updates the visualization with new data (if any)
    function update(_data) {

      // Safely sets attrs and styles on a given selection, only applying the ones specified in data 'd'
      var setAttrsStyles = function(selection, attrs, styles, d) {
        var attrObj = {}, styleObj = {};
        attrs.forEach( function(attr) {
          if(d[attr] !== undefined) attrObj[attr] = d[attr];
        });
        styles.forEach( function(style) {
          if(d[style] !== undefined) styleObj[style] = d[style];
        });
        selection.attr( attrObj ).style( styleObj );
      };

      // updates data to new data
      if(_data !== undefined) data = _data;
      // console.log(data);

      // if there is no data, do nothing
      if(data === undefined)
        return;

      updating = g.selectAll('g').data(data, function(d) { return d.id; }); //data constancy based on id;
      // updating.data(data, function(d) { return d.id; }); //data constancy based on id
      entering = updating.enter().append('g');
      exiting = updating.exit().remove();

      entering.each( function(d) {
        var thisguy = d3.select(this);
        if(d.type === 'path') thisguy.append('path')
        if(d.type === 'polyline') thisguy.append('polyline')
        if(d.type === 'line') thisguy.append('line')
        if(d.type === 'rect') thisguy.append('rect')
        if(d.type === 'circle') thisguy.append('circle')
        if(d.type === 'ellipse') thisguy.append('ellipse')
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

      SvgService.updateMinimap();

      // Make sure any new elements have the correct behaviors bound
      SvgService.bindSelectionBehaviors(ModeService.active);
    }



    // Constructor
    function init() {

      // Setup the SVG selections
      SvgService.setup(element);
      // Once we have setup the SVG selections, we can assign them our convenient local variables
      svg = SvgService.selections.svg;
      g = SvgService.selections.g;
      updating = SvgService.selections.updating;
      entering = SvgService.selections.entering;
      exiting = SvgService.selections.exiting;



      // run a whiteboard update, sans data
      update();

      // default to select mode
      ModeService.setActive('select');

      // when data comes in, update the whiteboard again with the new data
      scope.$on('whiteboards:active:data', function(event, data) {
        console.log('Data updated, updating whiteboard...');
        console.log(data);

        update(data);
      })

    }



    init();

  }

  return {
    template: '<text-writer></text-writer>',
    restrict: 'E',
    link: link
  };

});
