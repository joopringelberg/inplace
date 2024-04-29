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

import i18next from "i18next";
import { Container, Button, Modal, Row, Col, Form} from "react-bootstrap";

// Render in the App. 
// To trigger a message, set message and acknowledge.
// the acknowledge function should
//  - resolve a promise that is used to signal acknowledgement to the UserMessaging instance;
//  - set props.message to undefined, so the Modal is no longer shown.
export class UploadKeypairDialog extends Component
{
  constructor()
  {
    super();
    this.state = 
      { closed: false
      , showIdentityUploadButton: false
      , keypair: undefined
      , restoreSystem: false
    }
  }


  uploadKeypair( event )
  {
    if ( event.type == "click")
    {
      // upload a file. On submitting, the end user triggers handleKeypairUpload.
      document.getElementById('uploadKeypair').click();
    }
    else if ( event.keyCode == 32 )
    {
      // upload a file.
      document.getElementById('uploadKeypair').click();
    }    
  }

  uploadIdentityDoc( event )
  {
    if ( event.type == "click")
    {
      // upload a file. On submitting, the end user triggers handleKeypairUpload.
      document.getElementById('uploadIdentityDoc').click();
    }
    else if ( event.keyCode == 32 )
    {
      // upload a file.
      document.getElementById('uploadIdentityDoc').click();
    }    
  }

  handleKeypairUpload(event)
  {
    const component = this;
    const fileList = event.target.files;
    let json;
    if  ( fileList.length > 0 &&
          fileList.item(0).name.match( /.*\.json/)
        )
      {
        fileList.item(0).text()
          .then( t => 
            {
              try
                { 
                  json = JSON.parse(t);
                  if (json.publicKey && json.privateKey)
                  {
                    // Do not close the Dialog yet.
                    // Instead, show the second upload button that asks for the identitydocument.
                    // Only when that happens, resolve the promise.
                    component.setState({showIdentityUploadButton: true, keypair: json});
                  }
                  else
                  {
                    component.setState({closed: true});
                    component.props.keypairuploadrejecter( i18next.t("uploadkeypairdialog_wrongJson", {ns: 'mycontexts'}) );
                  }
                }
              catch(e)
                {
                  // Abort the installation process.
                  component.setState({closed: true});
                  component.props.keypairuploadrejecter(e);
                }})
          .catch( reason => component.props.keypairuploadrejecter( reason ))
      }
      else
      {
        component.setState({closed: true});
        component.props.keypairuploadresolver(false);
      }
  }

  handleIdentityDocUpload(event)
  {
    const component = this;
    const fileList = event.target.files;
    let json;
    if  ( fileList.length > 0 &&
          fileList.item(0).name.match( /.*\.json/)
        )
      {
        fileList.item(0).text()
          .then( t => 
            {
              try
                { 
                  json = JSON.parse(t);
                  if (json.author && json.timeStamp && json.deltas && json.publicKeys)
                  {
                    component.setState({closed: true});
                    component.props.keypairuploadresolver(
                      { keypair: component.state.keypair
                      , restoreSystem: component.state.restoreSystem 
                      , identityDocument: json});
                  }
                  else
                  {
                    component.setState({closed: true});
                    component.props.keypairuploadrejecter( i18next.t("uploadkeypairdialog_wrongIdentityJson", {ns: 'mycontexts'}) );
                  }
                }
              catch(e)
                {
                  // Abort the installation process.
                  component.setState({closed: true});
                  component.props.keypairuploadrejecter(e);
                }})
          .catch( reason => component.props.keypairuploadrejecter( reason ))
      }
      else
      {
        component.setState({closed: true});
        component.props.keypairuploadresolver(false);
      }
  }

  reject()
  {
    this.setState({closed: true});
    this.props.keypairuploadresolver(false);
  }

  setRestore(event)
  {
    const component = this;
    if (component.state.restoreSystem != event.target.checked)
    {
      component.setState({restoreSystem: event.target.checked});
    }
  }

  render()
  {
    const component = this;
    return <Modal 
      backdrop="static"
      show={!!component.props.keypairuploadresolver && !component.state.closed}>
      <Modal.Header closeButton onHide={ () => component.reject()}>
        <Modal.Title>{ i18next.t("uploadkeypairdialog_Title", {ns: "mycontexts"}) }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className="alert alert-secondary">{ i18next.t("uploadkeypairdialog_Message", {ns: "mycontexts"}) }</Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Container>
          <Row className="mb-2">
            <Col>
              <Form>
                <Form.Check 
                  id="restoreSystem"
                  type="checkbox" 
                  label={ i18next.t( "uploadkeypairdialog_restoreSystem", {ns: "mycontexts"})}
                  onChange={ e => component.setRestore( e )}
                />
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button 
                disabled={component.state.showIdentityUploadButton}
                variant="primary" 
                onClick={ e => component.uploadKeypair( e ) }
                onKeyDown={ e => component.uploadKeypair(e) }
                >
                { i18next.t( "uploadkeypairdialog_Upload", {ns: "mycontexts"} ) }
              </Button>
            </Col>
            <Col>
              <Button
                disabled={!component.state.showIdentityUploadButton}
                variant="primary" 
                onClick={ e => component.uploadIdentityDoc( e ) }
                onKeyDown={ e => component.uploadIdentityDoc(e) }
                >
                { i18next.t( "uploadkeypairdialog_UploadIdentityDoc", {ns: "mycontexts"} ) }
              </Button>
            </Col>
            <Col>
              <Button 
                variant="secondary" 
                onClick={ e => component.reject( e ) }
                onKeyDown={ e => component.reject(e) }
                >
                { i18next.t( "uploadkeypairdialog_Reject", {ns: "mycontexts"} ) }
              </Button>
            </Col>
          </Row>
        </Container>
      </Modal.Footer>
      <input type="file" id="uploadKeypair" style={{display: "none"}} onChange={ev => component.handleKeypairUpload(ev)}/>
      <input type="file" id="uploadIdentityDoc" style={{display: "none"}} onChange={ev => component.handleIdentityDocUpload(ev)}/>
    </Modal>
  }
}

UploadKeypairDialog.propTypes = 
  { keypairuploadresolver: PropTypes.func.isRequired
  , keypairuploadrejecter: PropTypes.func.isRequired
  };