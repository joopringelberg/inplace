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
    MySystem,
    RoleInstanceIterator,
    ContextInstance,
    ExternalRole,
    ContextOfRole,
    RoleInstance,
    RoleFormInView,
    PerspectivesContainer,
    isQualifiedName,
    isExternalRole,
    deconstructContext,
    externalRole,
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import ListGroup from 'react-bootstrap/ListGroup';

import 'bootstrap/dist/css/bootstrap.min.css';

import NavigationBar from "./navigationbar.js";

import AccountManagement from "./AccountManagement.js";

export default class App extends Component
{
  constructor(props)
  {
    super(props);
    // This stub is replaced by a function constructed in the addOpenContextOrRoleForm behaviour
    // whenever the user starts dragging a role that supports that behaviour.
    // Notice that we use indirection here. The value of eventDispatcher is a location that holds the actual eventDispatcher.
    // We pass the location around and have its contents modified by a function that is passed down in the react tree.
    // In this way we can change the eventDispatcher.
    this.eventDispatcher = {eventDispatcher: function(){}};
    this.state =
      { loggedIn:  false
      , isFirstChannel: false
      , hasContext: false
      , indexedContextNameMapping: undefined
      , contextId: undefined
      , openroleform: {}
      , couchdbUrl: undefined
      // Only `showNotifications` is likely to change after logging in or opening a new context or role screen.
      , showNotifications: false
      };
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
    if (component.state.loggedIn && component.state.couchdbUrl)
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
                  <NavigationBar
                    systemexternalrole={externalRole(mysystem.contextinstance)}
                    setshownotifications={value => component.setState({showNotifications: value})}
                    isbasepage={component.usesSharedWorker || !component.state.isFirstChannel}
                    eventdispatcher={component.eventDispatcher}
                    />
                  {
                    component.state.openroleform.roleid ? OpenRoleForm( component.state.openroleform ) :
                      component.state.hasContext ?
                        RequestedContext(
                          component.state.contextId,
                          component.state.indexedContextNameMapping,
                          mysystem.contextinstance,
                          component)
                          // TODO. Display hier het overzicht van models in use.
                      : ApplicationSwitcher(mysystem.contextinstance, component)
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
      return <AccountManagement
              setloggedin={() => component.setState({loggedIn: true})}
              setcouchdburl={url => component.setState({couchdbUrl: url})}
             />;
    }
  }
}

// indexedContextNameMapping = Object String, holding at least one key-value pair.
function RequestedContext(contextId, indexedContextNameMapping, mySystem, component)
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
                { function (psrol)
                  {
                    history.pushState({ selectedContext: psrol.rolinstance }, "");
                    // console.log("Pushing context state " + psrol.rolinstance);
                    return <PerspectivesContainer systemcontextinstance={mySystem} shownotifications={component.state.showNotifications}>
                        <Screen rolinstance={psrol.rolinstance} shownotifications={component.state.showNotifications}/>
                      </PerspectivesContainer>;
                  }
                }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
  else
  {
    return  <ContextInstance contextinstance={indexedContextNameMapping[ Object.keys( indexedContextNameMapping )[0] ]}>
            <ExternalRole>
              <PSRol.Consumer>
                { function (psrol)
                  {
                    history.pushState({ selectedContext: psrol.rolinstance }, "");
                    // console.log("Pushing context state " + psrol.rolinstance);
                    return <PerspectivesContainer systemcontextinstance={mySystem} shownotifications={component.state.showNotifications}>
                      <Screen rolinstance={psrol.rolinstance}  shownotifications={component.state.showNotifications}/>
                    </PerspectivesContainer>;
                  }
                }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
}

// eslint-disable-next-line react/prop-types
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

function ApplicationSwitcher(mySystem, component)
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
                    <PSRol.Consumer>{ psrol =>
                      {
                        history.pushState({ selectedContext: psrol.rolinstance }, "");
                        return  <Tab.Pane eventKey={psrol.rolinstance}>
                                  <PerspectivesContainer systemcontextinstance={mySystem} shownotifications={component.state.showNotifications}>
                                    <Screen rolinstance={psrol.rolinstance} shownotifications={component.state.showNotifications}/>
                                  </PerspectivesContainer>;
                                </Tab.Pane>;
                      }
                    }</PSRol.Consumer>
                  </RoleInstanceIterator>
                </Tab.Content>
              </Col>
            </Row>
          </AppListTabContainer>;
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
