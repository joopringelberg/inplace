/*
This module exports a number of modules to the global scope (window object).
The Webpack configuration of the Screens modules externalises these modules.
The same holds for perspectives-react.
*/
import React from "react";

import * as PerspectivesReact from "perspectives-react";

import PerspectivesGlobals from "./perspectivesGlobals.js";

import * as ReactDOM from "react-dom";

import * as PrimerOcticonsReact from '@primer/octicons-react';

import * as PropTypes from "prop-types";

import * as ReactBootstrap from "react-bootstrap"

window.React = React;
window.PerspectivesReact = PerspectivesReact;
window.PerspectivesGlobals = PerspectivesGlobals;
window.ReactDOM = ReactDOM;
window.PrimerOcticonsReact = PrimerOcticonsReact;
window.PropTypes = PropTypes;
window.ReactBootstrap = ReactBootstrap;
