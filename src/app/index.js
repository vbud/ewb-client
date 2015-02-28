'use strict';
/*jshint esnext: true */

// // services
import DataService from '../services/data.service';
import ModeService from '../services/mode.service';
import SocketService from '../services/socket.service';
import UserService from '../services/user.service';
import CircleService from '../services/shapes/circle.service';
import ColorService from '../services/shapes/color.service';
import EllipseService from '../services/shapes/ellipse.service';
import LineService from '../services/shapes/line.service';
import PolylineService from '../services/shapes/polyline.service';
import RectService from '../services/shapes/rect.service';
// directives
import ColorpickerDirective from '../components/colorpicker/colorpicker.directive';
import WhiteboardDirective from '../components/whiteboard/whiteboard.directive';
// controllers
import NavbarCtrl from '../components/navbar/navbar.controller';
import MainCtrl from './main/main.controller';



angular.module('ewbClient', ['ui.router', 'ngMaterial', 'btford.socket-io'])
  .service('DataService', DataService)
  .service('ModeService', ModeService)
  .service('SocketService', SocketService)
  .service('UserService', UserService)
  .service('CircleService', CircleService)
  .service('ColorService', ColorService)
  .service('EllipseService', EllipseService)
  .service('LineService', LineService)
  .service('PolylineService', PolylineService)
  .service('RectService', RectService)
  .directive('ColorpickerDirective', ColorpickerDirective)
  .directive('WhiteboardDirective', WhiteboardDirective)
  .controller('MainCtrl', MainCtrl)
  .controller('NavbarCtrl', NavbarCtrl)

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  });
