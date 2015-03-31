'use strict';

angular.module('ewbClient')
// Manages the mode (available and current modes)
.service('ModeService', function(SvgService) {

  var modes, activeMode;

  function init() {
    modes = ['pan', 'select', 'polyline', 'line', 'rectangle', 'circle', 'ellipse', 'text', 'erase'];
    activeMode = 'pan'; // pan is active mode by default
  }

  init();

  return {
    // checks if a given mode is the active mode
    isActive: function(mode) {
      if( mode === activeMode ) return true;
      else return false;
    },
    get activeMode() {
      return activeMode;
    },
    setActive: function(mode) {
      if( _.contains(modes, mode) ) {
        activeMode = mode;
        SvgService.bindBehaviors(mode);
      } else {
        console.warn('Mode "' + mode + '" is not one of the ' + modes.length + ' valid modes; therefore, it cannot be set.');
      }
    }
  };
});
