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
import { Container, Button, Form, Modal, Row, Col, Badge } from "react-bootstrap";

// Render in the App. 
// To trigger a message, set message and acknowledge.
// the acknowledge function should
//  - resolve a promise that is used to signal acknowledgement to the UserMessaging instance;
//  - set props.message to undefined, so the Modal is no longer shown.
export class InvitationImportDialog extends Component
{
  constructor()
  {
    super();
    this.state = 
      { submittedCode: undefined
      , message: undefined
      , fileJSON: undefined
      , error: false
    }
  }

  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    const theFile = component.props.thefile;
    if ( theFile && ! prevProps.thefile )
    {
      if (theFile.type == "application/json")
      {
        theFile.text().then( function(t)
        {
          // {message, transaction, confirmation}
          const json = JSON.parse(t);
          component.setState( {message: json.message, fileJSON: json })
        });
      }
    }
  }

  validateCode(e)
  {
    const component = this;
    const fileJSON = component.state.fileJSON;
    const theFile = component.props.thefile;
    e.stopPropagation();
    if ( component.state.submittedCode == fileJSON.confirmation )
    {
      importTransaction(new File( [fileJSON.transaction], theFile.name, {type: theFile.type } ) );
      component.close();
    }
    else
    {
      component.setState({ submittedCode: undefined, error: true })
    }

  }

  close()
  {
    this.setState({message: undefined, submittedCode: undefined, fileJSON: undefined, error: false});
    this.props.setdroppedfile(undefined);
  }

  render()
  {
    const component = this;
    return <Modal 
      backdrop="static"
      show={!!component.state.message}>
      <Modal.Header closeButton onHide={ () => component.close()}>
        <Modal.Title>{ i18next.t("invitationimportdialog_Title", {ns: "mycontexts"}) }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className="alert alert-secondary">{component.state.message}</Row>
          <Row>
            <Form.Group as={Row} controlId="formHorizontalEmail">
              <Form.Label column sm={8}>
                { i18next.t( "invitationimportdialog_ConfirmationLabel", {ns: "mycontexts"})}
              </Form.Label>
              <Col sm={4}>
                <Form.Control type="text" placeholder="Code" onBlur={ e => component.setState({submittedCode: e.target.value, error: undefined })}/>
              </Col>
            </Form.Group>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Container>
          <Col>
            <Button disabled={!component.state.submittedCode} variant="primary" onClick={ e => component.validateCode( e ) }>
              { i18next.t( "invitationimportdialog_Submit", {ns: "mycontexts"} ) }
            </Button>
          </Col>
          <Col>
          {
            component.state.error ?
            <Badge className="mt-3 p-3" variant="danger">{i18next.t( "invitationimportdialog_InvalidCode", {ns: "mycontexts"} )}</Badge>
            : null
            }
          </Col>
        </Container>
      </Modal.Footer>
    </Modal>
  }
}

InvitationImportDialog.propTypes = 
  { thefile: PropTypes.any
  , setdroppedfile: PropTypes.func.isRequired
  };