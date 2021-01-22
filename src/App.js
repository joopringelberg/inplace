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
import { ServiceWorkerChannelPromise } from 'perspectives-proxy';
import PropTypes from "prop-types";

import "./externals.js";

import {
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
    ViewOnExternalRole
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

import {TrashcanIcon, DesktopDownloadIcon, BroadcastIcon} from '@primer/octicons-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {configurePDRproxy} from 'perspectives-proxy';

configurePDRproxy("sharedWorkerChannel");

import {couchdbHost, couchdbPort} from "./couchdbconfig.js";

class App extends Component
{
  constructor(props)
  {
    super(props);
    const component = this;
    this.state =
      { notLoggedIn:  true
      , username: ""
      , password: ""
      , host: couchdbHost
      , port: couchdbPort
      , authenticationFeedback: undefined
      , resetAccount: false
      , couchdbInstalled: false
      , usersConfigured: false

      // Card clipboard data:
      , selectedCard: undefined
      , selectedRole: undefined
      , roltype: undefined
      , contexttype: undefined

      , positionToMoveTo: undefined
      , setSelectedCard: (selectedCard, selectedRole, roltype, contexttype) => this.setState(
          { selectedCard
          , selectedRole
          , roltype
          , contexttype
          })
      , setPositionToMoveTo: (pos) => this.setState({positionToMoveTo: pos})
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
            ServiceWorkerChannelPromise.then( function (proxy)
              {
                proxy.resetAccount(component.state.username, component.state.password, component.state.host, component.state.port,
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
            ServiceWorkerChannelPromise.then( function (proxy)
              {
                proxy.authenticate(component.state.username, component.state.password, component.state.host, component.state.port).then(
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
                        component.setState({notLoggedIn: false});
                        break;
                      }
                    });
             });
         }
       }};
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.context_ = {setSelectedCard: this.state.setSelectedCard};
  }

  componentDidMount ()
  {
    const component = this;
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
  }

  handleKeyDown(event)
  {
    switch(event.keyCode)
    {
      case 27: // Escape
        this.setState({selectedCard: undefined, selectedRole: undefined});
        event.preventDefault();
        break;
    }
  }

  render ()
  {
    const component = this;
    if (component.state.couchdbInstalled)
    {
        if (component.state.notLoggedIn)
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
          </Container>);
        }
        else
        {
          return (
            <div onKeyDown={component.handleKeyDown}>
              <CardClipBoard card={component.state.selectedCard} positiontomoveto={component.state.positionToMoveTo}/>
              <AppContext.Provider value={component.state}>
                <AppSwitcher/>
              </AppContext.Provider>
            </div>
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

// AppSwitcher should not update: it renders just once.
class AppSwitcher extends React.PureComponent
{
  render ()
  {
    return  <Container>
              <MySystem>
                <Navbar bg="light" expand="lg" role="banner" aria-label="Main menu bar" className="justify-content-between">
                  <Navbar.Brand tabIndex="-1" href="#home">InPlace</Navbar.Brand>
                  <Nav>
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
                <AppListTabContainer rol="IndexedContexts">
                  <Row className="align-items-stretch">
                    <Col lg={3} className="App-border-right">
                      <Nav variant="pills" className="flex-column" aria-label="Apps" aria-orientation="vertical">
                        <RoleInstanceIterator>
                          <View viewname="allProperties">
                            <PSView.Consumer>
                              {roleinstance => <Nav.Item>
                                  <Nav.Link eventKey={roleinstance.rolinstance}>{roleinstance.propval("Name")}</Nav.Link>
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
                </AppListTabContainer>
              </MySystem>
            </Container>;

  }
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
                  {this.props.children}
                </Tab.Container>;
      }
      else {
        return <div/>;
      }
    }
  }
  AppListTabContainer_.contextType = PSRoleInstances;

  return (<RoleInstances rol={props.rol}>
      <AppListTabContainer_>{ props.children }</AppListTabContainer_>
    </RoleInstances>);
}

AppListTabContainer.propTypes = { "rol": PropTypes.string.isRequired };

////////////////////////////////////////////////////////////////////////////////
// CARDCLIPBOARD
////////////////////////////////////////////////////////////////////////////////
class CardClipBoard extends React.PureComponent
{
  constructor (props)
  {
    super(props);
    this.container = React.createRef();
  }
  componentDidUpdate()
  {
    const container = this.container.current;
    // The rectangle enclosing the card in coordinates of the viewport.
    var cardRect, containerRect, clonedCard;
    if (this.props.card && !this.props.positiontomoveto)
    {
      if (container.hasChildNodes())
      {
        container.removeChild( container.childNodes[0] );
      }
      cardRect = this.props.card.getBoundingClientRect();
      containerRect = container.getBoundingClientRect();
      clonedCard = this.props.card.cloneNode(true);
      container.appendChild( clonedCard );
      clonedCard.classList.add("clipboardCard");
      clonedCard.style.position = "fixed";
      clonedCard.style.left = cardRect.left + "px"; // hebben we dit nodig?
      clonedCard.style.top = cardRect.top + "px"; // hebben we dit nodig?
      clonedCard.style.width = cardRect.width + "px";
      clonedCard.style.height = cardRect.height + "px";
      clonedCard.style.transition = "transform 1s";
      setTimeout(function () {
        clonedCard.style.transform = 'translateX(' + (containerRect.left - cardRect.left) + 'px)';
        clonedCard.style.transform += 'translateY(' + (containerRect.top - cardRect.top) + 'px)';
      }, 10);
    }
    if ( this.props.card && this.props.positiontomoveto )
    {
      // The current position of the card.
      cardRect = this.props.card.getBoundingClientRect();
      containerRect = container.getBoundingClientRect();
      clonedCard = container.childNodes[0];
      if ( parseInt( this.props.positiontomoveto.x ) == -1 )
      {
        clonedCard.style.transform = 'translateX(' + (containerRect.left - cardRect.left) + 'px)';
        clonedCard.style.transform += 'translateY(' + (containerRect.top - cardRect.top) + 'px)';
      }
      else
      {
        clonedCard.style.transform = 'translateX(' + (parseInt( this.props.positiontomoveto.x ) - cardRect.left) + 'px)';
        clonedCard.style.transform += 'translateY(' + (parseInt( this.props.positiontomoveto.y ) - cardRect.top) + 'px)';
      }
    }
  }

  render ()
  {
    if (this.props.card)
    {
      return <div ref={this.container} className="CardClipBoardShown" style={{zIndex: 1000}}></div>;
    }
    else {
      return <div className="CardClipBoardHidden"/>;
    }

  }
}

CardClipBoard.propTypes =
  { card: PropTypes.object
  , positionToMoveTo: PropTypes.shape(
    { x: PropTypes.string.isRequired // i.e. "40px". Set to "-1px" in order to move the card back to the clipboard.
    , y: PropTypes.string.isRequired
    })
  };

function Trash(props)
{
  const renderTooltip = (props) => (
    <Tooltip id="trash-tooltip" {...props} show={props.show.toString()}>
      Drop a card here to remove it
    </Tooltip> );

  const eventDiv = React.createRef();

  function handleKeyDown ( event, rolinstance, roltype, contexttype, setSelectedCard, setPositionToMoveTo )
  {
    const eventDivRect = eventDiv.current.getBoundingClientRect();
    switch(event.keyCode){
      case 13: // Enter
      case 32: // space
        // Animate the movement of the card to the dropzone.
        setPositionToMoveTo( {x: eventDivRect.x + "px", y: eventDivRect.y + "px"} );
        // Remove the role.
        props.removerol( {contexttype, roltype, rolinstance} );
        // Wait for the animation to end.
        setTimeout( function()
          {
            setSelectedCard();
            setPositionToMoveTo();
          },
          900);
        event.preventDefault();
        break;
      }
  }
  return  <AppContext.Consumer>{ ({selectedRole, roltype, contexttype, setSelectedCard, setPositionToMoveTo}) =>
            <OverlayTrigger
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
                      onDrop={ev => {props.removerol( JSON.parse( ev.dataTransfer.getData("PSRol") ) ); ev.target.classList.remove("border", "p-3", "border-primary");}}
                      onKeyDown={ ev => handleKeyDown( ev, selectedRole, roltype, contexttype, setSelectedCard, setPositionToMoveTo )}
                      onDragEnter={ev => ev.target.classList.add("border", "border-primary") }
                      onDragLeave={ev => ev.target.classList.remove("border", "border-primary")}>
                      <TrashcanIcon alt="Thrashcan" aria-label="Drop a card here to remove it" size='medium'/>
                  </div>
            </OverlayTrigger>}
          </AppContext.Consumer>;
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

export default App;
