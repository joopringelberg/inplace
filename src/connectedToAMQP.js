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

import "./externals.js";

import { ViewOnExternalRole, PSView} from "perspectives-react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {BroadcastIcon} from '@primer/octicons-react';

// import 'bootstrap/dist/css/bootstrap.min.css';

export default function ConnectedToAMQP(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="amqp-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      You are online
    </Tooltip> );

  const eventDiv = React.createRef();

  return  <ViewOnExternalRole viewname="allProperties">
            <PSView.Consumer>
            {
              roleinstance => roleinstance.propval("ConnectedToAMQPBroker")[0] == "true" ?
                <OverlayTrigger
                  placement="left"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip}
                  >
                  <div
                      ref={eventDiv}
                      className="ml-3 mr-3 text-secondary"
                      aria-describedby="amqp-tooltip"
                      tabIndex="0"
                  >
                      <BroadcastIcon alt="Connected" aria-label="MyContexts can send and receive messages" size='medium'/>
                  </div>
                </OverlayTrigger>
                : 
                <div/>
            }
            </PSView.Consumer>
          </ViewOnExternalRole>;
}
