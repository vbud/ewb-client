'use strict';

angular.module('ewbClient')
.directive('textWriter', function (DataService) {

  function link(scope, element, attrs) {

    $(element).find('textarea').expanding();

    scope.textWriter = {
      textarea: $(element).find('textarea'),
      active: false,
      style: {
        'top': '0px',
        'left': '0px',
        'font-size': '12px',
        'color': '#000'
      }
    }

    // Create the text writer and position it correctly
    scope.$on('textWriter:open', function() {
      scope.$apply( function() {
        scope.textWriter.active = true;
        scope.textWriter.style.top = d3.event.clientY + 'px';
        scope.textWriter.style.left = d3.event.clientX + 'px';
      })
      scope.textWriter.textarea.focus();
    })

    // If the text writer is already active, save it
    scope.$on('textWriter:close', function() {
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
    })

  }

  return {
    template: '<textarea class="expanding" data-ng-style="textWriter.style"></textarea>',
    restrict: 'E',
    link: link
  };
});
