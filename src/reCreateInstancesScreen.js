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
  , Container
  } from "react-bootstrap";

import './splash.css';

import './bootstrap.css'

export default function ReCreateInstancesScreen(props)
{
  const appLocation = location.origin + location.pathname;
  if ( props.recreationstate == "success")
  {
    document.body.style.cursor = "pointer";
  }
  else
  {
    document.body.style.cursor = "wait";
  }
  return  <div className="introductionSplash text-muted">
            <div className="bg-primary text-white pb-3">
              <Container>
                <h1 className="text-center pt-5">MyContexts</h1>
              </Container>
            </div>

            <Container>
              <Row className="pt-5">
                <h2>Re-creating local instances</h2>
              </Row>
              <Row>
              <p>All instances (roles and contexts) will be removed. New initial instances will be created, based on the versions of the basic models available locally. Please wait...</p>
              </Row>
              <Row>
              {
                props.recreationstate == "success" ?
                <>
                  Done! Your instances have been re-created. You may now continue to MyContexts. <span>&nbsp;</span>
                  <Button size="sm" variant="success" onClick={ () => window.location = appLocation} >Start MyContexts</Button>
                </>
                :
                props.recreationstate == "failure" ?
                <p className="alert alert-dismissible alert-danger">Unfortunately, instances could not be re-created. This is a system breakdown. We apologize</p>
                :
                null
              }
              </Row>
            </Container>
          </div>
}
