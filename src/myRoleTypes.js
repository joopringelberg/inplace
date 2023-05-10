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
import Dropdown from 'react-bootstrap/Dropdown';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import {deconstructLocalName, AppContext, UserMessagingPromise} from "perspectives-react";
import {PeopleIcon} from '@primer/octicons-react';
import i18next from "i18next";

export default class MyRoleTypes extends Component
{
  constructor()
  {
    super();
    this.state = {myRoleTypes: []};
  }

  getAllMyRoleTypes()
  {
    const component = this;
    PDRproxy.then(
      function( pproxy )
      {
        pproxy.getAllMyRoleTypes( component.roleInstance())
          .then( myRoleTypes => component.setState({myRoleTypes: myRoleTypes, roleId: component.roleInstance()}))
          .catch(e => UserMessagingPromise.then( um => 
            um.addMessageForEndUser(
              { title: i18next.t("app_myroletypes_title", { ns: 'mycontexts' }) 
              , message: i18next.t("app_myroletypes_message", {context: component.props.contextid, ns: 'mycontexts'})
              , error: e.toString()
            })));
      }
    );
  }

  // Either the external role of the context (ContextForm), or the role itself (RoleForm).
  // May return undefined.
  roleInstance()
  {
    if (this.context)
    {
      return this.context.externalRoleId || this.context.roleId
    }
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
      PDRproxy
        .then( pproxy => pproxy.setPreferredUserRoleType(component.roleInstance(), userRoleType) )
        .catch(e => UserMessagingPromise.then( um => 
          um.addMessageForEndUser(
            { title: i18next.t("setMyRoleTypes_title", { ns: 'mycontexts' }) 
            , message: i18next.t("setMyRoleTypes_message", {preferredType: userRoleType, ns: 'mycontexts'})
            , error: e.toString()
          })));
    }
  }

  // Reset the user role types when we've got another role.
  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    if (component.context.externalRoleId !== prevState.roleId 
        && component.context.roleId !== prevState.roleId
        )
    {
      component.setState({myRoleTypes: [], roleId: component.roleInstance()});
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
              <Dropdown.Toggle as={CustomToggle} id="MyRoleTypes_Toggle" disabled={!component.roleInstance()}>
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
