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

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {TrashIcon} from '@primer/octicons-react';

// import 'bootstrap/dist/css/bootstrap.min.css';

export default function Trash(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="trash-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Drop a card here to remove it
    </Tooltip> );

  const eventDiv = React.createRef();

  function handleDrop({roleData, addedBehaviour})
  {
    if (addedBehaviour.includes("removeRoleFromContext"))
    {
      // eslint-disable-next-line react/prop-types
      props.removerol( roleData );
      this.props.collapsenavbar();
    }
  }

  return  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                  <div
                      ref={eventDiv}
                      onDragOver={ev => ev.preventDefault()}
                      className="ml-3 mr-3 text-secondary"
                      aria-dropeffect="execute"
                      aria-describedby="trash-tooltip"
                      tabIndex="0"
                      onDrop={ev => {
                        ev.stopPropagation()
                        handleDrop( JSON.parse( ev.dataTransfer.getData("PSRol") ) );
                        ev.target.classList.remove("border", "p-3", "border-primary");
                      }}
                      onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                      onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                      <TrashIcon alt="Thrashcan" aria-label="Drop a card here to remove it" size='medium'/>
                  </div>
            </OverlayTrigger>;
}

Trash.propTypes = 
  { collapsenavbar: PropTypes.func.isRequired
  }