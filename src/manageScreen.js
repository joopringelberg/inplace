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

import
  { Button
  , Row
  , Col
  , Container
  , Card
  } from "react-bootstrap";

import './splash.css';

import './bootstrap.css'

export default function ManageScreen()
{
  return  <div className="introductionSplash text-muted">
            <div className="bg-primary text-white pb-3">
              <Container>
                <h1 className="text-center pt-5">MyContexts</h1>
              </Container>
            </div>

            <Container>
              <Row className="pt-5">
                <h2>Manage MyContexts installations in this browser</h2>
              </Row>
              <Row>
                <p>This page contains several links to help you manage your MyContexts installation (or even installations).</p>
              </Row>
              <Row>
                <Col className="alert alert-danger">
                  Remove your (default) installation. If you have just a single installation in this browser (the default situation), 
                  the button on the right takes you to a page that will begin to remove all associated data from this browser's database immediately.
                </Col>
                <Col className="d-flex align-items-center">
                  <a className="badge badge-pill badge-danger p-3" href="/?deleteaccount=true">Completely remove your installation</a>
                </Col>
              </Row>
              <Row>
                <Col className="alert alert-secondary">
                  Create more installations, delete one or more, or reset an installation.
                  This will take you to a page that offers a lot of functionality to manage installations.
                  This is also the place to go if you want to create an installation that stores information
                  in an instance of Couchdb that you might have running on your local machine, or, indeed, an 
                  account somewhere on the web.
                </Col>
                <Col className="d-flex align-items-center">
                  <a className="badge badge-pill badge-secondary p-3" href="/?manualaccountcreation=true">Extended installation creation</a>
                </Col>
              </Row>
              <Row>
                <Col className="alert alert-success">
                  Recompile all your models. As MyContexts is under active development, it may occur that the <em>form</em> of the models
                  that you have copied into your local storage are no longer compatible with the version of MyContexts that comes from
                  the website. Your models then need to be <em>recompiled</em>. Usually this will happen automatically but we include this
                  facility just in case. It is harmless to run this operation when your models are still compatible.
                </Col>
                <Col className="d-flex align-items-center">
                  <a className="badge badge-pill badge-success p-3" href="/?recompilelocalmodels=true">Recompile local models</a>
                </Col>
              </Row>
              <Row>
              <Col className="alert alert-light">
                  I have finished here. Just take me to my contexts!
                </Col>
                <Col className="d-flex align-items-center">
                  <a className="badge badge-pill badge-light p-3" href="/">Start MyContexts</a>
                </Col>
              </Row>
              
            </Container>
          </div>
}
