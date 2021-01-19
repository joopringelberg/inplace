

self.onmessage(
  function(m)
  {
    let myHeaders = new Headers();
    myHeaders.append('Authenticate', 'Basic joop:geheim');

    fetch('https://127.0.0.1:6984/_session',
      { credentials: "include",
        headers: myHeaders,
        mode: "cors"})
      .then( function()
    {
      fetch( "https://127.0.0.1:6984/localusers/joop");
    });

  }
);
