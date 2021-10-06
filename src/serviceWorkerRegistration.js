// BEGIN LICENSE
// Perspectives Distributed Runtime
// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
// Full text of this license can be found in the LICENSE file in the projects root.
// END LICENSE

// Register the service worker.
if ('serviceWorker' in navigator)
{
  navigator.serviceWorker.register(
    'perspectives-serviceworker.js',
    {
        scope: './'
    }).then(function (registration)
      {
        var serviceWorker;
        if (registration.installing) {
          serviceWorker = registration.installing;
        } else if (registration.waiting) {
          serviceWorker = registration.waiting;
        } else if (registration.active) {
          serviceWorker = registration.active;
        }
        if (serviceWorker)
        {
          // Create a Channel. Save the port.
          var channel = new MessageChannel();
          serviceWorkerChannel.port = channel.port1;

          // Listen to the port, handle all responses that come from the serviceworker.
          serviceWorkerChannel.port.onmessage = serviceWorkerChannel.handleServiceWorkerResponse;

          // Transfer one port to the service worker.
          serviceWorker.postMessage('porttransfer', [channel.port2]);
        }
        else
        {
          console.log ("Could not get serviceWorker from registration for an unknown reason.");
        }
      }).catch (function (error)
        {
          // Something went wrong during registration. The service-worker.js file
          // might be unavailable or contain a syntax error.
          console.log( error );
        });
}
else
{
    console.log( "This browser does not support service workers.");
}
