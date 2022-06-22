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
import {HomeIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

export default class MoveToModelsOverview extends Component
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
    component.ref.current.dispatchEvent( new CustomEvent('OpenContext', { detail: component.props.systemexternalrole, bubbles: true }) );
  }

  render()
  {
    const component = this;
    const renderTooltip = (props) => (
    <Tooltip id="moveToModelsOverview-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Home - the system context
      Click (or select and press space).
    </Tooltip> );

    return  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
              <div
                  ref={component.ref}
                  className="ml-3 mr-3"
                  aria-describedby="moveToModelsOverview-tooltip"
                  tabIndex="0"
                  onKeyDown={ e => component.handleKeyDown(e) }
                  onClick={ () => component.navigate() }
                  >
                  <HomeIcon alt="Choose a role" aria-label="Home - the system context" size="medium"/>
              </div>
            </OverlayTrigger>;
  }
}

MoveToModelsOverview.propTypes =
  { systemexternalrole: PropTypes.string.isRequired
  };
