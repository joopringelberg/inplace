

onmessage =
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
