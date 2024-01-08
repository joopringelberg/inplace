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

import { PDRproxy } from 'perspectives-proxy';

import {externalRole} from "perspectives-react";

import React, { Component } from "react";

import
  { Alert
  , Card
  } from "react-bootstrap";

import { Typeahead } from 'react-bootstrap-typeahead';

import './splash.css';

import './bootstrap.css'

export default class NoContextSelected extends Component
{
  constructor(props)
  {
    super(props);
    this.state = {options:[], selected: undefined};
    this.ref = React.createRef();
  }

  // options must be an array with objects having this shape: {id: <qualified name>, label: <readable name>}.
  componentDidMount()
  {
    const component = this;
    PDRproxy
    // Calling `matchContextName` with an empty string will return all IndexedContext names.
    .then( proxy => proxy.matchContextName( "" ))
    .then( function (serialisedMapping)
      {
        component.setState({ options: Object.entries( JSON.parse( serialisedMapping[0] ) )
          .map(arr => {return {id: arr[1], label: arr[0].match(/\$(.*)/)[1] }}) });
      })
  }

  select({id})
  {
    this.ref.current.dispatchEvent( new CustomEvent('OpenContext', { detail: externalRole( id ), bubbles: true }) );
  }
  render()
  {
    const component = this;
    const appLocation = location.origin + location.pathname;
    return  <Card ref={this.ref}>
              <Card.Body className="alert alert-secondary">
                <Card.Title>No context</Card.Title>
                <Card.Text>
                You have no context open on this screen.
                </Card.Text>
                <Alert variant="warning">
                Tip: click the home button in the toolbar to open the System context
                </Alert>
              </Card.Body>
              <Card.Body>
                Alternatively, select from the list below or begin typing the name of an indexed context such as `MySystem`.
              </Card.Body>
              <Card.Body>
                <Typeahead
                  id="indexedContext"
                  options={component.state.options}
                  placeholder="Begin typing or select..."
                  selected={component.state.selected}
                  // onChange={c => component.props.setselectedcontext(c)}
                  onChange={x => component.select(x[0])}
                />
              </Card.Body>
              <Card.Body className="alert alert-success">
                <Card.Text>
                  In order to manage your installation in this browser, click the link below.
                </Card.Text>
                <Card.Link className="badge badge-pill badge-success p-2" href={appLocation + "/manage.html"}>Manage page</Card.Link>
              </Card.Body>
            </Card>
  }
}
