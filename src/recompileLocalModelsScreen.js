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

export default function RecompileLocalModelsScreen(props)
{
  const url = new URL(document.location.href);
  return  <div className="introductionSplash text-muted">
            <div className="bg-primary text-white pb-3">
              <Container>
                <h1 className="text-center pt-5">MyContexts</h1>
              </Container>
            </div>

            <Container>
              <Row className="pt-5">
                <h2>Recompiling the local models</h2>
              </Row>
              <Row>
              <p>Due to a change to the underlying system (or because you triggered it yourself), all the models you've installed are now being recompiled. Please wait...</p>
              </Row>
              <Row>
              {
                props.recompilationstate == "success" ?
                <>
                  Done! All models compiled successfully. You may now continue to MyContexts. <span>&nbsp;</span>
                  <Button size="sm" variant="success" onClick={ () => window.location = url.origin} >Start MyContexts</Button>
                </>
                :
                props.recompilationstate == "failure" ?
                <p className="alert alert-dismissible alert-danger">Unfortunately, not all models could be recompiled. This is a system breakdown. We apologize</p>
                :
                null
              }
              </Row>
            </Container>
          </div>
}
