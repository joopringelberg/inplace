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
    ContextOfRole,
    RoleInstance,
    RoleFormInView,
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
import ListGroup from 'react-bootstrap/ListGroup';
import Tabs from 'react-bootstrap/Tabs';

import { DesktopDownloadIcon, BroadcastIcon } from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import PerspectivesGlobals from "./perspectivesGlobals.js";

import UnbindTool from "./unbindtool.js";

import OpenRoleFormTool from "./openroleformtool.js";

import Trash from "./trash.js";

import CardClipBoard from "./cardclipboard.js";

// TODO. ZODRA Perspectives.Persistence.API alles heeft overgenomen, kan dit eruit.
import {couchdbHost, couchdbPort} from "./couchdbconfig.js";

import {usersHaveBeenConfigured, addUser, authenticateUser, getUser, detectCouchdb} from "./usermanagement.js";

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
      , user: {}
      , host: couchdbHost
      , port: couchdbPort
      , backend: undefined
      , wrongCredentials: false
      , unknownUserName: false
      , resetAccount: false
      , couchdbMissing: false
      , checkingOnCouchdb: false
      , usersConfigured: false
      , isFirstChannel: false
      , hasContext: false
      , indexedContextNameMapping: undefined
      , contextId: undefined
      , openroleform: {}
      , formMode: false
      , activeKey: "login"

      , setusername: function(usr)
        {
          getUser( usr )
            .then( user => component.setState({username: usr, wrongCredentials: false, unknownUserName: false, user, loginInfoValidated: false}))
            .catch( () => component.setState({username: usr, wrongCredentials: false, unknownUserName: false, loginInfoValidated: false}));
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
    const component = this;
    usersHaveBeenConfigured().then( b => component.setState({ usersConfigured: b, activeKey: b ? "login" : "setup" }) );
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

    this.handleQueryString();

  }

  handleQueryString()
  {
    const component = this;
    // Select the part after the question mark, if any.
    const queryStringMatchResult = window.location.search.match(/\?(.*)/);
    const params = new URLSearchParams(document.location.search.substring(1));

    if ( queryStringMatchResult )
    {
      // This can be
      //  * a well-formed role identifier, assumed to be a context role;
      //  * a well-formed external role identifier;
      //  * an arbitrary approximation of an indexed name of a Context.
      //  * the parameter openroleform=<wellformedroleidentifier>
      if ( params.get("openroleform") )
      {
        component.setState( {openroleform:
          { roleid: params.get("openroleform")
          , viewname: params.get("viewname")
          , cardprop: params.get("cardprop")
          }} );
      }
      else if ( isQualifiedName(queryStringMatchResult[1]) )
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
          .then( proxy => proxy.matchContextName( queryStringMatchResult[1] ))
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
    function handleSubmit(event)
    {
      const form = event.currentTarget;
      let couchdbUrl;
      event.preventDefault();
      event.stopPropagation();
      if (form.checkValidity() ) {
        if (component.state.host && component.state.port)
        {
          couchdbUrl = component.state.host + ":" + component.state.port + "/";
        }
        else if (component.state.port)
        {
          couchdbUrl = "https://localhost:" + component.state.port + "/";
        }
        if (couchdbUrl)
        {
          component.setState({checkingOnCouchdb: true});
          detectCouchdb(couchdbUrl).then( function(available)
            {
              if (available)
              {
                component.setState({couchdbMissing: false, checkingOnCouchdb: false});
                addUser( component.state.username, component.state.password, couchdbUrl );
              }
              else
              {
                component.setState({couchdbMissing: true, checkingOnCouchdb: false});
              }
            });
        }
        else
        {
          addUser( component.state.username, component.state.password, couchdbUrl );
        }
      }
      component.setState({newAccountInfoValidated: true});
    }

    function authenticate(event)
    {
      const form = event.currentTarget;
      event.preventDefault();
      event.stopPropagation();
      component.setState({loginInfoValidated: true});
      if (form.checkValidity() )
      {
        if (component.state.resetAccount)
        {
          // TODO!! Als Perspectives.Persistence.API alles heeft overgenomen, kan de signatuur van deze functie
          // gelijk gemaakt worden aan runPDR.
          SharedWorkerChannelPromise.then( function (proxy)
            {
              // zelfde parameters en argumenten als runPDR
              proxy.resetAccount(component.state.username, component.state.password, component.state.host, component.state.port, PerspectivesGlobals.publicRepository).then(
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
          authenticateUser(component.state.username, component.state.password).then(
            function(result)
            {
              switch (result) {
                case "ok":
                  getUser( component.state.username ).then(
                    function(user)
                    {
                      SharedWorkerChannelPromise.then( function (proxy)
                        {
                          proxy.runPDR(
                            component.state.username,
                            component.state.password,
                            user,
                            PerspectivesGlobals.publicRepository
                            // TODO. Handle errors in a better way.
                          )
                          .then(() => component.setState({loggedIn: true, couchdbUrl: user.couchdbUrl}))
                          .catch(e => alert( e ));
                        });
                    });
                  break;
                case "wrongpassword":
                  component.setState({wrongCredentials: true});
                  break;
                case "unknownuser":
                  component.setState({unknownUserName: true});
                  break;
              }
            });
        }
      }
    }
    if (component.state.loggedIn)
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
                  }
              , couchdbUrl: component.state.couchdbUrl}}>
              <Container>
                <div onKeyDown={event => component.handleKeyDown(event, externalRole(mysystem.contextinstance) )}>
                  <Navbar bg={component.usesSharedWorker || !component.state.isFirstChannel ? "light" : "danger"} expand="lg" role="banner" aria-label="Main menu bar" className="justify-content-between">
                    <Navbar.Brand tabIndex="-1" href="#home">InPlace</Navbar.Brand>
                    <Nav>
                      <CardClipBoard systemExternalRole={externalRole(mysystem.contextinstance)}/>
                      <OpenRoleFormTool eventDispatcher={component.eventDispatcher} systemExternalRole={externalRole(mysystem.contextinstance)}/>
                      <UnbindTool systemExternalRole={externalRole(mysystem.contextinstance)}/>
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
                    component.state.openroleform.roleid ? OpenRoleForm( component.state.openroleform ) :
                      component.state.hasContext ? RequestedContext(component.state.contextId, component.state.indexedContextNameMapping) : ApplicationSwitcher()
                  }
                </div>
              </Container>
            </AppContext.Provider>
          }</PSContext.Consumer>
        </MySystem>
      );
    }
    else
    {
      return  <Container>
                <Tabs activeKey={component.state.activeKey} onSelect={ (k) => component.setState({activeKey: k})}>
                  <Tab eventKey="login" title="Login">
                    <Form noValidate validated={component.state.loginInfoValidated} onSubmit={authenticate} className="m-3">
                      <Form.Row>
                        <header className="App-header">
                          <h3>Login</h3>
                        </header>
                      </Form.Row>
                      <Form.Row className="pb-3">
                        <Col>
                        {component.state.usersConfigured ? <Form.Text><span>Enter the username and password for an InPlace user on this computer. Alternatively, </span><Button size="sm" variant="outline-info" onClick={() => component.setState({activeKey:"setup"})}>create a new account.</Button></Form.Text> : <Welcome/>}
                        </Col>
                      </Form.Row>
                      <Form.Group as={Row} controlId="username">
                        <Col sm="4">
                          <Form.Label>Login name:</Form.Label>
                        </Col>
                        <Col sm="4">
                          <Form.Control
                            placeholder="Username"
                            aria-describedby="usernameDescription"
                            aria-label="Username"
                            onChange={e => component.state.setusername(e.target.value)}
                            value={component.state.username}
                            autoFocus
                            required/>
                          <Form.Control.Feedback type="invalid">Please enter a valid username.</Form.Control.Feedback>
                          {
                            component.state.unknownUserName ? <Form.Text className="text-danger">No user is registered with this name.</Form.Text> : null
                          }
                        </Col>
                      </Form.Group>
                      {
                        component.state.user.couchdbUrl ?
                          <Form.Group as={Row} controlId="password">
                            <Form.Label column sm="4">Password:</Form.Label>
                            <Col sm="4">
                              <Form.Control
                                type="password"
                                placeholder="Password"
                                aria-label="Password"
                                onChange={e => component.setState({password: e.target.value, wrongCredentials: false, unknownUserName: false, loginInfoValidated: false})}
                                required
                                />
                              <Form.Control.Feedback type="invalid">Please enter the password belonging to the username.</Form.Control.Feedback>
                              {
                                component.state.wrongCredentials ? <Form.Text className="text-danger">This password is not correct.</Form.Text> : null
                              }
                            </Col>
                          </Form.Group> : null
                      }
                      <Form.Group as={Row}>
                        <Col sm="4">
                          <Form.Label>Check to reset account (removes all data!):</Form.Label>
                        </Col>
                        <Col sm="1">
                        <InputGroup.Checkbox
                          aria-label="Check to reset account"
                          onChange={e => component.setState( {resetAccount: e.target.value == "on" } ) }/>
                        </Col>
                      </Form.Group>
                      <Button type="submit">Log in</Button>
                    </Form>
                  </Tab>
                  <Tab eventKey="setup" title="Create account">
                    <Form noValidate validated={component.state.newAccountInfoValidated} onSubmit={handleSubmit} className="m-3">
                      <Form.Row>
                        <header className="App-header">
                          <h3>Where do you want to store your data?</h3>
                        </header>
                      </Form.Row>
                      <Form.Row className="pb-3">
                        <div className="mb-3">
                          <Form.Group>
                            <Form.Check
                              name="backend"
                              type="radio"
                              id="indexeddb"
                              value="indexeddb"
                              label="In the browser database (recommended)"
                              onChange={ e => component.setState({ backend: e.target.value, host: "", port: "", couchdbMissing: false }) }
                              checked={component.state.backend == "indexeddb"}
                              required
                              />
                          </Form.Group>
                          <Form.Group>
                          <Form.Check
                            name="backend"
                            type="radio"
                            id="localcouchdb"
                            value="localcouchdb"
                            label="In a local instance of Couchdb"
                            onChange={ e => component.setState({ backend: e.target.value, host: "", couchdbMissing: false }) }
                            checked={component.state.backend == "localcouchdb"}
                            required
                            />
                            { component.state.backend == "localcouchdb" ? <Form.Text className="text-muted">
                              You must install Couchdb locally for this to work and register yourself as administrator with it.
                              Enter those credentials in the Username and Password fields below.
                            </Form.Text> : null}
                          </Form.Group>
                          <Form.Group>
                            <Form.Check
                              name="backend"
                              type="radio"
                              id="remotecouchdb"
                              value="remotecouchdb"
                              label="In a remote instance of Couchdb (requires an account, supply the password)"
                              onChange={ e => component.setState({ backend: e.target.value, couchdbMissing: false }) }
                              checked={component.state.backend == "remotecouchdb"}
                              required
                              />
                              { component.state.backend == "remotecouchdb" ? <Form.Text className="text-muted">
                                You must have an account with the provider of this Couchdb for this to work. Enter those credentials in the Username and Password fields below.
                              </Form.Text> : null}
                            </Form.Group>
                            <Form.Control.Feedback type="invalid">Please choose one of the options</Form.Control.Feedback>
                        </div>
                      </Form.Row>
                      {
                        ( component.state.backend == "localcouchdb" || component.state.backend == "remotecouchdb") ?
                          <Form.Group as={Row} controlId="port">
                            <Col sm="4">
                              <Form.Label id="portDescription">Enter the port that gives access to Couchdb over https:</Form.Label>
                            </Col>
                            <Col sm="8">
                              <Form.Control
                                placeholder="6984"
                                aria-describedby="portDescription"
                                aria-label="Couchdb Port"
                                onChange={e => component.setState({port: e.target.value})}
                                autoFocus
                                value={component.state.port}
                                required
                                />
                              <Form.Control.Feedback type="invalid">Please enter the port that Couchd listens to over https!</Form.Control.Feedback>
                            </Col>
                          </Form.Group> : null
                       }
                       {
                         ( component.state.backend == "remotecouchdb") ?
                           <Form.Group as={Row} controlId="host">
                             <Col sm="4">
                               <Form.Label id="urlDescription">Enter the url that gives access to Couchdb over https:</Form.Label>
                             </Col>
                             <Col sm="8">
                               <Form.Control
                                placeholder="https://somedomain.org/"
                                aria-describedby="urlDescription"
                                aria-label="Couchdb Url"
                                onChange={e => component.setState({host: e.target.value})}
                                value={component.state.host}
                                required
                                pattern="^https:\/\/.*$"
                                />
                                <Form.Control.Feedback type="invalid">Please enter the url for Couchdb. It must start with https and may not end on a /!</Form.Control.Feedback>
                             </Col>
                           </Form.Group> : null
                      }
                      {
                        component.state.checkingOnCouchdb ? <Form.Text className="text-info">Checking Couchdb. This will take a few seconds...</Form.Text> : null
                      }
                      {
                        !component.state.checkingOnCouchdb && component.state.couchdbMissing ? <Form.Text className="text-danger">Account not created. Couchdb is (currently) not available on this address.
                          Please check what you entered{component.state.backend == "localcouchdb" ? " and make sure your Couchdb is running." : "."}</Form.Text> : null
                      }
                      <Form.Row>
                        <header className="App-header">
                          <h3>Choose a username (and maybe a password)</h3>
                        </header>
                      </Form.Row>
                      <Form.Group as={Row} controlId="newusername">
                        <Col sm="4">
                          <Form.Label>Choose a name to login with (your username):</Form.Label>
                        </Col>
                        <Col sm="8">
                          <Form.Control
                            placeholder="Username"
                            aria-describedby="usernameDescription"
                            aria-label="Username"
                            onChange={e => component.setState({username: e.target.value})}
                            value={component.state.username}
                            required
                            />
                            <Form.Control.Feedback type="invalid">Please enter a user name</Form.Control.Feedback>
                        </Col>
                        <p id="usernameDescription" aria-hidden="true" hidden>Enter your self-chosen username here</p>
                      </Form.Group>
                      {component.state.backend == "localcouchdb" || component.state.backend == "remotecouchdb" ?
                        <Form.Group as={Row} controlId="newpassword">
                          <Form.Label column sm="4">Choose a password:</Form.Label>
                          <Col sm="8">
                            <Form.Control
                              type="password"
                              placeholder="Password"
                              aria-label="Password"
                              onChange={e => component.setState({password: e.target.value})}
                              value={component.state.password}
                              required/>
                              <Form.Control.Feedback type="invalid">Please enter a password</Form.Control.Feedback>
                          </Col>
                        </Form.Group> : null}
                      <Button type="submit">Create account</Button>
                    </Form>
                  </Tab>
                </Tabs>
              </Container>;
    }
    // else {
    //   return (<Card>
    //       <Card.Header as="h5" role="heading" aria-level="1">Couchdb installation required</Card.Header>
    //       <Card.Body>
    //         <Card.Title role="heading" aria-level="2">No Couchdb detected</Card.Title>
    //         <Card.Text>
    //           InPlace cannot detect a Couchdb instance on your computer. This may have the following reasons:
    //         </Card.Text>
    //         <ol>
    //           <li>Couchdb was not installed. See instructions below.</li>
    //           <li>Couchdb was installed, but is not running. Start Couchdb on your computer, then restart InPlace.</li>
    //           <li>Couchdb is running, but not on the default port 5984. Currently it is not possible to configure the port Perspectives uses to access Couchdb. Try to make Couchdb listen on port 5984.</li>
    //         </ol>
    //         <Card.Title role="heading" aria-level="2">How to install Coudchb</Card.Title>
    //         <Card.Text>Just download, install, start and verify Couchdb. You need not follow instructions in the Couchdb documents. Just perform the steps below.</Card.Text>
    //         <ol variant="flush">
    //           <li>Download Couchb version 3.1.0 from <a href="https://couchdb.apache.org/#download">Couchdb</a>.</li>
    //           <li>Run Couchdb. An small dialog will appear stating: &quot;No CouchDB Admin password found&quot;. Enter a password and remember it well!</li>
    //           <li>This will open up a page in your webbrowser: this is the Fauxton admin interface. If this does not happen, click <a href="http://127.0.0.1:5984/_utils">here</a>.</li>
    //           <li>Enter &quot;admin&quot; for username and the password you&apos;ve just set.</li>
    //           <li>Verify the install by clicking on the Verify button in the left column (the button with the checkmark), then click the button &quot;Verify Installation&quot;.</li>
    //           <li>Create a new System Admin.
    //             <ol>
    //               <li>Click the lowest button in the left column, select the &quot;Create Server Admin&quot; tab.</li>
    //               <li>Enter the name you will use to open InPlace. Enter a password.</li>
    //               <li>Click &quot;Create Admin&quot;.</li>
    //             </ol>
    //           </li>
    //           <li>Close InPlace (this application) and start it again. Then enter the username and password you&apos;ve just added to Couchdb.</li>
    //         </ol>
    //       </Card.Body>
    //     </Card>);
    // }
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

function OpenRoleForm( {roleid, viewname, cardprop} )
{
  return  <ContextOfRole rolinstance={roleid}>
            <RoleInstance roleinstance={roleid}>
              <View viewname={viewname}>
              <RoleFormInView cardprop={cardprop}/>
              </View>
            </RoleInstance>
          </ContextOfRole>;
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
