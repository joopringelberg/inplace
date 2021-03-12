import React from "react";
import "./App.css";

import "./externals.js";

import { ViewOnExternalRole, PSView} from "perspectives-react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {BroadcastIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default function ConnectedToAMQP(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="amqp-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      You are online
    </Tooltip> );

  const eventDiv = React.createRef();

  function handleDrop({roleData, addedBehaviour})
  {
    if (addedBehaviour.includes("removeRoleFromContext"))
    {
      // eslint-disable-next-line react/prop-types
      props.removerol( roleData );
    }
  }

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
                      onDragOver={ev => ev.preventDefault()}
                      className="ml-3 mr-3"
                      aria-dropeffect="execute"
                      aria-describedby="trash-tooltip"
                      tabIndex="0"
                      onDrop={ev => {
                        handleDrop( JSON.parse( ev.dataTransfer.getData("PSRol") ) );
                        ev.target.classList.remove("border", "p-3", "border-primary");
                      }}
                      onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                      onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                      <BroadcastIcon alt="Connected" aria-label="InPlace can send and receive messages" size='medium'/>
                  </div>
                  </OverlayTrigger>
                  : <div/>
            }
            </PSView.Consumer>
          </ViewOnExternalRole>;
}
