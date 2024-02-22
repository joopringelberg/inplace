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
import "./App.css";
import { PDRproxy, CONTINUOUS } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import {
    PerspectivesComponent,
    ModelDependencies,
    UserMessagingPromise
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';

// import 'bootstrap/dist/css/bootstrap.min.css';

////////////////////////////////////////////////////////////////////////////////
// CARDCLIPBOARD
////////////////////////////////////////////////////////////////////////////////
export default class CardClipBoard extends PerspectivesComponent
{
  constructor()
  {
    super();
    this.writeRoleIdentification = this.writeRoleIdentification.bind(this);
  }
  componentDidMount()
  {
    const component = this;
    PDRproxy.then( pproxy =>
      pproxy.getProperty(
        component.props.systemExternalRole,
        ModelDependencies.cardClipBoard,
        ModelDependencies.systemExternal,
        function (valArr)
        {
          if (valArr[0])
          {
            const {roleData} = JSON.parse( valArr[0]);
            if (roleData.cardTitle)
            {
              component.setState(roleData);
            }
            else
            {
              component.setState({cardTitle: undefined});
            }
          }
          else
          {
            component.setState({cardTitle: undefined});
          }
        },
        CONTINUOUS,
        function(e)
        {
          UserMessagingPromise.then( um => um.addMessageForEndUser({title: "Clipbboard error", "message": "Cannot read the card clipboard.", error: e.toString()}));
        }));
  }

  writeRoleIdentification()
  {
    const component = this;

    navigator.clipboard.writeText(component.state.rolinstance).then(
        function () {
        /* success */
        alert("Copied the role instance to the clipboard.")
        },
        function () {
        /* failure */
        alert("Programming alert: Could not write to clipboard!");
        }
    );
  }

  render ()
  {
    const component = this;
    if (this.state && this.state.cardTitle)
    {
      return <Container onClick={component.writeRoleIdentification}><Badge variant="info" className="p-2">{this.state.cardTitle}</Badge></Container>;
    }
    else {
      return null;
    }

  }
}

CardClipBoard.propTypes = {systemExternalRole: PropTypes.string.isRequired};
