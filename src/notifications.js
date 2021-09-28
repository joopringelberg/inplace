import React from "react";
import "./App.css";
import { PDRproxy } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import
  { PerspectivesComponent,
  } from "perspectives-react";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {BellIcon, BellSlashIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class NotificationTool extends PerspectivesComponent
{
  constructor(/*props*/)
  {
    super();
    this.notifications = [];
    this.state =
      { showNotifications: (Notification.permission === "granted")
      };
  }

  componentDidMount ()
  {
    const component = this;
    PDRproxy.then( pproxy =>
      pproxy.getRol (component.props.systemContextInstance,
        "model:System$PerspectivesSystem$AllNotifications",
        function(notifications)
        {
          const oldNotifications = component.notifications;
          let newNotifications;
          if ( oldNotifications.length === 0 && notifications.length > 1 )
          {
            newNotifications = [];
          }
          else
          {
            newNotifications = notifications.filter(x => !oldNotifications.includes(x));
          }
          component.notifications = notifications;
          if (component.state.showNotifications)
          {
            newNotifications.forEach( function(notification)
              {
                pproxy.getProperty(
                  notification,
                  "model:System$ContextWithNotification$Notifications$Message",
                  "model:System$ContextWithNotification$Notifications",
                  function( messages )
                  {
                    // A minimal message.
                    new Notification( messages[0] );
                  }
                );
              });
            }
        }) );
  }

  handleKeyDown(e)
  {
    const component = this;
    switch (e.keyCode){
      case 32: // space
        // Toggle notifications.
        component.allowNotifications();
        e.stopPropagation();
        break;
    }
  }

  allowNotifications()
  {
    function checkNotificationPromise()
    {
      try {
        Notification.requestPermission().then();
      } catch(e) {
        return false;
      }
      return true;
    }

    const component = this;

    // Let's check if the browser supports notifications
    if (!('Notification' in window))
    {
      console.log("This browser does not support notifications.");
    }
    else
    {
      if (checkNotificationPromise() )
      {
        Notification.requestPermission()
        .then((permission) => {
          if (permission == "granted")
          {
            component.setState({showNotifications: true});
            new Notification("Notifications turned on!");
          }
        });
      }
      else
      {
        Notification.requestPermission(function(permission) {
          if (permission == "granted")
          {
            component.setState({showNotifications: true});
          }
        });
      }
    }
  }


  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="formmode-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Click to allow notifications, or select and press space.
      To revoke your decision, use functionality of your browser.
    </Tooltip> );

    const eventDiv = React.createRef();


    return  <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip}
                    >
                    <div
                        ref={eventDiv}
                        onDragOver={ev => ev.preventDefault()}
                        className="ml-3 mr-3"
                        aria-describedby="formmode-tooltip"
                        tabIndex="0"
                        onKeyDown={ e => component.handleKeyDown(e) }
                        onClick={ () => component.allowNotifications()}
                    >
                    { component.state.showNotifications ?
                        <BellIcon alt="NotificationTool" aria-label="Click to allow notifications, or select and press space." size="medium"/>
                        :
                        <BellSlashIcon alt="NotificationTool" aria-label="Click to toggle notifications, or select and press space." size="medium"/>
                    }
                    </div>
              </OverlayTrigger>;
  }
}

NotificationTool.propTypes =
  { systemContextInstance: PropTypes.string.isRequired
  };
