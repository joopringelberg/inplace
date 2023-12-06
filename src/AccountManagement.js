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

import "./App.css";
import { SharedWorkerChannelPromise } from 'perspectives-proxy';


import "./externals.js";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Tabs from 'react-bootstrap/Tabs';

// import 'bootstrap/dist/css/bootstrap.min.css';

import {usersHaveBeenConfigured, addUser, authenticateUser, getUser, detectCouchdb, allUsers, removeUser} from "./usermanagement.js";

export default class AccountManagement extends Component
{
  constructor( props )
  {
    super(props);
    const component = this;
    this.state =
      { activeKey: "login"
      , usersConfigured: false
      , loginInfoValidated: false
      , username: ""
      , setusername: function(usr)
        {
          getUser( usr )
            .then( user => component.setState({username: usr, wrongCredentials: false, unknownUserName: false, user, loginInfoValidated: false}))
            .catch( () => component.setState({username: usr, wrongCredentials: false, unknownUserName: false, loginInfoValidated: false}));
        }
      , unknownUserName: false
      , user: {}
      , wrongCredentials: false
      , newAccountInfoValidated: false
      , backend: undefined
      , port: undefined // couchdbPort
      , host: undefined //couchdbHost
      , checkingOnCouchdb: false
      , couchdbMissing: false
      , password: undefined
      , resetAccount: false

    };
  }

  componentDidMount()
  {
    const usersConfigured = usersHaveBeenConfigured();
    this.setState({ usersConfigured, activeKey: usersConfigured ? "login" : "setup" });
  }

  createAccount(event)
  {
    const component = this;
    const form = event.currentTarget;
    let couchdbUrl;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() )
    {
      // Compute couchdbUrl, if applicable.
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
        // Check if Couchdb is up and running.
        component.setState({checkingOnCouchdb: true});

        // The promise is always fulfilled.
        detectCouchdb(couchdbUrl).then( function(available)
          {
            if (available)
            {
              component.setState({couchdbMissing: false, checkingOnCouchdb: false});
            }
            else
            {
              component.setState({couchdbMissing: true, checkingOnCouchdb: false});
            }
          });
      }
      addUser( component.state.username, component.state.password, couchdbUrl )
        .then(() =>
          // Now create the user in the PDR.
          getUser( component.state.username ).then( user =>
            SharedWorkerChannelPromise.then( function (proxy)
              {
                proxy.createAccount(
                  component.state.username,
                  user,
                  // CreateOptions. Read values from component state, that have been salvaged from query parameters.
                  { isFirstInstallation: component.props.isfirstinstallation
                  , useSystemVersion: component.props.usesystemversion
                  }
                  // TODO. Handle errors in a better way.
                ).then( () => window.location= new URL(document.location.href).origin )
                .catch(e => alert( e ));
              })));
    }
    component.setState({newAccountInfoValidated: true});
  }

  authenticate(event)
  {
    const component = this;
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    component.setState({loginInfoValidated: true});
    if (form.checkValidity() )
    {
      authenticateUser(component.state.username, component.state.password).then(
        function(result)
        {
          switch (result) {
            case "ok":
              getUser( component.state.username ).then(
                function(user)
                {
                  if (component.state.resetAccount)
                  {
                    SharedWorkerChannelPromise.then( function (proxy)
                      {
                        // zelfde parameters en argumenten als runPDR
                        proxy.resetAccount(
                          component.state.username,
                          user
                          )
                          .then(
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
                  else if (component.props.recompilelocalmodels)
                  {
                    SharedWorkerChannelPromise.then( function (proxy)
                      {
                        proxy.recompileLocalModels(
                          user
                          )
                          .then(
                            function(success) // eslint-disable-line
                            {
                              // We do not yet return a reliable boolean value from the PDR.
                              if (!success)
                              {
                                alert("Unfortunately the local models could not be (all) compiled. See the console log output for more information.");
                              }
                              // else
                              // {
                              //   alert("Succesfully recompiled the models of this installation. Please restart (and omit '?recompilelocalmodels=true')")
                              // }
                            });
                        });
                  }
                  else
                  {
                    SharedWorkerChannelPromise.then( function (proxy)
                      {
                        proxy.runPDR(
                          component.state.username,
                          user
                        )
                          .then( () => component.props.setloggedin() )
                          // TODO. Handle errors in a better way.
                          .catch(e => alert( e ));
                      });
                  }
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

  render()
  {
    // getCouchdbUrl and getUseridentifier have changed the cursor to the 'waiting' shape and will return it to the pointer shape when their 
    // promises resolve. However, that will only happen when the user has logged in.
    // Consequently, he sees a 'waiting' state cursor. We fix that here by turning the cursor back to a pointer.
    document.body.style.cursor = "pointer";
    const component = this;
    return  <Container>
              <Tabs activeKey={component.state.activeKey} onSelect={ (k) => component.setState({activeKey: k})}>
                <Tab eventKey="login" title="Login">
                  <Form noValidate validated={component.state.loginInfoValidated} onSubmit={e => component.authenticate(e)} className="m-3">
                    <Form.Row>
                      <header className="App-header">
                        <h3>Login</h3>
                      </header>
                    </Form.Row>
                    <Form.Row className="pb-3">
                      <Col>
                      {component.state.usersConfigured ? <Form.Text><span>Enter the username and password for a MyContexts user on this computer. Alternatively, </span><Button size="sm" variant="outline-info" onClick={() => component.setState({activeKey:"setup"})}>create a new account.</Button></Form.Text> : <Welcome/>}
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
                        aria-label="Check to reset account (removes all data!)"
                        onChange={e => component.setState( {resetAccount: e.target.value == "on" } ) }/>
                      </Col>
                    </Form.Group>
                    <Button type="submit">Log in</Button>
                  </Form>
                </Tab>
                <Tab eventKey="setup" title="Create account">
                  <Form noValidate validated={component.state.newAccountInfoValidated} onSubmit={e => component.createAccount(e)} className="m-3">
                    <Form.Row>
                      <header className="App-header">
                        <h3>Storing data</h3>
                      </header>
                    </Form.Row>
                    <Form.Row className="pb-3">
                      <div className="mb-3">
                        <Form.Group id="StorageLocation">
                          <Form.Label htmlFor="StorageLocation">Where do you want to store your data?</Form.Label>
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
                <Tab eventKey="remove" title="Remove accounts">
                  <Form noValidate className="m-3">
                    <Form.Row>
                      <header className="App-header">
                        <h3>Remove selected account</h3>
                      </header>
                    </Form.Row>
                    <AllUsers/>
                  </Form>
                </Tab>
              </Tabs>
            </Container>;

  }
}

// This function is used to set state in a component higher up in the hierarchy.
AccountManagement.propTypes =
  { setloggedin: PropTypes.func.isRequired
  , setcouchdburl: PropTypes.func.isRequired
  , recompilelocalmodels: PropTypes.bool
  , isfirstinstallation: PropTypes.bool
  , usesystemversion: PropTypes.string
  };

//////////////////////////////////////////////////////////////////////////////
//// WELCOME COMPONENT
//////////////////////////////////////////////////////////////////////////////
function Welcome(){
  return <Card>
          <Card.Header as="h5">Welcome to MyContexts</Card.Header>
          <Card.Body>
            <Card.Text>There is no user of this MyContexts installation yet. Enter the username and password you&apos;ve
            used to create a Server Admin in Couchdb. If you have not done that yet, follow these instructions:</Card.Text>
            <ol>
              <li>Go to the <a href="http://127.0.0.1:5984/_utils">Fauxton admin interface</a>.</li>
              <li>Enter &quot;admin&quot; for username and the password you&apos;ve set on installing Couchdb.</li>
              <li>Click the lowest button in the left column, select the &quot;Create Server Admin&quot; tab. </li>
              <li>Enter the name you will use to open MyContexts. Enter a password.</li>
              <li>Click &quot;Create Admin&quot;.</li>
              <li>Finally close MyContexts (this program) and open it again.</li>
            </ol>
          </Card.Body>
        </Card>;
}

//////////////////////////////////////////////////////////////////////////////
//// ALLUSERS COMPONENT
//////////////////////////////////////////////////////////////////////////////
class AllUsers extends React.Component
{
  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    if (prevState)
    {
      if (component.state && (prevState.users.length != component.state.users.length))
      {
        allUsers().then( users => component.setState({users: users}));
      }
    }
    else {
      allUsers().then( users => component.setState({users: users}));
    }
  }

  removeUser()
  {
    const component = this;
    SharedWorkerChannelPromise
      .then( proxy => removeUser( component.state.selectedUser)
        .then( user => proxy.removeAccount(user.userName, user))
        .then( allUsers )
        .then( users => component.setState({users: users})));
  }

  render()
  {
    const component = this;
    if (component.state && component.state.users)
    {
      return  <Form.Group as={Row} controlId="allusers">
                <Col sm="4">
                  <Form.Label>Select a user account</Form.Label>
                </Col>
                <Col sm="8">
                  <Form.Control
                    as="select"
                    multiple
                    // value={component.state.selectedUser}
                    onChange={ e => component.setState({selectedUser: e.target.value})}
                    >
                  {
                    component.state.users.map( user => <option key={user}>{user}</option>)
                  }
                  </Form.Control>
                  <Button className="mt-3" onClick={ () => component.removeUser() }>Remove this account</Button>
                </Col>
              </Form.Group>;
    }
    else
    {
      return null;
    }
  }
}

//////////////////////////////////////////////////////////////////////////////
//// GETHOST AND GETPORT HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////////////////
function getHost(url)
{
  if (url)
  {
    return url.match(/(^http.*):/)[1];
  }
}

// Returns a string of four integers or undefined.
function getPort(url)
{
  if (url)
  {
    return url.match(/^http.*:(\d{4})/)[1];
  }
}

// else {
//   return (<Card>
//       <Card.Header as="h5" role="heading" aria-level="1">Couchdb installation required</Card.Header>
//       <Card.Body>
//         <Card.Title role="heading" aria-level="2">No Couchdb detected</Card.Title>
//         <Card.Text>
//           MyContexts cannot detect a Couchdb instance on your computer. This may have the following reasons:
//         </Card.Text>
//         <ol>
//           <li>Couchdb was not installed. See instructions below.</li>
//           <li>Couchdb was installed, but is not running. Start Couchdb on your computer, then restart MyContexts.</li>
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
//               <li>Enter the name you will use to open MyContexts. Enter a password.</li>
//               <li>Click &quot;Create Admin&quot;.</li>
//             </ol>
//           </li>
//           <li>Close MyContexts (this application) and start it again. Then enter the username and password you&apos;ve just added to Couchdb.</li>
//         </ol>
//       </Card.Body>
//     </Card>);
// }
