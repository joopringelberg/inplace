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
      What role do you want, and where?
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
                  <HomeIcon alt="Choose a role" aria-label="What role do you want, and where?" size="medium"/>
              </div>
            </OverlayTrigger>;
  }
}

MoveToModelsOverview.propTypes =
  { systemexternalrole: PropTypes.string.isRequired
  };
