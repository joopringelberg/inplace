

onmessage =
  function()
  {
    const body = {name: "joop", password: "geheim"};

    fetch('https://127.0.0.1:6984/_session',
      { method: "POST",
        credentials: "include",
        body: JSON.stringify( body ),
        mode: "cors"})
      .then( function()
    {
      fetch( "https://127.0.0.1:6984/localusers/joop");
    });

  };
