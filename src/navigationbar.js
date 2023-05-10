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

import "./externals.js";

import {
    RemoveRol,
    importTransaction,
    FileDropZone,
    deconstructContext
  } from "perspectives-react";

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { DesktopDownloadIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

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
              variant="light" 
              expand="md" 
              collapseOnSelect
              role="banner" 
              aria-label="Main menu bar" 
              // className={"justify-content-between" + (component.props.isbasepage ? " border-bottom border-warning border-3" : "")}
              className={classes}
              expanded={component.state.expanded}>
              <Navbar.Brand tabIndex="-1" href="#home">MyContexts</Navbar.Brand>
              <Navbar.Toggle aria-controls="perspectives-toolbar" onClick={toggleNavbar}/>
              <Navbar.Collapse id="perspectives-toolbar">
                <Nav>
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
                    handlefile={ importTransaction }
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
  };
