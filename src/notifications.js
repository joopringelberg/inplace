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

import React, { Component } from "react";
import PropTypes from "prop-types";

import "./App.css";

import "./externals.js";

import { PDRproxy } from 'perspectives-proxy';

import {Row, Col, OverlayTrigger, Tooltip, Collapse} from "react-bootstrap";

import {BellIcon, BellSlashIcon, FoldDownIcon, FoldUpIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {PerspectivesComponent, RoleTable, addRemoveRoleFromContext, ModelDependencies, UserMessagingPromise} from "perspectives-react";

import i18next from "i18next";

export function notificationsAvailable ()
{
  return ("Notification" in window);
}

export class AllowNotifications extends Component
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
      // eslint-disable-next-line no-console
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
    this.props.collapsenavbar();
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

AllowNotifications.propTypes = 
  { collapsenavbar: PropTypes.func.isRequired };

export class ShowNotifications extends Component
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
    this.props.collapsenavbar();
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

ShowNotifications.propTypes =
  { propagate: PropTypes.func.isRequired
  , collapsenavbar: PropTypes.func.isRequired 
  };

// Displays the notifications of a context in a RoleTable.
// Because of the RoleTable, must be used in the subtree of a
// PSContext provider.
export class NotificationsDisplayer extends PerspectivesComponent
{
  constructor(props)
  {
    super(props);
    this.notifications = [];

  }
  componentDidMount()
  {
    const component = this;

    PDRproxy.then( pproxy =>
      pproxy.getRol (component.props.systemcontextinstance,
        ModelDependencies.allNotifications,
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
          if (component.props.shownotifications)
          {
            newNotifications.forEach( function(notification)
              {
                pproxy.getProperty(
                  notification,
                  ModelDependencies.notificationMessage,
                  ModelDependencies.notifications,
                  function( messages )
                  {
                    // A minimal message.
                    const n = new Notification(
                      messages[0],
                      { data: {roleId: notification}
                      });
                    n.onclick = function(e)
                      {
                        pproxy.getRolContext( notification )
                          .then(
                            function (contextIdArray)
                            {
                              if (history.state && history.state.selectedContext != contextIdArray[0])
                              {
                                history.pushState({ selectedContext: contextIdArray[0] }, "");
                                // console.log("Pushing context state " + e.detail);
                                // This changes App state.
                                component.props.navigateto(
                                  { selectedContext: contextIdArray[0]
                                  , selectedRoleInstance: undefined
                                  , viewname: undefined
                                  , cardprop: undefined
                                  , backwardsNavigation: false });
                              }
                              e.stopPropagation();
                            })
                          .catch(e => UserMessagingPromise.then( um => 
                            um.addMessageForEndUser(
                              { title: i18next.t("notifications_title", { ns: 'inplace' }) 
                              , message: i18next.t("notifications_message", {ns: 'inplace'})
                              , error: e.toString()
                            })));            
                      };
                  }
                );
              });
            }
        }) );
  }

  render()
  {
    const component = this;
    return  <Collapse in={component.props.shownotifications}>
              <div>
                <Row>
                  <Col>
                    <RoleTable
                      viewname="allProperties"
                      cardcolumn="Message"
                      roletype={ModelDependencies.notifications}
                      //contexttocreate
                      // createButton
                      // roleRepresentation
                      behaviours={[addRemoveRoleFromContext]}/>
                  </Col>
                </Row>
              </div>
            </Collapse>;
  }
}

NotificationsDisplayer.propTypes =
  { systemcontextinstance: PropTypes.string.isRequired
  , shownotifications: PropTypes.bool.isRequired
  // navigateto is just setState. Hence, this is an unsafe connection to
  // the component that has NotificationsDisplayer in its render tree,
  // because the props on the object provided to navigateto must fit
  // the callers state!
  // As this is just App, we know it is OK.
  // However, NotificationsDisplayer cannot easily be reused!
  , navigateto: PropTypes.func.isRequired
  };
