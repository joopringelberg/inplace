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
import { PDRproxy } from 'perspectives-proxy';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import {deconstructLocalName, AppContext} from "perspectives-react";
import {PeopleIcon} from '@primer/octicons-react';

export default class MyRoleTypes extends Component
{
  constructor()
  {
    super();
    this.state = {myRoleTypes: [], externalRoleId: undefined};
  }

  getAllMyRoleTypes()
  {
    const component = this;
    PDRproxy.then(
      function( pproxy )
      {
        pproxy.getAllMyRoleTypes( component.context.externalRoleId,
          function(myRoleTypes)
          {
            component.setState({myRoleTypes: myRoleTypes, externalRoleId: component.context.externalRoleId});
          });
      }
    );
  }

  handleSelect( userRoleType/*, event*/ )
  {
    const component = this;
    if (userRoleType === "refresh")
    {
      this.getAllMyRoleTypes();
    }
    else
    {
      PDRproxy.then(
        function (pproxy)
        {
          pproxy.setPreferredUserRoleType(component.context.externalRoleId, userRoleType);
        }
      );
    }
  }

  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    if (prevState.externalRoleId && component.context.externalRoleId !== prevState.externalRoleId)
    {
      component.setState({myRoleTypes: [], externalRoleId: undefined});
    }
  }

  render()
  {
    const component = this;
    return  <Dropdown
              id="dropdown-myroletypes"
              title="My roles"
              focusFirstItemOnShow={false}
              variant="secondary"
              size="sm"
              onSelect={(eventKey, event) => component.handleSelect(eventKey, event)}>
              <Dropdown.Toggle as={CustomToggle} id="MyRoleTypes_Toggle" disabled={!component.context.externalRoleId}>
                <PeopleIcon alt="Your roles in this context" aria-label="Your roles in this context" size="medium"/>
              </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    active={component.state.myRoleTypes.length == 0}
                    eventKey="refresh"
                  >{
                      component.state.myRoleTypes.length > 0 ? "Refresh" : "Fetch"
                    }</Dropdown.Item>
                  <Dropdown.Header>Role types</Dropdown.Header>
                  {
                    component.state.myRoleTypes.map(
                      function(rt)
                      {
                        return  <OverlayTrigger
                                  key={rt}
                                  placement="auto"
                                  overlay={
                                    <Tooltip id={`tooltip-${rt}`}>{rt}</Tooltip>
                                  }
                                >
                                  <Dropdown.Item
                                    eventKey={rt}
                                    active={rt == component.context.myRoleType}
                                  >{
                                    deconstructLocalName( rt )
                                  }</Dropdown.Item>
                                </OverlayTrigger>;
                      }
                    )
                  }
                </Dropdown.Menu>
            </Dropdown>;
  }
}

MyRoleTypes.contextType = AppContext;

// eslint-disable-next-line react/display-name, react/prop-types
const CustomToggle = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <a
    href=""
    ref={ref}
    className={disabled ? "disabledIconStyle" : "iconStyle"}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled)
      {
        onClick(e);
      }
    }}
  >
    {children}
    &#x25bc;
  </a>
));
