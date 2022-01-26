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
import { PDRproxy, FIREANDFORGET } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import
  { PerspectivesComponent,
  } from "perspectives-react";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {PencilIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class OpenRoleFormTool extends PerspectivesComponent
{
  handleKeyDown(e)
  {
    const component = this;
    switch (e.keyCode){
      case 32: // space
        // Read the clipboard
        // Supply the result to the eventDispatcher.
        PDRproxy.then( pproxy =>
          pproxy.getProperty(
            component.props.systemExternalRole,
            "model:System$PerspectivesSystem$External$CardClipBoard",
            "model:System$PerspectivesSystem$External",
            function (valArr)
            {
              if (valArr[0])
              {
                const roleDataAndBehaviour = JSON.parse( valArr[0]);
                if (roleDataAndBehaviour.addedBehaviour.includes("openContextOrRoleForm"))
                {
                  component.props.eventDispatcher.eventDispatcher( roleDataAndBehaviour );
                }
              }
            },
            FIREANDFORGET));

        e.stopPropagation();
        break;
    }
  }

  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="formmode-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Drop a role here to edit its properties
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
                        aria-dropeffect="execute"
                        aria-describedby="formmode-tooltip"
                        tabIndex="0"
                        onKeyDown={ e => component.handleKeyDown(e) }
                        onDrop={ev => {
                          // The function in eventDispatcher is put there by the addOpenContextOrRoleForm behaviour triggered
                          // on the element the user started to drag. It causes an OpenRoleForm event to be thrown from that element.
                          // eslint-disable-next-line react/prop-types
                          component.props.eventDispatcher.eventDispatcher( JSON.parse( ev.dataTransfer.getData( "PSRol" ) ) );
                          ev.target.classList.remove("border", "p-3", "border-primary");
                          }}
                        onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                        onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                        <PencilIcon alt="OpenRoleFormTool" aria-label="Drop a role here to edit its properties" size="medium"/>
                    </div>
              </OverlayTrigger>;
  }
}

OpenRoleFormTool.propTypes =
  { eventDispatcher: PropTypes.object.isRequired
  , systemExternalRole: PropTypes.string.isRequired
  };
