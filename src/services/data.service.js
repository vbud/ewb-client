'use strict';
/*jshint esnext: true */

function DataService($rootScope, UserService, SocketService) {

  var user = UserService.getCurrentUser(),
      socket = SocketService;

  // Array of objects that define SVGs
  var data = [], //current whiteboard data
      activeWhiteboard, //whiteboard object (must equal one of the objects in whiteboards)
      whiteboards = []; //array of whiteboard objects


  // Server sends available whiteboards
  socket.on('hello', function() {
    console.log('Connected to server');
  })

  // When the whiteboard list changes
  socket.on('updateWhiteboardList', function(_whiteboards) {
    whiteboards = _whiteboards;
    broadcastAvailableWhiteboards();
  })

  // Server sets the active whiteboard and updates its name and data
  socket.on('updateWhiteboard', function(wb) {
    console.log('New whiteboard data incoming from server.');
    activeWhiteboard = _.find(whiteboards, {id: wb.id});

    data = wb.data;
    
    broadcastActiveWhiteboard();
    broadcastData();
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
    updateWhiteboardData();
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
    updateWhiteboardData();      
  }

  



  // Doing some light local pub/sub here. All whiteboard and data-related events originate here.
  function broadcastData() {
    $rootScope.$broadcast('whiteboards:active:data', data);
  }

  function broadcastAvailableWhiteboards() {
    $rootScope.$broadcast('whiteboards:available', whiteboards);
  }

  function broadcastActiveWhiteboard() {
    $rootScope.$broadcast('whiteboards:active', activeWhiteboard);
  }




  // Create a new whiteboard and go to it
  function createWhiteboard(name) {
    socket.emit('createWhiteboard', name);
  }

  // Delete a whiteboard
  function deleteWhiteboard(id) {
    socket.emit('deleteWhiteboard', id);
  }  

  // Changes the active whiteboard to the whiteboard specified by id
  function changeWhiteboard(id) {
    socket.emit('joinWhiteboard', id);
  }

  // Updates name of active whiteboard and sends updated whiteboard name to the server
  function updateWhiteboardName(name) {
    activeWhiteboard.name = name;
    broadcastActiveWhiteboard();
    var d = {
      id: activeWhiteboard.id,
      name: activeWhiteboard.name
    };
    socket.emit('updateWhiteboard', d);
  }

  // Sends updated whiteboard data to the server
  function updateWhiteboardData() {
    // Assemble the data package to send to server
    var d = {
      id: activeWhiteboard.id,
      data: data
    };
    socket.emit('updateWhiteboard', d);
  }




  // Public API
  return {
    // returns the current active whiteboard data
    getWhiteboardData: function () {
      return data;
    },
    // returns the currently available whiteboards
    getWhiteboards: function() {
      return whiteboards;
    },
    getActiveWhiteboard: function() {
      return activeWhiteboard;
    },
    createWhiteboard: createWhiteboard,
    deleteWhiteboard: deleteWhiteboard,
    changeWhiteboard: changeWhiteboard,
    updateWhiteboardName: updateWhiteboardName,
    add: add,
    remove: remove,
    // finds an object by its id and prints it to console
    check: function (id) {
      console.log( _.find(data, { id: id }) );
    }
  };
}

export default DataService;
