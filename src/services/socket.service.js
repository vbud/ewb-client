'use strict';

angular.module('ewbClient')
.service('SocketService', function(socketFactory) {

	var socket = socketFactory({
		ioSocket: io.connect('localhost:3000')
 		// ioSocket: io.connect('http://joelmax.com:9000')
	});
	socket.forward('error');

	return socket;

});
