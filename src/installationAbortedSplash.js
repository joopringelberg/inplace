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
  { Container
  , Alert
  , Row
  , Col
  } from "react-bootstrap";

import i18next from "i18next";
  
import './splash.css';

import './bootstrap.css'

import {thisAppsLocation} from "perspectives-react";

export default function InstallationAborted(props)
{
  const appLocation = thisAppsLocation();
  return  <div className="introductionSplash text-muted">
            <div className="bg-primary text-white pb-3">
              <Container>
                <h1 className="text-center pt-5">MyContexts</h1>
              </Container>
            </div>

            <Container>
              <h3 className="text-center pt-5">{ i18next.t("installationAborted_message", {ns: 'mycontexts'}) }</h3>
              <Row>
                <Col>
                  <Alert variant="info">{ props.reason ? props.reason.toString() : "No further information" }</Alert>
                </Col>
              </Row>
              <Row>
                <Col className="alert alert-secondary">
                  { i18next.t("installationAborted_toManagePage", {ns: 'mycontexts'}) }
                  </Col>
                <Col className="d-flex align-items-center">
                  <a className="badge badge-pill badge-light p-3" href={appLocation + "/manage.html"}>https://mycontexts/manage</a>
                </Col>
              </Row>
            </Container>
          </div>
}
