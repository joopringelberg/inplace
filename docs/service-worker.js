

// onmessage =
//   function()
//   {
//     const body = {name: "joop", password: "geheim"};
//     let myHeaders = new Headers();
//     myHeaders.append('Content-Type', 'application/json');
//     fetch('https://127.0.0.1:6984/_session',
//       { method: "POST",
//         credentials: "include",
//         headers: myHeaders,
//         body: JSON.stringify( body ),
//         mode: "cors"})
//       .then( function()
//     {
//       fetch( "https://127.0.0.1:6984/localusers/joop", {credentials: "include"});
//     });
//
//   };

onmessage = function ()
{
  const body = {name: "joop", password: "geheim"};
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://127.0.0.1:6984/_session", true, "joop", "geheim");
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onerror = function(msg){("AJAX request failed" + msg);};
  xhr.ontimeout = function(msg){("AJAX request timed out" + msg);};
  // xhr.responseType = options.responseType;
  xhr.withCredentials = true;
  xhr.send( JSON.stringify( body ) );
  xhr.onload = function ()
    {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://127.0.0.1:6984/localusers/joop");
      xhr.onerror = function(msg){("AJAX request failed" + msg);};
      xhr.ontimeout = function(msg){("AJAX request timed out" + msg);};
      // xhr.responseType = options.responseType;
      xhr.withCredentials = true;
      xhr.send();
      xhr.onload = function ()
        {

        };

    };
};

var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

if (isBrowser())
{
  console.log("isBrowser returns true in service worker")
}
