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
import { SharedWorkerChannelPromise, configurePDRproxy, PDRproxy, FIREANDFORGET } from 'perspectives-proxy';

import "./externals.js";

import {
    PSContext,
    AppContext,
    Screen,
    MySystem,
    ContextOfRole,
    PerspectiveForm,
    isQualifiedName,
    isExternalRole,
    externalRole,
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';

import 'bootstrap/dist/css/bootstrap.min.css';

import NavigationBar from "./navigationbar.js";

import AccountManagement from "./AccountManagement.js";

import {NotificationsDisplayer} from "./notifications.js";

export default class App extends Component
{
  constructor(props)
  {
    super(props);
    const component = this;
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
      , couchdbUrl: undefined
      // Props that are likely to change after logging in or opening:
      , showNotifications: false
      , openroleform: {}
      , externalRoleId: undefined     // The external role instance of the context that is currently on display (if any).
      , myRoleType: undefined         // The type of user role the user plays in the context of the externalRoleId (if any).
      , roleId: undefined             // The role that is currently on display (if any).
      , systemUser: undefined         // The user identifier (his GUID).
      , viewname: undefined
      , cardprop: undefined
      , backwardsNavigation: undefined
      , recompileBasicModels: false
      };
    this.usesSharedWorker = typeof SharedWorker != "undefined";
    this.containerRef = React.createRef();
    this.clearExternalRoleId = function()
      {
        component.setState({ externalRoleId: undefined});
      }

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
      , SharedWorkerChannelPromise.then( proxy => proxy.isUserLoggedIn())
      , PDRproxy.then( proxy => proxy.getCouchdbUrl() )
      , PDRproxy.then( function(proxy)
        {
          return new Promise(function (resolver)
            {
              proxy.getUserIdentifier(
                  function(sysId)
                  {
                    resolver( sysId[0] );
                  }
                );
            });
        } )
      ]).then( function( results )
        {
          const setter = { isFirstChannel: results[0] == 1000000 };
          if (results[1] && !component.state.loggedIn )
          {
            setter.loggedIn = true;
          }
          if (results[2] && !component.state.couchdbUrl )
          {
            setter.couchdbUrl = results[2][0];
          }
          if (results[3])
          {
            setter.systemUser = results[3];
          }
          component.setState( setter );
        })
      .catch(function(e)
        {
          // For debugging purposes.
          // eslint-disable-next-line no-console
          console.warn( e );
        });
    window.onpopstate = function(e)
      {
        if (e.state && e.state.title)
        {
          document.title = e.state.title;
        }
        if (e.state && (e.state.selectedContext || e.state.selectedRoleInstance))
        {
          // console.log("Popping previous state, now on " + (e.state.selectedContext ? "context state " + e.state.selectedContext : "roleform state " + e.state.selectedRoleInstance));
          // Restore the selectedContext or selectedRoleInstance, if any.
          component.setState(
            { externalRoleId: e.state.selectedContext
            , roleId: e.state.selectedRoleInstance
            , viewname: e.state.viewname
            , cardprop: e.state.cardprop
            , backwardsNavigation: true} );
          e.stopPropagation();
        }
        else if (e.state)
        {
          component.setState(
            { externalRoleId: undefined
            , viewname: undefined
            , cardprop: undefined
            , backwardsNavigation: true}
          );
        }
      };
    // Invariant: the selectedContext in history and the externalRoleId in App state are equal and
    // will be the external role of the context that is selected.
    this.containerRef.current.addEventListener( "OpenContext",
      function(e)
      {
        ensureExternalRole( e.detail )
          .then(
            function(erole)
            {
              PDRproxy.then( function( pproxy )
                {
                  pproxy.getRoleName( erole, function (nameArr)
                    {
                      document.title = nameArr[0];
                      history.pushState({ selectedContext: erole, title: nameArr[0] }, "");
                    },
                    FIREANDFORGET);
                });
              // console.log("Pushing context state " + e.detail);
              component.setState(
                { externalRoleId: erole
                , roleId: undefined
                , viewname: undefined
                , cardprop: undefined
                , backwardsNavigation: false});
            })
          .catch(() => null);
        e.stopPropagation();
      });
    this.containerRef.current.addEventListener( "OpenRoleForm",
      function(e)
      {
        const {rolinstance, viewname, cardprop} = e.detail;
        PDRproxy.then( function( pproxy )
          {
            pproxy.getRoleName( rolinstance,
              function (nameArr)
                {
                  document.title = nameArr[0];
                  history.pushState({ selectedRoleInstance: rolinstance, title: nameArr[0] }, "");
                }
            );
          });

        // console.log("Pushing roleform state " + rolinstance);
        component.setState(
            { externalRoleId: undefined
            , roleId: rolinstance
            , viewname
            , cardprop
            , backwardsNavigation: false });
        e.stopPropagation();
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
      else if ( params.get("recompilebasicmodels") )
      {
        component.setState( { recompileBasicModels: true });
      }
      else if ( isQualifiedName(queryStringMatchResult[1]) )
      {
        ensureExternalRole( queryStringMatchResult[1])
          .then(
            function(erole)
            {
              component.setState( {hasContext:true, externalRoleId: erole});
            })
          .catch(() => null);
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
          "model:System$PerspectivesSystem$User") );
        event.preventDefault();
        break;
    }
  }

  computeScreen ()
  {
    const component = this;
    function propagate(setter)
    {
      component.setState( setter );
    }

    if (component.state.loggedIn && (component.state.couchdbUrl || component.state.couchdbUrl == ""))
    {
      return (
        <MySystem>
          <PSContext.Consumer>{ mysystem =>
            <AppContext.Provider value={
              { systemExternalRole: externalRole(mysystem.contextinstance)
              , externalRoleId: component.state.externalRoleId
              , roleId: component.state.roleId
              , myRoleType: component.state.myRoleType
              , systemUser: component.state.systemUser
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
                    myroletype={component.state.myRoleType}
                    externalroleid={component.state.externalRoleId}
                    clearexternalroleid={component.clearExternalRoleId}
                    />
                    <Container>
                    {
                      component.state.roleId
                      ?
                      <PerspectiveForm
                        roleinstance={component.state.roleId}
                      />
                      :
                      (component.state.externalRoleId
                        ?
                        <Screen
                          externalroleinstance={component.state.externalRoleId}
                          setMyRoleType={ myRoleType => component.setState({myRoleType: myRoleType})}
                        />
                        :
                        null
                      )
                    }</Container>
                    {
                      component.state.externalRoleId && component.state.showNotifications ?
                      <ContextOfRole rolinstance={component.state.externalRoleId}>
                        <NotificationsDisplayer
                          systemcontextinstance={mysystem.contextinstance}
                          shownotifications={component.state.showNotifications}
                          navigateto={propagate}
                          />
                      </ContextOfRole>
                      : null
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
              recompilebasicmodels={ component.state.recompileBasicModels }
              setloggedin={() => component.setState({loggedIn: true})}
              setcouchdburl={url => component.setState({couchdbUrl: url})}
             />;
    }
  }

  render()
  {
    return <div ref={this.containerRef}>{ this.computeScreen() }</div>;
  }
}

// This function returns a promise for an erole, or fails.
function ensureExternalRole(s)
{
  if ( isExternalRole( s ) )
  {
    return Promise.resolve( s );
  }
  else
  {
    // Assume a context role. Now request the binding and get its context.
    return PDRproxy.then( proxy =>
      new Promise( function( resolve, reject )
        {
          proxy.getBinding( s,
            function (bindingIds)
              {
                if (bindingIds.length > 0)
                {
                  if ( isExternalRole (bindingIds[0]))
                  {
                    resolve( bindingIds[0] );
                  }
                }
                // Otherwise, either not a context role after all, or no binding. Fail.
                return reject( new Error( "Not a context role!"));
              },
              FIREANDFORGET
              );
        }));
  }

}
