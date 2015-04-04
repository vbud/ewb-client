'use strict';

angular.module('ewbClient')
.factory('UserService', function () {

  var user = 'anonymous';

  return {
    getCurrentUser: function() {
      return user;
    }
  };

});
