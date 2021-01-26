/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["perspectives-serviceworker"] = factory();
	else
		root["perspectives-serviceworker"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/service.js":
/*!************************!*\
  !*** ./src/service.js ***!
  \************************/
/***/ (() => {

eval("// BEGIN LICENSE\n// Perspectives Distributed Runtime\n// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars\n//\n// This program is free software: you can redistribute it and/or modify\n// it under the terms of the GNU General Public License as published by\n// the Free Software Foundation, either version 3 of the License, or\n// (at your option) any later version.\n//\n// This program is distributed in the hope that it will be useful,\n// but WITHOUT ANY WARRANTY; without even the implied warranty of\n// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n// GNU General Public License for more details.\n//\n// You should have received a copy of the GNU General Public License\n// along with this program.  If not, see <https://www.gnu.org/licenses/>.\n//\n// Full text of this license can be found in the LICENSE file in the projects root.\n// END LICENSE\n////////////////////////////////////////////////////////////////////////////////\n//// SERVICE WORKER\n////////////////////////////////////////////////////////////////////////////////\n//1\n// self.onmessage( function(event)\nself.addEventListener('message', function (event) {\n  var promise = self.clients.matchAll().then(function (clientList) {\n    switch (event.data.messageType) {\n      case \"relayPort\":\n        // If there is but one client, return a message immediately.\n        if (clientList.length == 1) {\n          // Return the port sent by the first page. It will communicate with itself through it.\n          clientList[0].postMessage({\n            \"messageType\": \"youHost\",\n            port: event.data.port\n          }, [event.data.port]);\n        } else {\n          clientList.forEach(function (client) {\n            // Send to all pages except for the sender.\n            if (client.id === event.source.id) {\n              return;\n            } else {\n              client.postMessage(event.data, [event.data.port]);\n            }\n          });\n        }\n\n        break;\n    }\n  })[\"catch\"](function (error) {\n    console.log(\"Failing in service worker:\" + error);\n  });\n});\n\n//# sourceURL=webpack://perspectives-%5Bname%5D/./src/service.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/service.js");
/******/ })()
;
});