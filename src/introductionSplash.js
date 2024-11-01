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

import
  { Button
  , Row
  , Col
  , Container
  , Card
  } from "react-bootstrap";

import './splash.css';

import './bootstrap.css'
import { SaveKeypairDialog } from "./saveKeypairDialog";
import { UploadKeypairDialog } from "./uploadKeypairDialog";
import { hideCursorWaitingOverlay, showCursorWaitingOverlay } from "./cursor";

export default class IntroductionScreen extends Component
{
  constructor()
  {
    super();
  }

  render()
  {
    const component = this;
    const appLocation = location.origin + location.pathname;
    const url = new URL(appLocation);
    if ( component.props.configurationcomplete)
    {
      hideCursorWaitingOverlay();
    }
    else
    {
      showCursorWaitingOverlay();
    }
    return <div className="introductionSplash text-muted">
        <div className="bg-primary text-white pb-3">
        <Container>
          <h1 className="text-center pt-5">MyContexts</h1>
        </Container>
        </div>
        <Container>
        <h3 className="text-center pt-5 pb-5">Perspectives: a model driven user centered IT approach</h3>
        <Row className="d-flex justify-content-center">
          <Col md={4}>
            <Card className={component.props.configurationcomplete ? "text-white bg-primary" : "text-white bg-secondary"}>
              <Card.Body>{
              component.props.configurationcomplete ?
                <>
                  <Card.Title>Done!</Card.Title>
                  <Card.Text><em>Congratulations.</em> You now have access to the web of contexts and roles that make up the Perspectives Universe.</Card.Text>
                  <Button size="sm" variant="secondary" onClick={() => window.location = url.href}>Enter the context web</Button>
                </>
              :
              <>
                <Card.Title>Doing some work (may take up to 15 seconds)...</Card.Title>
                <Card.Text>Please wait until things are set up.</Card.Text>
              </>
            }</Card.Body></Card>
          </Col>
        </Row>
        <Row className="pt-5">
          <Col>
            <h4>Use</h4>
            <ul className="pl-3">
              <li>Experience a new web.</li>
              <li>Cooperate in a safe environment.</li>
              <li>Just share pages with people you actually work with.</li>
              <li>Store your own information locally.</li>
              <li>Everyone does so: no information is kept on a central server.</li>
            </ul>
          </Col>
          <Col>
            <h4>Extend</h4>
              <ul className="pl-3">
                <li>Add functionality by writing a Model.</li>
                <li>The declarative Perspectives Language is specifically created for cooperation.</li>
                <li>A model is to MyContexts what an App is to an OS.</li>
                <li>Models aren't data silos. All models tap into the same data source.</li>
              </ul>
          </Col>
          <Col>
            <h4>Set up</h4>
            <ul className="pl-3">
              <li>
              Browsing the context web requires a little (automatic) setup in your browser (being done right now). 
              Initial contexts and models are stored automatically in your browsers' database.
              </li>
              <li>
              The next time you visit this site you will go straight into the context web.
              </li>
              <li>
              To remove the setup data (and do a number of other maintenance things), visit this page: <a className="badge badge-primary" href={appLocation + "/manage.html"}>https://mycontexts/manage</a> (you may want to bookmark that page now).
              </li>
            </ul>
          </Col>
        </Row>
        </Container>
        {
          component.props.keypairsaveresolver && 
          component.props.keypairsaverejecter
          ?
          <SaveKeypairDialog keypairsaveresolver={component.props.keypairsaveresolver} keypairsaverejecter={component.props.keypairsaverejecter} keypair={component.props.keypair} perspectivesuserid={component.props.perspectivesuserid}/>
          :
          null
        }
        {
          component.props.keypairuploadresolver &&
          component.props.keypairuploadrejecter
          ?
            <UploadKeypairDialog keypairuploadresolver={component.props.keypairuploadresolver} keypairuploadrejecter={component.props.keypairuploadrejecter} perspectivesuserid={component.props.perspectivesuserid}/>
          :
          null
        }
      </div>;
  }
}

// component.props:
// configurationcomplete
// keypair: https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair
// keypairsaveresolver: use this resolver to continue the installation after the public-private keypair has been saved.
// keypairsaverejecter: use this rejecter to abort the installation when the public-private keypair has NOT been saved.
// keypairuploadresolver: use this resolver to return either true (meaning a keypair has been uploaded) or false (when not).
// keypairuploadrejecter: use when the uploading fails and cannot be corrected.