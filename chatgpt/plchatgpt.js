import React from "react";
import {render} from 'react-dom';

// Use Pouchdb to interact with the repository.
// var PouchDB = require('pouchdb-browser').default;
// import PouchDB from 'pouchdb-browser';

// Various components from react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// Prompt is the text value of the initial message that we send to ChatGPT.
import prompt from './perspectivesprompt.txt';
import { Button } from "react-bootstrap";

// Import highlight library (NOTE: this is the complete module, can be done with smaller footprint!)
// https://highlightjs.readthedocs.io/en/latest/readme.html#es6-modules-import
import hljs from 'highlight.js';

// Import perspectives-arc as a third party language
import perspectivesarc from 'perspectives-highlightjs';

// Import a stylesheet
import "highlight.js/styles/base16/solar-flare.css";

// Register the language, so it can be used as a value for the language prop.
hljs.registerLanguage("perspectives-arc", perspectivesarc); 

// The messages format.
// [
//   {"role": "system", "content": "You are a helpful assistant."},
//   {"role": "user", "content": "Who won the world series in 2020?"},
//   {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
//   {"role": "user", "content": "Where was it played?"}
// ]

// The response from the chatgpt service on https://inplace.dev/chatgpt/
// is a JSON structure in the following format:
// { "completion": 
    // {
    //   'message': {
    //     'role': 'assistant',
    //     'content': 'The 2020 World Series was played in Arlington, Texas at the Globe Life Field, which was the new home stadium for the Texas Rangers.'},
    //   'finish_reason': 'stop',
    //   'index': 0
    // }
// , "error": "Reason why it failed." }
// Where either "completion" or "error" are available.



class App extends React.Component
{
    constructor(props)
    {
        super(props);
        const component = this;
        this.state = 
          { messages: [
              {role: "user", 
              content: prompt}
              ]
            , newestResponse: ""
            , nextQuestion: ""
          };
    }

    componentDidMount()
    {
      // Request the initial response.
      this.getAnswer(this.state.messages);
    }
    componentDidUpdate()
    {
        hljs.highlightAll();
    }

    getAnswer(messages)
    {
      const component = this;
      fetch( "/chatgpt/",
      { method: "POST"
      , headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify( messages )} ).then( response => 
          {
            if (response.ok)
            {
              response.json()
                .then(data =>
                  {
                    if (data.error)
                    {
                      // Temporarily:
                      alert(data.error);
                    }
                    else {
                      // Add the received response to the messages.
                      component.setState(
                          { messages: component.state.messages.concat( [data.completion.message] )
                          , newestResponse: component.extractModel( data.completion.message.content )
                          , nextQuestion: ""
                          });
                    }
                  }
                )
            }
            else
            {
              // Temporarily
              alert( response.status + " " + response.statusText );
            }
          })
    }

    submit()
    {
      const component = this;
      const augmentedMessages = component.state.messages.concat( [{role: "user", content: component.state.nextQuestion}] );
      // Append the nextQuestion value to the messages.
      component.setState({messages: augmentedMessages});
      // Now post again.
      component.getAnswer(augmentedMessages);
    }

    // Either returns the model text or an empty string.
    extractModel( responseText )
    {
      const matches = responseText.match(/####(.*)####/);
      if (matches && matches[1])
      {
        return matches[1].replaceAll(/\\n/g, "\n").replaceAll(/\\t/g, "   ");
      }
      else return "Received this response, from which I could not extract a model: " + responseText;
    }

    render()
    {
      const component = this;
      return <Container>
                  <h3>Test PerspectivesFile Component</h3>
                  <pre><code 
                      className="perspectives-arc"
                      style={{'maxHeight': '84vh'}}
                      >{
                      component.state.newestResponse
                  }</code></pre>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    onChange={ event => component.setState({nextQuestion: event.target.value})}
                    value={component.state.nextQuestion}
                    />
                  <Button variant="primary" onClick={() => component.submit()}>Submit</Button>
              </Container>;
    }
}

render(<App />, document.getElementById('root'));