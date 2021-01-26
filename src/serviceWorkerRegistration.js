
// Register the service worker.
if ('serviceWorker' in navigator)
{
  navigator.serviceWorker.register(
    'perspectives-serviceWorker.js',
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
