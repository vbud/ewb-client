'use strict';

// Based on angular-spectrum-colorpicker
// https://github.com/Jimdo/angular-spectrum-colorpicker

angular.module('ewbClient')
.directive('colorpicker', function (ColorService) {

  function link($scope, $element, attrs, $ngModel) {

    // var $picker = $element.find('input');
    var $picker = $element;

    function setViewValue(color) {
      if (color) $ngModel.$setViewValue( color.toString() );
    }

    // As diferent colors are chosen inside the colorpicker
    var onMove = function(color) {
      $scope.$apply(function() {
        setViewValue(color);
      });
    };
    // Save the final chosen color (when the colorpicker window is hidden, clicked outside, or closed via a button)
    var onChange = function(color) {
      if (color === null || color === undefined)
        color = 'none';
      else 
        color = color.toString();
      if(attrs.color === 'fill') ColorService.setFill( color );
      else if(attrs.color === 'stroke') ColorService.setStroke( color );
      else if(attrs.color === 'text') ColorService.setText( color );
    };
    var onToggle = function() {
      $picker.spectrum('toggle');
      return false;
    };
    var onShow = function() {
      // Move colorpicker to right of toggling element (instead of above, which is default and not customizable)
      var container = $picker.spectrum('container'),
          top = parseInt( container.css('top') ),
          left = parseInt( container.css('left') );
      container.css({
        top: (top + 50) + 'px',
        left: (left + 50) + 'px'
      });
    };
    var options = {
      color: $ngModel.$viewValue,
      change: onChange,
      move: onMove,
      hide: onChange,
      show: onShow,
      showButtons: false,
      showInitial: true,
      showInput: true,
      showPalette: true,
      preferredFormat: 'hex3',
      allowEmpty: attrs.color === 'text' ? false : true
    };
    // If I want to accept options as an attribute to the directive
    // options = angular.extend(options, $scope.$eval(attrs.options));

    $ngModel.$render = function() {
      $picker.spectrum('set', $ngModel.$viewValue || '');
    };

    if (options.color) {
      $picker.spectrum('set', options.color || '');
      setViewValue(options.color);
    }

    $picker.spectrum(options);

    $scope.$on('$destroy', function() {
      $picker.spectrum('destroy');
    });
  }

  return {
    restrict: 'EA',
    require: 'ngModel',
    scope: false,
    replace: true,
    // template: '<span><input class="input-small" /></span>',
    link: link
  };

});
