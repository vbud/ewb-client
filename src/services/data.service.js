'use strict';
/*jshint esnext: true */

function DataService($rootScope, UserService, SocketService) {

  var user = UserService.getCurrentUser(),
      socket = SocketService;

  // Array of objects that define SVGs
  var data = [], //current whiteboard data
      activeWhiteboard, //whiteboard object (must equal one of the objects in #availableWhiteboards)
      availableWhiteboards = []; //array of whiteboard objects


  // Server sends available whiteboards
  socket.on('hello', function(wbs) {
    availableWhiteboards = wbs;
    broadcastAvailableWhiteboards();
    changeWhiteboard( wbs[0].id ); //default to first whiteboard
  })

  // Server updates the active whiteboard, possibly changing it if this client requested the change
  socket.on('updateWhiteboard', function(wb) {
    console.log('New whiteboard data incoming from server.');
    activeWhiteboard = _.find(availableWhiteboards, {id: wb.id});
    activeWhiteboard.name = wb.name;
    broadcastActiveWhiteboard();
    data = wb.data;
    broadcastData();
  })

  // Server sends new available whiteboards
  socket.on('newAvailableWhiteboards', function(wbs) {
    // add new whiteboards to array of available whiteboards
    availableWhiteboards = _.union(availableWhiteboards, wbs);
    broadcastAvailableWhiteboards();
  })



  
  // Adds a new object (or array of objects)
  function add(obj) {
    
    var addObj = function(obj) {
      // if obj has an id, try to find it
      var found = obj.id !== undefined ? _.find(data, { id: obj.id }) : undefined;
      // if object already exists, then update it
      if( found ) {
        _.merge( found, obj )
        console.log('Object (id:' + obj.id + ') updated.');
      } else {
        obj.id = uuid.v4();
        obj.creator = user;
        data.push( obj );
        console.log('Object (id:' + obj.id + ') added.');
      }
      
    }

    if (obj === null || obj === undefined) return;

    if( Array.isArray(obj) ) {
      obj.forEach( function(d) {
        addObj(d);
      })
    } else if( typeof(obj) === 'object') { 
      addObj( obj );
    } else {
      // if not an array or an object, do nothing
      return;
    }
    
    broadcastData();
    emitData();
  }

  // Removes an existing object (or array of objects)
  function remove(obj) {

    var removeObj = function(obj) {
      if(obj.id !== undefined) {
        _.remove(data, function(d) { return d.id === obj.id; });
      }
      console.log('Object (id:' + obj.id + ') removed.');
    }

    if (obj === null || obj === undefined) return;

    if( Array.isArray(obj) ) {
      obj.forEach( function(d) {
        removeObj(d);
      })
    } else if( typeof(obj) === 'object') { 
      removeObj( obj );
    } else {
      // if not an array or an object, do nothing
      return;
    }
    
    broadcastData();
    emitData();      
  }

  



  // Doing some light pub/sub here. All whiteboard and data-related events originate here.
  function broadcastData() {
    $rootScope.$broadcast('whiteboards:data', data);
  }

  function broadcastAvailableWhiteboards() {
    $rootScope.$broadcast('whiteboards:available', availableWhiteboards);
  }

  function broadcastActiveWhiteboard() {
    $rootScope.$broadcast('whiteboards:active', activeWhiteboard);
  }





  // Updates name of active whiteboard and sends updated whiteboard name to the server
  function changeWhiteboardName(name) {
    activeWhiteboard.name = name;
    broadcastActiveWhiteboard();
    emitName();
  }

  // Changes the active whiteboard to the whiteboard specified by #id
  function changeWhiteboard(id) {
    socket.emit('joinWhiteboard', id);
  }

  // Sends updated whiteboard data to the server
  function emitData() {
    // Assemble the data package to send to server
    var d = {
      id: activeWhiteboard.id,
      data: data
    };
    socket.emit('updateWhiteboardData', d);
  }

  // Sends updated whiteboard data to the server
  function emitName() {
    // Assemble the data package to send to server
    var d = {
      id: activeWhiteboard.id,
      name: activeWhiteboard.name
    };
    socket.emit('updateWhiteboardName', d);
  }





  // Public API
  return {
    // returns the current active whiteboard data
    getWhiteboardData: function () {
      return data;
    },
    // returns the currently available whiteboards
    getWhiteboards: function() {
      return availableWhiteboards;
    },
    getActiveWhiteboard: function() {
      return activeWhiteboard;
    },
    changeWhiteboard: changeWhiteboard,
    changeWhiteboardName: changeWhiteboardName,
    add: add,
    remove: remove,
    // finds an object by its id and prints it to console
    check: function (id) {
      console.log( _.find(data, { id: id }) );
    }
  };
}

DataService.$inject = ['$rootScope', 'UserService', 'SocketService'];

export default DataService;
