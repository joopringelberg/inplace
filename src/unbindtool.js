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
  { PerspectivesComponent
  , Alert
  } from "perspectives-react";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {LinkIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class UnbindTool extends PerspectivesComponent
{
  constructor()
  {
    super();
    this.state = {showAlert: false};
  }

  handle ({roleData, addedBehaviour, myroletype})
  {
    const component = this;
    if (addedBehaviour.includes( "removeFiller" ))
    {
      PDRproxy.then( pproxy =>
        pproxy.getBinding ( roleData.rolinstance, function( rolIdArr )
         {
           if ( rolIdArr[0] )
            {
              pproxy.removeBinding( roleData.rolinstance, rolIdArr[0], myroletype );
            }
         },
         FIREANDFORGET));
    }
    else
    {
      component.setState({ showAlert: true});
    }
  }
  handleKeyDown(e)
  {
    const component = this;
    switch (e.keyCode){
      case 32: // space
        // Read the clipboard
        // Use result to handle
        PDRproxy.then( pproxy =>
          pproxy.getProperty(
            component.props.systemExternalRole,
            "model:System$PerspectivesSystem$External$CardClipBoard",
            "model:System$PerspectivesSystem$External",
            function (valArr)
            {
              if (valArr[0])
              {
                component.handle( JSON.parse( valArr[0]) );
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
    <Tooltip id="unbindtool-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Drop a role here to remove its filler
    </Tooltip> );

    const eventDiv = React.createRef();


    return  <>
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
                        aria-describedby="unbindtool-tooltip"
                        tabIndex="0"
                        onKeyDown={ e => component.handleKeyDown(e) }
                        onDrop={ev => {
                          // eslint-disable-next-line react/prop-types
                          component.handle( JSON.parse( ev.dataTransfer.getData( "PSRol" ) ) );
                          ev.target.classList.remove("border", "p-3", "border-primary");
                          }}
                        onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                        onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                        <LinkIcon alt="OpenRoleFormTool" aria-label="Drop a role here to remove its filler" size="medium"/>
                    </div>
                </OverlayTrigger>
                <Alert
                  title="Operation cancelled"
                  message="You are not allowed to remove the filler of this role."
                  close={() => component.setState({showAlert: false})}
                  show={component.state.showAlert}
                />
              </>;
  }
}

UnbindTool.propTypes =
  { systemExternalRole: PropTypes.string.isRequired
  };
