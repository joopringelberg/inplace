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
import { PDRproxy } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import {
    PerspectivesComponent,
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';

import 'bootstrap/dist/css/bootstrap.min.css';

////////////////////////////////////////////////////////////////////////////////
// CARDCLIPBOARD
////////////////////////////////////////////////////////////////////////////////
export default class CardClipBoard extends PerspectivesComponent
{
  componentDidMount()
  {
    const component = this;
    PDRproxy.then( pproxy =>
      pproxy.getProperty(
        component.props.systemExternalRole,
        "model:System$PerspectivesSystem$External$CardClipBoard",
        "model:System$PerspectivesSystem$External",
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
              component.setState({cardTitle: undefined}); // WERKT DIT WEL?
            }
          }
          else
          {
            component.setState({cardTitle: undefined}); // WERKT DIT WEL?
          }
        }));
  }

  render ()
  {
    if (this.state && this.state.cardTitle)
    {
      return <Container><Badge variant="info">{this.state.cardTitle}</Badge></Container>;
    }
    else {
      return null;
    }

  }
}

CardClipBoard.propTypes = {systemExternalRole: PropTypes.string.isRequired};
