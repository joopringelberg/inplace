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
import PropTypes from "prop-types";
import 
  {
  importTransaction,
  } from "perspectives-react";

import i18next from "i18next";
import { Container, Button, Modal, Row, Col } from "react-bootstrap";

// Render in the App. 
// To trigger a message, set message and acknowledge.
// the acknowledge function should
//  - resolve a promise that is used to signal acknowledgement to the UserMessaging instance;
//  - set props.message to undefined, so the Modal is no longer shown.
export class SaveKeypairDialog extends Component
{
  constructor()
  {
    super();
    this.state = 
      { closed: false
    }
  }

  // Closing the dialog means: not saving and aborting the installation.
  close()
  {
    this.setState({closed: true});
    this.props.keypairsaverejecter( i18next.t("keypairNotSaved_message", {ns: 'mycontexts'}) );
  }

  download( event )
  {
    const component = this;
    function doit()
    {
      event.stopPropagation();
      event.preventDefault();
      const file = new File( [JSON.stringify(component.props.keypair)], "perspectivesCryptographicKeypair.json", {type: "application/json"});
      const element = document.createElement('a');
      const url = window.URL.createObjectURL(file);
      element.style.display = 'none';
      element.href = url;
      element.setAttribute('download', file.name);
      document.body.appendChild(element);  
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
      component.setState({closed: true})
      component.props.keypairsaveresolver();
    }
    if ( event.type == "click")
    {
      doit();
    }
    else if ( event.keyCode == 32 )
    {
      doit();
    }    
  }

  // Returns a promise for a jston File object that holds the structure {publicKey, privateKey}.
  constructFile()
  {
    return new File( [JSON.stringify(this.props.keypair)], "perspectivesCryptographicKeypair.json", {type: "application/json"});
  }

  render()
  {
    const component = this;
    return <Modal 
      backdrop="static"
      show={!!component.props.keypairsaveresolver && !component.state.closed}>
      <Modal.Header closeButton onHide={ () => component.close()}>
        <Modal.Title>{ i18next.t("savekeypairdialog_Title", {ns: "mycontexts"}) }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className="alert alert-secondary">{ i18next.t("savekeypairdialog_Message", {ns: "mycontexts"}) }</Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Container>
          <Col>

            <Button 
              variant="primary" 
              onClick={ e => component.download( e ) }
              onKeyDown={ e => component.download(e) }
              >
              { i18next.t( "savekeypairdialog_Download", {ns: "mycontexts"} ) }
            </Button>

          </Col>
        </Container>
      </Modal.Footer>
    </Modal>
  }
}

SaveKeypairDialog.propTypes = 
  { keypairsaveresolver: PropTypes.func.isRequired
  , keypairsaverejecter: PropTypes.func.isRequired
  , keypair: PropTypes.any.isRequired
  };