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

import React, {Component} from "react";
import "./App.css";
import PropTypes from "prop-types";

import "./externals.js";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {SignOutIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class CloseContext extends Component
{
  constructor(props)
  {
    super(props);
    this.ref = React.createRef();
  }
  handleKeyDown(e)
  {
    const component = this;
    switch (e.keyCode){
      case 32: // space
        component.navigate();
        e.stopPropagation();
        break;
    }
  }

  navigate()
  {
    const component = this;
    component.props.clearexternalroleid();
  }

  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="CloseContext-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Close the context.
      Click (or select and press space).
    </Tooltip> );
    if (component.props.hascontext)
    {
      return  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
              <div
                  ref={component.ref}
                  className="ml-3 mr-3"
                  aria-describedby="CloseContext-tooltip"
                  tabIndex="0"
                  onKeyDown={ e => component.handleKeyDown(e) }
                  onClick={ () => component.navigate() }
                  >
                  <SignOutIcon alt="Close the context" aria-label="Close the context" size="medium"/>
              </div>
            </OverlayTrigger>;
    }
    else
    {
      return null;
    }
  }
}

CloseContext.propTypes =
  { clearexternalroleid: PropTypes.func.isRequired
  , hascontext: PropTypes.bool.isRequired
  };
