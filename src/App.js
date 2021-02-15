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
import "./App.css";
import { SharedWorkerChannelPromise, configurePDRproxy, PDRproxy } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import {
    PSContext,
    RoleInstances,
    PSRol,
    PSRoleInstances,
    PSView,
    AppContext,
    View,
    Screen,
    RemoveRol,
    importTransaction,
    MySystem,
    RoleInstanceIterator,
    FileDropZone,
    ViewOnExternalRole,
    ContextInstance,
    ExternalRole,
    PerspectivesComponent,
    isQualifiedName,
    isExternalRole,
    deconstructContext,
    externalRole
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';

import {TrashcanIcon, DesktopDownloadIcon, BroadcastIcon, PencilIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {couchdbHost, couchdbPort} from "./couchdbconfig.js";
import PerspectivesGlobals from "./perspectivesGlobals.js";

export default class App extends Component
{
  constructor(props)
  {
    super(props);
    const component = this;
    // This stub is replaced by a function constructed in the addOpenContextOrRoleForm behaviour
    // whenever the user starts dragging a role that supports that behaviour.
    this.eventDispatcher = {eventDispatcher: function(){}};
    this.state =
      { loggedIn:  false
      , username: ""
      , password: ""
      , host: couchdbHost
      , port: couchdbPort
      , authenticationFeedback: undefined
      , resetAccount: false
      , couchdbInstalled: false
      , usersConfigured: false
      , isFirstChannel: false
      , hasContext: false
      , indexedContextNameMapping: undefined
      , contextId: undefined
      , formMode: false

      , setusername: function(usr)
        {
          component.setState({username: usr, authenticationFeedback: undefined});
        }
      , setpassword: function(pwd)
        {
          component.setState({password: pwd, authenticationFeedback: undefined});
        }
      , authenticate: function()
        {
          if (component.state.resetAccount)
          {
            SharedWorkerChannelPromise.then( function (proxy)
              {
                proxy.resetAccount(component.state.username, component.state.password, component.state.host, component.state.port, PerspectivesGlobals.publicRepository,
                  function(success) // eslint-disable-line
                  {
                    if (!success)
                    {
                      alert("Unfortunately your account could not be reset and may be in an undefined state. You can reset by hand by opening Fauxton and removing all three databases whose name starts with your username.");
                    }
                    window.location.reload();
                  });
                });
          }
          else
          {
            SharedWorkerChannelPromise.then( function (proxy)
              {
                proxy.authenticate(component.state.username, component.state.password, component.state.host, component.state.port, PerspectivesGlobals.publicRepository).then(
                  function(n) // eslint-disable-line
                  {
                    switch (n) {
                      // UnknownUser
                      case 0:
                        component.setState({authenticationFeedback: "This combination of username and password is unknown."});
                        break;
                      // WrongPassword
                      case 1:
                        component.setState({authenticationFeedback: "Detected a valid Couchdb System Admin who is not yet an InPlace user. However, an error occurred on creating a new InPlace account!"});
                        break;
                      // OK
                      case 2:
                        component.setState({loggedIn: true});
                        break;
                      }
                    });
             });
         }
       }};
    this.usesSharedWorker = typeof SharedWorker != "undefined";
    if (this.usesSharedWorker)
    {
      configurePDRproxy("sharedWorkerChannel");
    }
    else
    {
      // configurePDRproxy( "hostPageChannel", { pageHostingPDRPort });
      import( "perspectives-pageworker" ).then( pageWorker => configurePDRproxy( "hostPageChannel", { pageHostingPDRPort: pageWorker.default }));
    }
  }

  componentDidMount ()
  {
    function parseContextString (s)
    {
      // web+cw:MySystem
      const matchResults = s.match(/web\+cw:(.*)/); // Array [ "web+cw:MySystem", "MySystem" ]
      if (matchResults)
      {
        return matchResults[1];
      }
      else return s;
    }

    const component = this;
    const queryStringMatchResult = window.location.search.match(/\?(.*)/);
    // look up the base url of Couchdb and set couchdbInstalled to true if found.
    fetch( component.state.host + ":" + component.state.port ).then(function(response) {
      if (response.ok)
      {
        component.setState( {couchdbInstalled: true} );
      } } );
    // Find out if a user has been configured. In other words, if the db is in partymode. Any account information would do. The localusers database is not public.
    fetch(component.state.host + ":" + component.state.port + "/localusers", {method:'GET' })
      .then(function(response)
        {
          if (response.status == 401 || response.status == 200)
          {
            // Database exists and cannot be accessed without authentication with an authorized account (check for 200 is just in case).
            component.setState( {usersConfigured: true } );
          }
        });
    // Check login status first. If we combine it with context name matching, we'll see a login screen first
    // even if we've logged in before, because we have to wait for the PDRProxy.
    Promise.all(
      [ SharedWorkerChannelPromise.then( proxy => proxy.channelId)
      , SharedWorkerChannelPromise.then( proxy => proxy.isUserLoggedIn() )
      ]).then( function( results )
        {
          const setter = { isFirstChannel: results[0] == 1000000 };
          if (results[1] && !component.state.loggedIn )
          {
            setter.loggedIn = true;
          }
          component.setState( setter );
        })
      .catch(function(e)
        {
          // For debugging purposes.
          // eslint-disable-next-line no-console
          console.warn( e );
        });
    if ( queryStringMatchResult )
    {
      // This can be
      //  * a well-formed role identifier, assumed to be a context role;
      //  * a well-formed external role identifier;
      //  * an arbitrary approximation of an indexed name of a Context.
      if ( isQualifiedName(queryStringMatchResult[1]) )
      {
        if ( isExternalRole(queryStringMatchResult[1]) )
        {
          component.setState( {hasContext:true, contextId: deconstructContext( queryStringMatchResult[1] )});
        }
        else
        {
          // Assume a context role. Now request the binding and set its context.
          PDRproxy.then( proxy => proxy.getBinding( queryStringMatchResult[1],
            function (bindingIds)
              {
                if (bindingIds.length > 0)
                {
                  if ( isExternalRole (bindingIds[0]))
                  {
                    component.setState( {hasContext: true, contextId: deconstructContext( bindingIds[0]) });
                  }
                }
                // Otherwise, either not a context role after all, or no binding. Do not try to open a context.
              }));
        }
      }
      else
      {
        PDRproxy
          .then( proxy => proxy.matchContextName( parseContextString( queryStringMatchResult[1] )))
          .then( function (serialisedMapping)
            {
              // If we find no matches, we just return the ordinary full start screen (we might want to offer an explanation).
              if ( serialisedMapping[0] != "{}" )
              {
                component.setState( {hasContext: true, indexedContextNameMapping: JSON.parse( serialisedMapping[0] ) });
              }
            });
      }
    }
  }

  handleKeyDown(event, systemExternalRole)
  {
    switch(event.keyCode)
    {
      case 27: // Escape
        // Empty clipboard.
        PDRproxy.then( pproxy => pproxy.deleteProperty(
          systemExternalRole,
          "model:System$PerspectivesSystem$External$CardClipBoard",
          "model:System$PerspectivesSystem$External") );
        event.preventDefault();
        break;
    }
  }

  render ()
  {
    const component = this;
    if (component.state.couchdbInstalled)
    {
        if (!component.state.loggedIn)
        {
          return (<Container>
              <Row>
                <header className="App-header">
                  <h1>Login</h1>
                </header>
              </Row>
              <Row className="pb-3">
                {component.state.usersConfigured ? <p>Enter the username and password for an InPlace user on this computer. Alternatively, to create a new InPlace user, enter a valid combination of username and password of a Couchdb Server Admin.</p> : <Welcome/>}
              </Row>
              <Row>
                <Form>
                  <Form.Group as={Row} controlId="username">
                    <Col sm="4">
                      <Form.Label>Login name:</Form.Label>
                    </Col>
                    <Col sm="8">
                      <Form.Control
                      placeholder="Username" aria-describedby="usernameDescription" aria-label="Username" onBlur={e => component.state.setusername(e.target.value)} autoFocus/>
                    </Col>
                    <p id="usernameDescription" aria-hidden="true" hidden>Enter your self-chosen username here</p>
                  </Form.Group>
                  <Form.Group as={Row} controlId="password">
                    <Form.Label column sm="4">Password:</Form.Label>
                    <Col sm="8">
                      <Form.Control type="password" placeholder="Password" aria-label="Password" onBlur={e => component.state.setpassword(e.target.value)}/>
                    </Col>
                  </Form.Group>
                  <Button variant="primary" onClick={() => component.state.authenticate()}>Login</Button>
                  <Form.Group>
                    <Col sm="6">
                      <Form.Label>Check to reset account (removes all data!):</Form.Label>
                    </Col>
                    <Col sm="6">
                    <InputGroup.Checkbox
                      aria-label="Check to reset account"
                      onChange={e => component.setState( {resetAccount: e.target.value == "on" } ) }/>
                    </Col>
                  </Form.Group>
                  <Form.Group>
                    <br/>
                    {(component.state.authenticationFeedback) &&
                      (<Card bg="danger" text="white" style={{ width: '18rem' }}>
                        <Card.Body>
                          <Card.Title>{component.state.authenticationFeedback}</Card.Title>
                        </Card.Body>
                      </Card>)}
                  </Form.Group>
                </Form>
              </Row>
              <Row>
                <Button variant="primary" onClick={() => navigator.registerProtocolHandler("web+cw",
                                                  "https://inplacelocal.works/?context=%s",
                                                  "Context Web handler")
                                                }>Register web+cw: protocol</Button>
              </Row>
          </Container>);
        }
        else
        {
          return (
            <MySystem>
              <PSContext.Consumer>{ mysystem =>
                <AppContext.Provider value={
                  { systemExternalRole: externalRole(mysystem.contextinstance)
                  , systemUser: mysystem.myroletype
                  , setEventDispatcher: function(f)
                      {
                        component.eventDispatcher.eventDispatcher = f;
                      }}}>
                  <Container>
                    <div onKeyDown={event => component.handleKeyDown(event, externalRole(mysystem.contextinstance) )}>
                      <Navbar bg={component.usesSharedWorker || !component.state.isFirstChannel ? "light" : "danger"} expand="lg" role="banner" aria-label="Main menu bar" className="justify-content-between">
                        <Navbar.Brand tabIndex="-1" href="#home">InPlace</Navbar.Brand>
                        <Nav>
                          <CardClipBoard systemExternalRole={externalRole(mysystem.contextinstance)}/>
                          <OpenRoleFormTool eventDispatcher={component.eventDispatcher}/>
                          <FileDropZone
                            tooltiptext="Drop an invitation file here or press enter/space"
                            handlefile={ importTransaction }
                            extension=".json"
                            className="ml-3 mr-3">
                            <DesktopDownloadIcon aria-label="Drop an invitation file here" size='medium'/>
                          </FileDropZone>
                          <RemoveRol>
                            <Trash/>
                          </RemoveRol>
                          <ConnectedToAMQP/>
                        </Nav>
                      </Navbar>
                      {
                        component.state.hasContext ? RequestedContext(component.state.contextId, component.state.indexedContextNameMapping) : ApplicationSwitcher()
                      }
                    </div>
                  </Container>
                </AppContext.Provider>
              }</PSContext.Consumer>
            </MySystem>
          );
        }
    }
    else {
      return (<Card>
          <Card.Header as="h5" role="heading" aria-level="1">Couchdb installation required</Card.Header>
          <Card.Body>
            <Card.Title role="heading" aria-level="2">No Couchdb detected</Card.Title>
            <Card.Text>
              InPlace cannot detect a Couchdb instance on your computer. This may have the following reasons:
            </Card.Text>
            <ol>
              <li>Couchdb was not installed. See instructions below.</li>
              <li>Couchdb was installed, but is not running. Start Couchdb on your computer, then restart InPlace.</li>
              <li>Couchdb is running, but not on the default port 5984. Currently it is not possible to configure the port Perspectives uses to access Couchdb. Try to make Couchdb listen on port 5984.</li>
            </ol>
            <Card.Title role="heading" aria-level="2">How to install Coudchb</Card.Title>
            <Card.Text>Just download, install, start and verify Couchdb. You need not follow instructions in the Couchdb documents. Just perform the steps below.</Card.Text>
            <ol variant="flush">
              <li>Download Couchb version 3.1.0 from <a href="https://couchdb.apache.org/#download">Couchdb</a>.</li>
              <li>Run Couchdb. An small dialog will appear stating: &quot;No CouchDB Admin password found&quot;. Enter a password and remember it well!</li>
              <li>This will open up a page in your webbrowser: this is the Fauxton admin interface. If this does not happen, click <a href="http://127.0.0.1:5984/_utils">here</a>.</li>
              <li>Enter &quot;admin&quot; for username and the password you&apos;ve just set.</li>
              <li>Verify the install by clicking on the Verify button in the left column (the button with the checkmark), then click the button &quot;Verify Installation&quot;.</li>
              <li>Create a new System Admin.
                <ol>
                  <li>Click the lowest button in the left column, select the &quot;Create Server Admin&quot; tab.</li>
                  <li>Enter the name you will use to open InPlace. Enter a password.</li>
                  <li>Click &quot;Create Admin&quot;.</li>
                </ol>
              </li>
              <li>Close InPlace (this application) and start it again. Then enter the username and password you&apos;ve just added to Couchdb.</li>
            </ol>
          </Card.Body>
        </Card>);
    }
  }
}

// indexedContextNameMapping = Object String, holding at least one key-value pair.
function RequestedContext(contextId, indexedContextNameMapping)
{
  if ( !contextId && Object.keys( indexedContextNameMapping ).length > 1 )
  {
    return  <Card>
              <Card.Body>
                <Card.Title>There are multiple matches to your query</Card.Title>
                <ListGroup variant="flush">{
                  Object.keys( indexedContextNameMapping ).map(
                  function(externalRoleId)
                  {
                    const namePartMatch = externalRoleId.match(/\$(.*)/);
                    return <ListGroup.Item key={externalRoleId}><a title={externalRoleId} href={"/?" + externalRole ( indexedContextNameMapping[externalRoleId] )}>{namePartMatch[1]}</a></ListGroup.Item>;
                  }
                )
              }</ListGroup>
            </Card.Body>
          </Card>;
  }
  else if ( contextId )
  {
    return  <ContextInstance contextinstance={contextId}>
            <ExternalRole>
              <PSRol.Consumer>
                { psrol => <Screen rolinstance={psrol.rolinstance}/> }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
  else
  {
    return  <ContextInstance contextinstance={indexedContextNameMapping[ Object.keys( indexedContextNameMapping )[0] ]}>
            <ExternalRole>
              <PSRol.Consumer>
                { psrol => <Screen rolinstance={psrol.rolinstance}/> }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
}

function ApplicationSwitcher()
{
  function handleClick(roleinstance, e)
  {
    if (e.shiftKey || e.ctrlKey || e.metaKey)
    {
      window.open("/?" + roleinstance);
      e.preventDefault();
      e.stopPropagation();
    }

  }
  return  <AppListTabContainer rol="IndexedContexts">
            <Row className="align-items-stretch">
              <Col lg={3} className="App-border-right">
                <Nav variant="pills" className="flex-column" aria-label="Apps" aria-orientation="vertical">
                  <RoleInstanceIterator>
                    <View viewname="allProperties">
                      <PSView.Consumer>
                        {roleinstance => <Nav.Item>
                            <Nav.Link eventKey={roleinstance.rolinstance} onSelect={handleClick}>{roleinstance.propval("Name")}</Nav.Link>
                          </Nav.Item>}
                      </PSView.Consumer>
                    </View>
                  </RoleInstanceIterator>
                </Nav>
              </Col>
              <Col lg={9}>
                <Tab.Content>
                  <RoleInstanceIterator>
                    <PSRol.Consumer>{ roleinstance =>
                      <Tab.Pane eventKey={roleinstance.rolinstance}>
                        <PSRol.Consumer>
                          { psrol => <Screen rolinstance={psrol.rolinstance}/> }
                        </PSRol.Consumer>
                      </Tab.Pane>}
                    </PSRol.Consumer>
                  </RoleInstanceIterator>
                </Tab.Content>
              </Col>
            </Row>
          </AppListTabContainer>;
}

function Welcome(){
  return <Card>
          <Card.Header as="h5">Welcome to InPlace</Card.Header>
          <Card.Body>
            <Card.Text>There is no user of this InPlace installation yet. Enter the username and password you&apos;ve used to create a Server Admin in Couchdb. If you have not done that yet, follow these instructions:</Card.Text>
            <ol>
              <li>Go to the <a href="http://127.0.0.1:5984/_utils">Fauxton admin interface</a>.</li>
              <li>Enter &quot;admin&quot; for username and the password you&apos;ve set on installing Couchdb.</li>
              <li>Click the lowest button in the left column, select the &quot;Create Server Admin&quot; tab. </li>
              <li>Enter the name you will use to open InPlace. Enter a password.</li>
              <li>Click &quot;Create Admin&quot;.</li>
              <li>Finally close InPlace (this program) and open it again.</li>
            </ol>
          </Card.Body>
        </Card>;
}

////////////////////////////////////////////////////////////////////////////////
// APPLISTTABCONTAINER
////////////////////////////////////////////////////////////////////////////////
function AppListTabContainer (props)
{
  class AppListTabContainer_ extends React.PureComponent
  {
    constructor(props)
    {
      super(props);
      this.state={};
    }
    componentDidMount()
    {
      if (this.context.instances[0])
      {
        this.setState({ firstApp: this.context.instances[0] });
      }
    }

    componentDidUpdate()
    {
      if (this.context.instances[0])
      {
        this.setState({ firstApp: this.context.instances[0] });
      }
    }

    render ()
    {
      if (this.state.firstApp)
      {
        return  <Tab.Container id="apps" mountOnEnter={true} unmountOnExit={true} defaultActiveKey={this.state.firstApp}>
                  { // eslint-disable-next-line react/prop-types
                    this.props.children}
                </Tab.Container>;
      }
      else {
        return <div/>;
      }
    }
  }
  AppListTabContainer_.contextType = PSRoleInstances;

  return (<RoleInstances rol={props.rol}>
      <AppListTabContainer_>{
         // eslint-disable-next-line react/prop-types
        props.children }</AppListTabContainer_>
    </RoleInstances>);
}

AppListTabContainer.propTypes = { "rol": PropTypes.string.isRequired };

////////////////////////////////////////////////////////////////////////////////
// CARDCLIPBOARD
////////////////////////////////////////////////////////////////////////////////
class CardClipBoard extends PerspectivesComponent
{
  componentDidMount()
  {
    const component = this;
    PDRproxy.then( pproxy =>
      component.addUnsubscriber(
        pproxy.getProperty(
          component.props.systemExternalRole,
          "model:System$PerspectivesSystem$External$CardClipBoard",
          "model:System$PerspectivesSystem$External",
          function (valArr)
          {
            let info;
            if (valArr[0])
            {
              info = JSON.parse( valArr[0]);
              if (info.cardTitle)
              {
                component.setState(info);
              }
              else
              {
                component.setState({cardTitle: undefined}); // WERKT DIT WEL?
              }
            }
            else
            {
              component.setState({cardTitle: undefined}); // WERKT DIT WEL?
            }
          })));
  }

  render ()
  {
    if (this.state && this.state.cardTitle)
    {
      return <Container><Badge variant="info">{this.state.cardTitle}</Badge></Container>;
    }
    else {
      return null;
    }

  }
}

CardClipBoard.propTypes = {systemExternalRole: PropTypes.string.isRequired};

function Trash(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="trash-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Drop a card here to remove it
    </Tooltip> );

  const eventDiv = React.createRef();

  return  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                  <div
                      ref={eventDiv}
                      onDragOver={ev => ev.preventDefault()}
                      className="ml-3 mr-3"
                      aria-dropeffect="execute"
                      aria-describedby="trash-tooltip"
                      tabIndex="0"
                      onDrop={ev => {
                         // eslint-disable-next-line react/prop-types
                        props.removerol( JSON.parse( ev.dataTransfer.getData("PSRol") ) ); ev.target.classList.remove("border", "p-3", "border-primary");}}
                      onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                      onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                      <TrashcanIcon alt="Thrashcan" aria-label="Drop a card here to remove it" size='medium'/>
                  </div>
            </OverlayTrigger>;
}

function ConnectedToAMQP()
{
  return  <ViewOnExternalRole viewname="allProperties">
            <PSView.Consumer>
            {
              roleinstance => roleinstance.propval("ConnectedToAMQPBroker")[0] == "true" ? <BroadcastIcon alt="Connected" aria-label="InPlace can send and receive messages" size='medium'/> : <div/>
            }
            </PSView.Consumer>
          </ViewOnExternalRole>;
}

function OpenRoleFormTool(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="formmode-tooltip" {...props} show={
       // eslint-disable-next-line react/prop-types
      props.show.toString()}>
      Drop a role here to edit its properties
    </Tooltip> );

  const eventDiv = React.createRef();

  return  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                  <div
                      ref={eventDiv}
                      onDragOver={ev => ev.preventDefault()}
                      className="ml-3 mr-3"
                      aria-dropeffect="execute"
                      aria-describedby="formmode-tooltip"
                      tabIndex="0"
                      onDrop={ev => {
                        // The function in eventDispatcher is put there by the addOpenContextOrRoleForm behaviour triggered
                        // on the element the user started to drag. It causes a OpenRoleForm event to be thrown from that element.
                        // eslint-disable-next-line react/prop-types
                        props.eventDispatcher.eventDispatcher( JSON.parse( ev.dataTransfer.getData( "PSRol" ) ).rolinstance );
                        ev.target.classList.remove("border", "p-3", "border-primary");
                        }}
                      onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                      onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                      <PencilIcon alt="OpenRoleFormTool" aria-label="Drop a role here to edit its properties" size="medium"/>
                  </div>
            </OverlayTrigger>;
}

OpenRoleFormTool.propTypes =
  { eventDispatcher: PropTypes.object.isRequired
  };
