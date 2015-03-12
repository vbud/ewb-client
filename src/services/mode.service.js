'use strict';

angular.module('ewbClient')
.service('ModeService', function($rootScope) {
  // Manages the mode (available and current modes)

  var modes = ['pan', 'select', 'draw', 'line', 'rectangle', 'circle', 'ellipse', 'text', 'erase'],
      activeMode = 'pan'; // pan is active mode by default

  return {
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
        $rootScope.$broadcast('mode:update', mode);
      } else {
        console.warn('Mode "' + mode + '" is not one of the ' + modes.length + ' selectable modes; therefore, it cannot be set.');
      }
    }
  };
});
