'use strict';

angular.module('ewbClient')
.service('UserService', function () {

	var user = 'anonymous';

  return {
  	getCurrentUser: function() {
	  	return user;
	  }
  };

});
