if ('serviceWorker' in navigator) {

     // Override the default scope of '/' with './', so that the registration applies
     // to the current directory and everything underneath it.
     navigator.serviceWorker.register('service-worker.js', {scope: './'}).then(function(registration) {
       // At this point, registration has taken place.
       // The service worker will not handle requests until this page and any
       // other instances of this page (in other tabs, etc.) have been
       // closed/reloaded.

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
         console.log(serviceWorker.state);
         serviceWorker.addEventListener('statechange', function(e) {
           console.log(e.target.state);
         });
         // serviceWorker.postMessage('authenticate');
       }
     }).catch(function(error) {
       // Something went wrong during registration. The service-worker.js file
       // might be unavailable or contain a syntax error.
       console.log( 'failed: ' + error);
     });
   } else {
     // The current browser doesn't support service workers.
     console.log("no service workers supported");
   }

const test =
   function()
   {
     const body = {name: "joop", password: "geheim"};
     let myHeaders = new Headers();
     myHeaders.append('Content-Type', 'application/json');
     fetch('https://127.0.0.1:6984/_session',
       { method: "POST",
         credentials: "include",
         headers: myHeaders,
         body: JSON.stringify( body ),
         mode: "cors"})
       .then( function()
     {
       fetch( "https://127.0.0.1:6984/localusers/joop", {credentials: "include"});
     });

   };

// test();
