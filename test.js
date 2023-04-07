import React from "react";
import {render} from 'react-dom';

// Use Pouchdb to interact with the repository.
// var PouchDB = require('pouchdb-browser').default;
// import PouchDB from 'pouchdb-browser';

// Various components from react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {PerspectivesFile} from "perspectives-react";

import {initI18next} from "./src/i18next.js";



const sampleProperty = 
  { id: "SomeVeryLongName"
    , displayName: "MyFile"
    , isFunctional: true
    , isMandatory: false
    , isCalculated: false
    , range: "PFile"
    , constrainingFacets: {}
    }

class App extends React.Component
{
    constructor(props)
    {
        super(props);
        const component = this;
        // this.repository = new PouchDB(repositoryUrl);
    }

    componentDidMount()
    {
    }
    componentDidUpdate()
    {
    }

    render()
    {
      return <Container>
                  <h3>Test PerspectivesFile Component</h3>
                    <PerspectivesFile
                      serialisedProperty={sampleProperty}
                      propertyValues={{values:[]}}
                      roleId="MyRole"
                      myRoletype="User">

                    </PerspectivesFile>
              </Container>;
    }
}

initI18next("en").then( () => render(<App />, document.getElementById('root')));
