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
/*

This module exports a number of modules to the global scope (window object).
The Webpack configuration of the Screens modules externalises these modules.
The same holds for perspectives-react.
*/
import React from "react";


import PerspectivesGlobals from "./perspectivesGlobals.js";

import * as ReactDOM from "react-dom";

import * as PrimerOcticonsReact from '@primer/octicons-react';

import * as PropTypes from "prop-types";

import * as ReactBootstrap from "react-bootstrap"

window.React = React;
window.PerspectivesGlobals = PerspectivesGlobals;
window.ReactDOM = ReactDOM;
window.PrimerOcticonsReact = PrimerOcticonsReact;
window.PropTypes = PropTypes;
window.ReactBootstrap = ReactBootstrap;
