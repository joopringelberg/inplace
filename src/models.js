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

import React from "react";
import {render} from 'react-dom';

// Import highlight library (NOTE: this is the complete module, can be done with smaller footprint!)
// https://highlightjs.readthedocs.io/en/latest/readme.html#es6-modules-import
import hljs from 'highlight.js';

// Import perspectives-arc as a third party language
import perspectivesarc from 'perspectives-highlightjs';

// Import a stylesheet
import "highlight.js/styles/base16/solar-flare.css";

// Register the language, so it can be used as a value for the language prop.
hljs.registerLanguage("perspectives-arc", perspectivesarc); 

// Use Pouchdb to interact with the repository.
// var PouchDB = require('pouchdb-browser').default;
import PouchDB from 'pouchdb-browser';

// Various components from react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

// REPOSITORYURL will be substituted by Webpack. It's value is set in package.json.
const repositoryUrl = REPOSITORYURL;

class App extends React.Component
{
    constructor(props)
    {
        super(props);
        const component = this;
        this.repository = new PouchDB(repositoryUrl);
        this.repository.allDocs({include_docs: true}).then(
            function(dbs)
            {
                component.setState({models: dbs.rows.filter( ({id}) => id.match(/^model/))});
            }
        );
        this.state = {models: [], source: "-- Select a model."};
        this.getSource = this.getSource.bind(this);
    }

    componentDidMount()
    {
        hljs.highlightAll();
    }
    componentDidUpdate()
    {
        hljs.highlightAll();
    }

    getSource(ev)
    {
        const component = this;
        const selectedModel = ev.target.value;
        const model = component.state.models.find(
            ({id}) => id == selectedModel
        )
        if (model)
        {
            component.setState({source: model.doc.contents.arc})
        }
    }

    render()
    {
        const component = this;
        return (
            <Container>
                <h3>Perspective models</h3>
                <p>Inspect one of the public models created for the Perspectives project.</p>
                <Form.Group controlId="alldbs">
                    <Form.Control 
                        as="select"
                        onChange={component.getSource}
                    >
                        {
                            component.state.models.map(function({id})
                                {
                                    return <option key={id}>{id}</option>;
                                })
                        }
                    </Form.Control>
                </Form.Group>
                    <pre><code 
                        className="perspectives-arc"
                        style={{'maxHeight': '84vh'}}
                        >{
                        component.state.source
                    }</code></pre>
            </Container>
        );
    }

}

render(<App />, document.getElementById('root'))
