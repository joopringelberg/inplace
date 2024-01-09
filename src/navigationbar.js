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
import "./App.css";
import PropTypes from "prop-types";

import {PDRproxy} from "perspectives-proxy";

import "./externals.js";

import {
    RemoveRol,
    FileDropZone,
    deconstructContext,
    ModelDependencies,
    UserMessagingPromise
  } from "perspectives-react";

import i18next from "i18next";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { DesktopDownloadIcon} from '@primer/octicons-react';

// import 'bootstrap/dist/css/bootstrap.min.css';

import UnbindTool from "./unbindtool.js";

import OpenRoleFormTool from "./openroleformtool.js";

import {AllowNotifications, ShowNotifications, notificationsAvailable} from "./notifications.js";

import Trash from "./trash.js";

import CardClipBoard from "./cardclipboard.js";

import ConnectedToAMQP from "./ConnectedToAMQP.js";

import MoveToModelsOverview from "./moveToModelsOverview.js";

import CloseContext from "./closecontext.js";

import MyRoleTypes from "./myRoletypes.js";

import ContextActions from "./contextActions.js";

export default class NavigationBar extends Component
{
  constructor(props)
  {
    super(props);
    this.state = {expanded:false};
  }
  handleDrop({roleData, cardTitle, addedBehaviour})
  {
    if (addedBehaviour && addedBehaviour.includes("fillARole"))
    {
      const component = this;
      // Set information in the CardClipboard external property of "model://perspectives.domains#System$PerspectivesSystem".
      PDRproxy.then(pproxy =>
        pproxy.setProperty(
          component.props.systemexternalrole,
          ModelDependencies.cardClipBoard,
          JSON.stringify(
              { roleData:
                { rolinstance: roleData.rolinstance
                , cardTitle
                , roleType: roleData.roltype
                , contextType: roleData.contexttype
                }
              , addedBehaviour
              , myroletype: component.props.myroletype
              }),
          component.props.myroletype )
        .catch(e => UserMessagingPromise.then( um => 
          um.addMessageForEndUser(
            { title: i18next.t("clipboardSet_title", { ns: 'preact' }) 
            , message: i18next.t("clipboardSet_message", {ns: 'preact'})
            , error: e.toString()
            }))));
    }
  }

  render()
  {
    function toggleNavbar ()
    {
      component.setState({expanded: !component.state.expanded});
    }
    function collapseNavbar()
    {
      component.setState({expanded: false});
    }
    const component = this;
    const contextId = component.props.externalroleid ? deconstructContext ( component.props.externalroleid ) : null;
    const classes = component.props.isbasepage ? "justify-content-between border-bottom border-danger border-3" : "justify-content-between";
    return  <Navbar 
              // bg={component.props.isbasepage ? "light" : "info"}
              expand="md" 
              collapseOnSelect
              role="banner" 
              aria-label="Main menu bar" 
              // className={"justify-content-between" + (component.props.isbasepage ? " border-bottom border-warning border-3" : "")}
              className={ "navbar-dark bg-primary " + classes}
              expanded={component.state.expanded}>
              <Navbar.Brand tabIndex="-1" href="#home">MyContexts</Navbar.Brand>
              <Navbar.Toggle aria-controls="perspectives-toolbar" onClick={toggleNavbar}/>
              <Navbar.Collapse id="perspectives-toolbar">
                <Nav
                  onDragOver={ev => ev.preventDefault()}
                  onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                  onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}
                  onDrop={ev => 
                    {
                      component.handleDrop( JSON.parse( ev.dataTransfer.getData("PSRol") ) )
                      ev.target.classList.remove("border", "p-3", "border-primary");
                      ev.preventDefault();
                      ev.stopPropagation();
                  } }

                >
                  <CardClipBoard systemExternalRole={component.props.systemexternalrole}/>
                  <ContextActions contextid={contextId} myroletype={component.props.myroletype}/>
                  <MyRoleTypes/>
                  <MoveToModelsOverview systemexternalrole={component.props.systemexternalrole} collapsenavbar={collapseNavbar}/>
                  <CloseContext clearexternalroleid={component.props.clearexternalroleid} hascontext={!!contextId} collapsenavbar={collapseNavbar}/>
                  {
                    notificationsAvailable() ? 
                      <>
                        <ShowNotifications propagate={component.props.setshownotifications} collapsenavbar={collapseNavbar}/>
                        <AllowNotifications collapsenavbar={collapseNavbar}s/>
                      </>
                      :
                      null
                  }
                  <OpenRoleFormTool eventDispatcher={component.props.eventdispatcher} systemExternalRole={component.props.systemexternalrole} collapsenavbar={collapseNavbar}/>
                  <UnbindTool systemExternalRole={component.props.systemexternalrole} collapsenavbar={collapseNavbar}/>
                  <FileDropZone
                    tooltiptext="Drop an invitation file here or press enter/space"
                    handlefile={ component.props.setdroppedfile }
                    extension=".json"
                    className="ml-3 mr-3"
                    collapsenavbar={collapseNavbar}>
                    <DesktopDownloadIcon aria-label="Drop an invitation file here" size='medium'/>
                  </FileDropZone>
                  <RemoveRol>
                    <Trash collapsenavbar={collapseNavbar}/>
                  </RemoveRol>
                  <ConnectedToAMQP/>
                </Nav>
              </Navbar.Collapse>
            </Navbar>;
  }
}

NavigationBar.propTypes =
  { systemexternalrole: PropTypes.string.isRequired
  , setshownotifications: PropTypes.func.isRequired
  , isbasepage: PropTypes.bool.isRequired
  , eventdispatcher: PropTypes.objectOf(PropTypes.PropTypes.func).isRequired
  , myroletype: PropTypes.string
  , externalroleid: PropTypes.string
  , clearexternalroleid: PropTypes.func.isRequired
  , setdroppedfile: PropTypes.func.isRequired
  };
