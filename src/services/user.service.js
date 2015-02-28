'use strict';
/*jshint esnext: true */

function UserService() {

	var user = 'anonymous';

  return {
  	getCurrentUser: function() {
	  	return user;
	  }
  };

}

export default UserService;
