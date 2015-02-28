'use strict';
/*jshint esnext: true */

function SocketService(socketFactory) {
	
	var socket = socketFactory({
		ioSocket: io.connect('localhost:3000')
 		// ioSocket: io.connect('http://ewb-server.paas1.icloud.intel.com:80')
	});
	socket.forward('error');
	
	return socket;

}

export default SocketService;
