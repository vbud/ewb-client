'use strict';

angular.module('ewbClient')
.service('ColorService', function () {

  // Set default colors
  var fill = '#00ff00',
      stroke = '#000',
      text = '#444';



  function setFill(_fill) {
    if (_fill === null || _fill === undefined) fill = 'none';
    else fill = _fill;
  }

  function setStroke(_stroke) {
    if (_stroke === null || _stroke === undefined) stroke = 'none';
    else stroke = _stroke;
  }

  function setText(_text) {
    if (_test === null || _text === undefined) text = '';
    else text = _text;
  }



  return {
    // Get the current fill
    getFill: function() {
      return fill;
    },
    // Get the current stroke
    getStroke: function() {
      return stroke;
    },
    // Get the current text color
    getText: function() {
      return text;
    },
    setFill: setFill,
    setStroke: setStroke,
    setText: setText,
  };
});
