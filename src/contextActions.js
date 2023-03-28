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
import PropTypes from "prop-types";

import { PDRproxy } from 'perspectives-proxy';
import {PerspectivesComponent, ActionDropDown, UserMessagingPromise} from "perspectives-react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import i18next from "i18next";

export default class ContextActions extends PerspectivesComponent
{
  constructor()
  {
    super();
    this.runAction = this.runAction.bind(this);
    this.state = {actions: undefined, myRoleType: undefined};
  }

  // On mounting, this component will never have properties.

  componentDidUpdate()
  {
    const component = this;
    if ( component.props.myroletype != component.state.myRoleType)
    {
      PDRproxy.then(
        function( pproxy )
        {
          if (component.props.contextid && component.props.myroletype)
          {
            pproxy.getContextActions(
              component.props.myroletype,
              component.props.contextid)
                .then( actions => 
                  component.setState({actions, myRoleType: component.props.myroletype}))
                .catch(e => UserMessagingPromise.then( um => 
                  um.addMessageForEndUser(
                    { title: i18next.t("app_contextactions_title", { ns: 'inplace' }) 
                    , message: i18next.t("app_contextactions_message", {context: component.props.contextid, ns: 'inplace'})
                    , error: e.toString()
                  })));
          }
        }
      );
    }
  }

  runAction( actionName )
  {
    const component = this;
    PDRproxy.then(
      function (pproxy)
      {
          pproxy.contextAction(
            component.props.contextid
            , component.props.myroletype  // authoringRole
            , actionName)
          .catch(e => UserMessagingPromise.then( um => 
            um.addMessageForEndUser(
              { title: i18next.t("action_title", { ns: 'preact' }) 
              , message: i18next.t("action_message", {ns: 'preact', action: actionName})
              , error: e.toString()
              })));  
        });
  }

  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="ContextActions-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Actions you can currently perform in this context.
    </Tooltip> );

    if (component.stateIsComplete())
    {
      return  <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip}
                    >
                <div
                  className="ml-3 mr-3"
                  tabIndex="0"
                  aria-describedby="ContextActions-tooltip"
                >
                  <ActionDropDown
                    actions={ component.state.actions }
                    runaction={component.runAction}
                  />
                </div>
             </OverlayTrigger>;
    }
    else
    {
      return null;
    }
  }
}

ContextActions.propTypes =
  { myroletype: PropTypes.string
  , contextid: PropTypes.string
  };
