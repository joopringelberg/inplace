import React from "react";
import "./App.css";

import "./externals.js";

import
  { PerspectivesComponent,
  } from "perspectives-react";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {BellIcon, BellSlashIcon, FoldDownIcon, FoldUpIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export class AllowNotifications extends PerspectivesComponent
{
  constructor(/*props*/)
  {
    super();
    this.notifications = [];
    this.state =
      { showNotifications: (Notification.permission === "granted")
      };
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
    <Tooltip id="notificationstool-tooltip" {...props} show={
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
                        className="ml-3 mr-3"
                        aria-describedby="notificationstool-tooltip"
                        tabIndex="0"
                        onKeyDown={ e => component.handleKeyDown(e) }
                        onClick={ () => component.allowNotifications()}
                    >
                    { component.state.showNotifications ?
                        <BellIcon alt="AllowNotifications" aria-label="Click to allow notifications, or select and press space." size="medium"/>
                        :
                        <BellSlashIcon alt="AllowNotifications" aria-label="Click to toggle notifications, or select and press space." size="medium"/>
                    }
                    </div>
              </OverlayTrigger>;
  }
}

export class ShowNotifications extends PerspectivesComponent
{
  constructor(/*props*/)
  {
    super();
    this.state =
      { showNotifications: false
      };
  }

  handleKeyDown(e)
  {
    const component = this;
    switch (e.keyCode){
      case 32: // space
        // Toggle notifications.
        component.toggleShowPanel();
        e.stopPropagation();
        break;
    }
  }

  toggleShowPanel()
  {
    const showpanel = !this.state.showNotifications;
    this.setState({ showNotifications: showpanel });
    this.props.propagate( showpanel );
  }

  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="showNotifications-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Click or select and press space to {this.state.showNotifications ? "hide" : "show"} the  Notifications panel.
    </Tooltip> );

    const eventDiv = React.createRef();


    return  <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip}
                    >
                    <div
                        ref={eventDiv}
                        className="ml-3 mr-3"
                        aria-describedby="showNotifications-tooltip"
                        tabIndex="0"
                        onKeyDown={ e => component.handleKeyDown(e) }
                        onClick={ () => component.toggleShowPanel()}
                    >
                    { component.state.showNotifications ?
                        <FoldUpIcon alt="HideNotifications" aria-label="Click to show the notifications tool, or select and press space." size="medium"/>
                        :
                        <FoldDownIcon alt="ShowNotifications" aria-label="Click to hide notifications, or select and press space." size="medium"/>
                    }
                    </div>
              </OverlayTrigger>;
  }
}
