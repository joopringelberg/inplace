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
		module.exports = factory(require("perspectives-proxy"), require("perspectives-core"));
	else if(typeof define === 'function' && define.amd)
		define(["perspectives-proxy", "perspectives-core"], factory);
	else if(typeof exports === 'object')
		exports["perspectives-pageworker"] = factory(require("perspectives-proxy"), require("perspectives-core"));
	else
		root["perspectives-pageworker"] = factory(root["perspectives-proxy"], root["perspectives-core"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE_perspectives_proxy__, __WEBPACK_EXTERNAL_MODULE_perspectives_core__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/page.js":
/*!*********************!*\
  !*** ./src/page.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ pageHostingPDRPort\n/* harmony export */ });\n/* harmony import */ var perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! perspectives-proxy */ \"perspectives-proxy\");\n/* harmony import */ var perspectives_proxy__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__);\n// BEGIN LICENSE\n// Perspectives Distributed Runtime\n// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars\n//\n// This program is free software: you can redistribute it and/or modify\n// it under the terms of the GNU General Public License as published by\n// the Free Software Foundation, either version 3 of the License, or\n// (at your option) any later version.\n//\n// This program is distributed in the hope that it will be useful,\n// but WITHOUT ANY WARRANTY; without even the implied warranty of\n// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n// GNU General Public License for more details.\n//\n// You should have received a copy of the GNU General Public License\n// along with this program.  If not, see <https://www.gnu.org/licenses/>.\n//\n// Full text of this license can be found in the LICENSE file in the projects root.\n// END LICENSE\n////////////////////////////////////////////////////////////////////////////////\n//// PERSPECTIVES DISTRIBUTED RUNTIME\n////////////////////////////////////////////////////////////////////////////////\nvar PDRPromise; ////////////////////////////////////////////////////////////////////////////////\n//// INTERNAL CHANNEL\n////////////////////////////////////////////////////////////////////////////////\n\n ////////////////////////////////////////////////////////////////////////////////\n//// STORING PORTS SENT BY CLIENT PAGES\n////////////////////////////////////////////////////////////////////////////////\n\nvar channels = {};\nvar channelIndex = 1; ////////////////////////////////////////////////////////////////////////////////\n//// PORT TO PAGE THAT HOSTS PDR\n//// RECEIVE PORTS FROM CLIENTS WHEN RUN IN THE MAIN PAGE, RELAYED THROUGH A SERVICE WORKER\n//// This function is passed on by the client in the call configurePDRProxy({pageHostingPDRPort: pageHostingPDRPort})\n////////////////////////////////////////////////////////////////////////////////\n\nfunction pageHostingPDRPort() {\n  // Create a channel.\n  var channel = new MessageChannel();\n  var weHost = false;\n\n  if ('serviceWorker' in navigator) {\n    navigator.serviceWorker.register('perspectives-serviceWorker.js', {\n      scope: './'\n    }).then(function (registration) {\n      var serviceWorker;\n\n      if (registration.installing) {\n        serviceWorker = registration.installing;\n      } else if (registration.waiting) {\n        serviceWorker = registration.waiting;\n      } else if (registration.active) {\n        serviceWorker = registration.active;\n      }\n\n      if (serviceWorker) {\n        // Listen to messages coming in from the serviceWorker.\n        // Notice that all pages that are not the first will never handle a message.\n        navigator.serviceWorker.addEventListener('message', function (event) {\n          switch (event.data.messageType) {\n            case \"youHost\":\n              // This message only arrives to the very first page visiting InPlace.\n              weHost = true; // We've sent ourselves a port.\n\n              channels[channelIndex] = event.data.port; // Return the channelIndex.\n\n              channels[channelIndex].postMessage({\n                serviceWorkerMessage: \"channelId\",\n                channelId: 1000000 * channelIndex\n              }); // start listening to the new channel, handle requests.\n\n              channels[channelIndex].onmessage = handleClientRequest;\n              channelIndex = channelIndex + 1; // This page must host the PDR.\n\n              PDRPromise = Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! perspectives-core */ \"perspectives-core\", 23));\n              break;\n\n            case \"relayPort\":\n              // If we are the host, save the port; otherwise ignore.\n              if (weHost) {\n                // the new client (page) sends a port.\n                channels[channelIndex] = event.data.port; // Return the channelIndex.\n\n                channels[channelIndex].postMessage({\n                  serviceWorkerMessage: \"channelId\",\n                  channelId: 1000000 * channelIndex\n                }); // start listening to the new channel, handle requests.\n\n                channels[channelIndex].onmessage = handleClientRequest;\n                channelIndex = channelIndex + 1;\n              }\n\n              break;\n          }\n        }); // Send the port to the serviceWorker, to relay it to the page hosting the PDR.\n\n        navigator.serviceWorker.controller.postMessage({\n          messageType: \"relayPort\",\n          port: channel.port2\n        }, [channel.port2]);\n      } else {\n        console.log(\"Could not get serviceWorker from registration for an unknown reason.\");\n      }\n    })[\"catch\"](function (error) {\n      // Something went wrong during registration. The service-worker.js file\n      // might be unavailable or contain a syntax error.\n      console.log(error);\n    });\n  } else {\n    console.log(\"This browser does not support service workers.\");\n  } // Use port1 in the SharedWorkerChannel.\n\n\n  return channel.port1;\n} ////////////////////////////////////////////////////////////////////////////////\n//// HANDLE REQUESTS COMING IN THROUGH CHANNELS FROM CLIENTS\n////////////////////////////////////////////////////////////////////////////////\n// These calls are implemented in accordance with the types of the functions in the core.\n// The callbacks are declared as Effects, there, hence we treat them here that way.\n// We could cheat and provide callbacks that do not return an Effect.\n\nfunction handleClientRequest(request) {\n  var req = request.data;\n\n  if (req.proxyRequest) {\n    switch (req.proxyRequest) {\n      case \"isUserLoggedIn\":\n        //{proxyRequest: \"isUserLoggedIn\", channelId: proxy.channelId}\n        perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__.InternalChannelPromise.then(function () {\n          channels[corrId2ChannelId(req.channelId)].postMessage({\n            serviceWorkerMessage: \"isUserLoggedIn\",\n            isUserLoggedIn: true\n          });\n        });\n        break;\n\n      case \"authenticate\":\n        PDRPromise.then(function (pdr) {\n          return pdr.authenticate(req.username)(req.password)(req.host)(req.port)(function (n) // (Int -> Effect Unit)\n          {\n            return function () //  This function is the result of the call to authenticate: the Effect.\n            {\n              // Find the channel.\n              channels[corrId2ChannelId(req.channelId)].postMessage({\n                serviceWorkerMessage: \"authenticate\",\n                authenticationResult: n\n              });\n            };\n          })();\n        }); // The core authenticate function results in an Effect, hence we apply it to return the (integer) result.\n\n        break;\n\n      case \"resetAccount\":\n        PDRPromise.then(pdr.resetAccount(req.username)(req.password)(req.host)(req.port)(function (success) // (Boolean -> Effect Unit)\n        {\n          return function () //  This function is the result of the call to resetAccount: the Effect.\n          {\n            channels[corrId2ChannelId(req.channelId)].postMessage({\n              serviceWorkerMessage: \"resetAccount\",\n              resetSuccesful: success\n            });\n          };\n        })()); // The core authenticate function results in an Effect, hence we apply it to return the (boolean) result.\n\n        break;\n\n      case \"close\":\n        perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__.InternalChannelPromise.then(function (ic) {\n          return ic.close();\n        });\n        break;\n\n      case \"unsubscribe\":\n        perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__.InternalChannelPromise.then(function (ic) {\n          return ic.unsubscribe(req.request);\n        });\n        break;\n    }\n  } else {\n    // The callback was saved in the ServiceWorkerChannel.\n    // Replace the callback with a function that passes on the response to the right channel.\n    // The ServiceWorkerChannel will apply the callback.\n    req.reactStateSetter = function (result) {\n      return function () {\n        channels[corrId2ChannelId(result.corrId)].postMessage(result);\n      };\n    };\n\n    perspectives_proxy__WEBPACK_IMPORTED_MODULE_0__.InternalChannelPromise.then(function (ic) {\n      return ic.send(req);\n    });\n  }\n}\n\nfunction corrId2ChannelId(corrId) {\n  return Math.floor(corrId / 1000000);\n}\n\n//# sourceURL=webpack://perspectives-%5Bname%5D/./src/page.js?");

/***/ }),

/***/ "perspectives-core":
/*!**************************************************************************************************************************************!*\
  !*** external {"commonjs":"perspectives-core","commonjs2":"perspectives-core","amd":"perspectives-core","root":"perspectives-core"} ***!
  \**************************************************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_perspectives_core__;

/***/ }),

/***/ "perspectives-proxy":
/*!******************************************************************************************************************************************!*\
  !*** external {"commonjs":"perspectives-proxy","commonjs2":"perspectives-proxy","amd":"perspectives-proxy","root":"perspectives-proxy"} ***!
  \******************************************************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_perspectives_proxy__;

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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => Object.getPrototypeOf(obj) : (obj) => obj.__proto__;
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach(key => def[key] = () => value[key]);
/******/ 			}
/******/ 			def['default'] = () => value;
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/page.js");
/******/ })()
;
});