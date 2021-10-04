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
  } from "perspectives-react";

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { DesktopDownloadIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import UnbindTool from "./unbindtool.js";

import OpenRoleFormTool from "./openroleformtool.js";

import {AllowNotifications, ShowNotifications} from "./notifications.js";

import Trash from "./trash.js";

import CardClipBoard from "./cardclipboard.js";

import ConnectedToAMQP from "./ConnectedToAMQP.js";

import MoveToModelsOverview from "./moveToModelsOverview.js";


export default class NavigationBar extends Component
{
  render()
  {
    const component = this;
    return  <Navbar bg={component.props.isbasepage ? "light" : "danger"} expand="lg" role="banner" aria-label="Main menu bar" className="justify-content-between">
              <Navbar.Brand tabIndex="-1" href="#home">InPlace</Navbar.Brand>
              <Nav>
                <CardClipBoard systemExternalRole={component.props.systemexternalrole}/>
                <MoveToModelsOverview systemexternalrole={component.props.systemexternalrole}/>
                <ShowNotifications propagate={component.props.setshownotifications}/>
                <AllowNotifications/>
                <OpenRoleFormTool eventDispatcher={component.props.eventdispatcher} systemExternalRole={component.props.systemexternalrole}/>
                <UnbindTool systemExternalRole={component.props.systemexternalrole}/>
                <FileDropZone
                  tooltiptext="Drop an invitation file here or press enter/space"
                  handlefile={ importTransaction }
                  extension=".json"
                  className="ml-3 mr-3">
                  <DesktopDownloadIcon aria-label="Drop an invitation file here" size='medium'/>
                </FileDropZone>
                <RemoveRol>
                  <Trash/>
                </RemoveRol>
                <ConnectedToAMQP/>
              </Nav>
            </Navbar>;
  }
}

NavigationBar.propTypes =
  { systemexternalrole: PropTypes.string.isRequired
  , setshownotifications: PropTypes.func.isRequired
  , isbasepage: PropTypes.bool.isRequired
  , eventdispatcher: PropTypes.objectOf(PropTypes.PropTypes.func).isRequired
  };
