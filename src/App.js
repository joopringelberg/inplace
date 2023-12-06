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
    isSchemedResourceIdentifier,
    isExternalRole,
    externalRole,
    ModelDependencies,
    EndUserNotifier,
    initUserMessaging,
    UserMessagingPromise
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';

import Button from 'react-bootstrap/Button';

// import 'bootstrap/dist/css/bootstrap.min.css';

import './bootstrap.css'

import NavigationBar from "./navigationbar.js";

import AccountManagement from "./AccountManagement.js";

import {NotificationsDisplayer} from "./notifications.js";

import {SelectContext} from "./selectContext.js";

import i18next from "i18next";

import {initI18next} from "./i18next.js";

import {init} from '@paralleldrive/cuid2';

import { getDefaultSystem } from "./runtimeOptions.js";
import { addUser, allUsers, getUser, removeUser, usersHaveBeenConfigured } from "./usermanagement.js";
import IntroductionScreen from "./introductionSplash.js";
import StartupScreen from "./startupSplash.js";
import DeleteInstallation from "./deleteInstallationSplash.js";
import RecompileLocalModelsScreen from "./recompileLocalModelsScreen.js";

/*
QUERY PARAMETERS AND VALUES
  - recompilelocalmodels=true
  - manualaccountcreation=true
  - isfirstinstallation=false
  - usesystemversion=MAJOR.MINOR
  - deleteaccount=true
  - opencontext=<external role or contextrole identifier>
  - openroleform=<role identifier>
  - viewname=<view identifier>
  - cardprop=<property type identifier>
*/

export default class App extends Component
{
  constructor(props)
  {
    super(props);
    const component = this;
    initI18next("en");
    // This stub is replaced by a function constructed in the addOpenContextOrRoleForm behaviour
    // whenever the user starts dragging a role that supports that behaviour.
    // Notice that we use indirection here. The value of eventDispatcher is a location that holds the actual eventDispatcher.
    // We pass the location around and have its contents modified by a function that is passed down in the react tree.
    // In this way we can change the eventDispatcher.
    this.eventDispatcher = {eventDispatcher: function(){}};
    this.state =
      { loggedIn:  false
      , isFirstChannel: false
      , indexedContextNameMapping: undefined
      , couchdbUrl: ""
      , isFirstInstallation: true
      , useSystemVersion: undefined
      , manualAccountCreation: undefined
      , systemIdentifier: undefined         // The system Identifier..
      , recompileLocalModels: false
      , defaultSystem: undefined
      , usersConfigured: undefined
      // Props that are likely to change after logging in or opening:
      , showNotifications: false
      , openroleform: {}
      , externalRoleId: undefined     // The external role instance of the context that is currently on display (if any).
      , myRoleType: undefined         // The type of user role the user plays in the context of the externalRoleId (if any).
      , roleId: undefined             // The role that is currently on display (if any).
      , viewname: undefined
      , cardprop: undefined
      , backwardsNavigation: undefined
      , endUserMessage: {}
      , recompilationState: "pending"
      , accountDeletionComplete: false
      
      };
    initUserMessaging(
      function ( message )
        {
          const p = new Promise(function(resolve)
            { 
              message.acknowledge = resolve
            });
          component.setState( {endUserMessage: message});
          return p.then( function()
          {
            component.setState( { endUserMessage: {}} );
          })
        });
    this.usesSharedWorker = typeof SharedWorker != "undefined";
    this.containerRef = React.createRef();
    this.clearExternalRoleId = function()
      {
        PDRproxy.then( function( pproxy )
        {
          if ( component.state.externalRoleId )
          {
            pproxy.getRoleName( component.state.externalRoleId, function (nameArr)
              {
                document.title = "Closed " + nameArr[0];
                history.pushState({ title: "Closed " + nameArr[0] }, "");
                component.setState({ externalRoleId: undefined});
              },
              FIREANDFORGET);
          }
        });
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

  componentDidMount()
  {
    const component = this;
    const beforeUnloadListener = (event) => {
      event.preventDefault();
      return event.returnValue = "Are you sure you want to exit?";
    };
    const params = new URLSearchParams(document.location.search.substring(1));

    function singleAccount(systemIdentifier)
    {
      if (params.get("recompilelocalmodels"))
      {
        component.setState({render: "recompileLocalModels"})
        getUser( systemIdentifier )
          .then( user => component.recompileLocalModels( user ));
      }
      else if (params.get("deleteaccount"))
      {
        component.setState({render: "deleteAccount"});
        component.deleteAccount( systemIdentifier );
      }
      else if ( params.get( "manualaccountcreation"))
      {
        component.setState( 
          { isFirstInstallation: params.get("isfirstinstallation")
          , useSystemVersion: params.get("usesystemversion")
          , render: "createAccountManually"} );              
      }
      else
      {
        component.setState({render: "startup"});
        getUser( systemIdentifier )
          .then( user => SharedWorkerChannelPromise
            .then( proxy => proxy.runPDR( systemIdentifier, user) )
            .then( () => component.prepareMyContextsScreen( systemIdentifier )));
      }
    }

    SharedWorkerChannelPromise
      .then( proxy => proxy.pdrStarted())
      .then( hasStarted => 
        {
          if (hasStarted)
          {
            // As the PDR has started, the user must have logged in (or it has been done automatically with the passwordless defaultSystem).
            PDRproxy.then( proxy => proxy.getUserIdentifier())
              .then( systemIdentifier => component.prepareMyContextsScreen( systemIdentifier[0] ) );
          }
        else
        {
          usersHaveBeenConfigured()
            .then( usersConfigured => 
              {
                if (usersConfigured)
                {
                  getDefaultSystem()
                    .then( defaultSystem => 
                      {
                        if (defaultSystem)
                        {
                          singleAccount( defaultSystem );
                        }
                        else
                        {
                          allUsers().then( users => 
                            {
                              if (users.length == 1)
                              {
                                getUser( users[0] )
                                .then( user => 
                                  {
                                    if (user.couchdbUrl)
                                    {
                                      component.setState({render: "login", couchdbUrl})
                                    }
                                    else
                                    {
                                      singleAccount( users[0] );
                                    }
                                  });
                              }
                              else
                              {
                                component.setState({render: "login"});
                              }
                            })
                        }
                      });
                }
                else
                {
                  if (params.get("manualaccountcreation"))
                  {
                    component.setState( 
                      { isFirstInstallation: params.get("isfirstinstallation")
                      , useSystemVersion: params.get("usesystemversion")
                      , render: "createAccountManually"} );              
                  }
                  else
                  {
                    component.setState({render: "createAccountAutomatically"})
                    component.createAccountAutomatically();
                  }
                }
            });        
            }
        } );
  }

  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    if (!prevState.loggedIn && this.state.loggedIn)
    {
      component.setState({render: "startup"});
      PDRproxy.then( proxy => proxy.getUserIdentifier())
        .then( systemIdentifier => component.prepareMyContextsScreen( systemIdentifier[0] ) );
    }
  }

  // Only call this function when the PDR is running.
  prepareMyContextsScreen( systemIdentifier )
  {
    const component = this;
    const params = new URLSearchParams(document.location.search.substring(1));
    const additionalState = {systemIdentifier};
    let contextrole;

    component.setHandlers()

    if (params.get("opencontext"))
    {
      contextrole = params.get("opencontext");
      if ( isSchemedResourceIdentifier(contextrole) )
      {
        ensureExternalRole( contextrole)
          .then(
            function(erole)
            {
              PDRproxy.then( function( pproxy )
                {
                  pproxy.getRoleName( erole, function (nameArr)
                    {
                      document.title = nameArr[0];
                      history.pushState({ selectedContext: erole, title: nameArr[0] }, "");
                      additionalState.externalRoleId = erole;
                      additionalState.render = "opencontext";
                      component.setState( additionalState );
                    },
                    FIREANDFORGET);
                });
            })
          .catch(e => UserMessagingPromise.then( um => 
            um.addMessageForEndUser(
              { title: i18next.t("app_opencontext_title", { ns: 'mycontexts' }) 
              , message: i18next.t("app_opencontext_message", {context: contextrole, ns: 'mycontexts'})
              , error: e.toString()
            })));
      }
      else
      {
        PDRproxy
          .then( proxy => proxy.matchContextName( contextrole ))
          .then( function (serialisedMapping)
            {
              const theMap = JSON.parse( serialisedMapping[0] );
              if ( Object.keys( theMap ).length == 0 )
              {
                UserMessagingPromise.then( um => um.addMessageForEndUser({title: "Matching request", "message": "Cannot find a match for " + contextrole}));
              }
              else if ( Object.keys( theMap ).length == 1 )
              {
                additionalState.externalRoleId = externalRole( Object.values(theMap)[0]);
                additionalState.render = "opencontext";
                component.setState( additionalState );
              }
              else
              {
                additionalState.indexedContextNameMapping = theMap;
                additionalState.render = "contextchoice";
                component.setState( additionalState );
              }
            });
      }
    }
    else if (params.get("openroleform"))
    {
      additionalState.openroleform = 
      { roleid: params.get("openroleform")
      , viewname: params.get("viewname")
      , cardprop: params.get("cardprop")
      , render: "openroleform"
      };
      component.setState( additionalState );
    }
    else
    {
      additionalState.render = "openEmptyScreen"
      component.setState(additionalState)
    }
  }

  setHandlers()
  {
    const component = this;
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
        removeEventListener("beforeunload", beforeUnloadListener, {capture: true});
      }
      else
      {
        // In this situation, the next backwards navigation exits MyContexts.
        // We need a modal dialog that returns a boolean result reflecting the users choice:
        //  true: yes, I want to leave MyContexts;
        //  false: no, I don't want to leave MyContexts.
        // If true, accept navigation.
        // If false, abort navigation.
        component.setState(
          { externalRoleId: undefined
          , viewname: undefined
          , cardprop: undefined
          , backwardsNavigation: true}
        );
        addEventListener("beforeunload", beforeUnloadListener, {capture: true});
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
        .catch(err => UserMessagingPromise.then( um => 
          um.addMessageForEndUser(
            { title: i18next.t("app_opencontext_title", { ns: 'mycontexts' }) 
            , message: i18next.t("app_opencontext_message", {context: e.detail, ns: 'mycontexts'})
            , error: err.toString()
          })));
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
  }

  deleteAccount( systemIdentifier )
  {
    const component = this;
    SharedWorkerChannelPromise
      .then( proxy => removeUser( systemIdentifier )
        .then( user => proxy.removeAccount(user.userName, user))
        .then( () => component.setState({accountDeletionComplete: true})));
  }

  recompileLocalModels(user)
  {
    const component = this;
    SharedWorkerChannelPromise.then( function (proxy)
    {
      proxy.recompileLocalModels( user )
        .then(
          function(success)
          {
            component.setState({recompilationState: success ? "success" : "failure"});
          });
    });
  }

  createAccountAutomatically()
  {
    const component = this;
    const newSystemId = cuid2();
    // create a new user record in localUsers, omitting password and couchdbUrl.
    addUser( newSystemId )
    .then(() =>
      // Now create the user in the PDR.
      getUser( newSystemId )
        .then( user =>
          SharedWorkerChannelPromise
            .then( proxy => proxy.createAccount(
              newSystemId,
              user,
              // CreateOptions. Read values from component state, that have been salvaged from query parameters.
              { isFirstInstallation: component.state.isFirstInstallation
              , useSystemVersion: component.props.usesystemversion
              } )
              // TODO. verwerk in splash screen.
              .then( () => component.setState({configurationComplete: true}) ) ) ) );
  }

  handleKeyDown(event, systemExternalRole)
  {
    switch(event.keyCode)
    {
      case 27: // Escape
        // Empty clipboard.
        PDRproxy
          .then( pproxy => pproxy.deleteProperty(
            systemExternalRole,
            ModelDependencies.cardClipBoard,
            ModelDependencies.sysUser) )
          .catch(e => UserMessagingPromise.then( um => 
            um.addMessageForEndUser(
              { title: i18next.t("clipboardEmpty_title", { ns: 'preact' }) 
              , message: i18next.t("clipboardEmpty_message", {ns: 'preact'})
              , error: e.toString()
            })));

        event.preventDefault();
        break;
    }
  }

  openMyContextsScreen ()
  {
    const component = this;
    function propagate(setter)
    {
      component.setState( setter );
    }
    return (
      <MySystem>
        <PSContext.Consumer>{ mysystem =>
          <AppContext.Provider value={
            { systemExternalRole: externalRole(mysystem.contextinstance)
            , externalRoleId: component.state.externalRoleId
            , roleId: component.state.roleId
            , myRoleType: component.state.myRoleType
            , systemIdentifier: component.state.systemIdentifier
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
                  isbasepage={!component.usesSharedWorker && component.state.isFirstChannel}
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
                      (component.state.indexedContextNameMapping 
                        ? 
                        <SelectContext indexedContextNameMapping={component.state.indexedContextNameMapping}/>
                        :
                        null)
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
                  <EndUserNotifier message={component.state.endUserMessage}/>
              </div>
            </Container>
          </AppContext.Provider>
        }</PSContext.Consumer>
      </MySystem>);
  }

  computeScreen()
  {
    const component = this;
    if (component.state.render)
    {
      switch (component.state.render)
      {
        case "recompileLocalModels":
          return <RecompileLocalModelsScreen recompilationstate={component.state.recompilationState}/>;
        case "login":
          return <AccountManagement
            setloggedin={() => component.setState({loggedIn: true})}
            setcouchdburl={url => component.setState({couchdbUrl: url})}
            isfirstinstallation={ component.state.isFirstInstallation }
            usesystemversion={ component.state.useSystemVersion }
            />;
        case "createAccountManually":
          return <AccountManagement
            setloggedin={() => component.setState({loggedIn: true})}
            setcouchdburl={url => component.setState({couchdbUrl: url})}
            isfirstinstallation={ component.state.isFirstInstallation }
            usesystemversion={ component.state.useSystemVersion }
            />;
        case "createAccountAutomatically":
          return <IntroductionScreen configurationcomplete={component.state.configurationComplete}/>;
        case "startup":
          return <StartupScreen/>;
        case "deleteAccount":
          return <DeleteInstallation accountdeletioncomplete={component.state.accountDeletionComplete}/>;
        case "opencontext":
        case "openroleform":
        case "contextchoice":
        case "openEmptyScreen":
          return component.openMyContextsScreen();
      }
    }
    else
    {
      return <div/>;
    }
  }

  render()
  {
    return <div ref={this.containerRef}>{ this.computeScreen() }</div>;
  }

}

// This function returns a promise for the external role of the context of the role s that is passed in, or fails.
function ensureExternalRole(s)
{
  if ( isExternalRole( s ) )
  {
    return Promise.resolve( s );
  }
  else
  {
    // Request the binding and then its context.
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
                  else
                  {
                    proxy.getRolContext( bindingIds[0] ).then(
                      contextArr => resolve( externalRole( contextArr[0] ))
                    )
                  }
                }
                else
                {
                  // Otherwise, either not a context role after all, or no binding. Fail.
                  return reject( new Error( "This role is not an external role and has no filler either, so cannot open a context for role: " + s ));
                }
              },
            FIREANDFORGET,
            function (e)
            {
              return reject(e);
            });
        }));
  }

}

// A function that generates a CUID using the current epoch as fingerprint.
const cuid2 = init({
  // A custom random function with the same API as Math.random.
  // You can use this to pass a cryptographically secure random function.
  random: Math.random,
  // the length of the id
  length: 10,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  fingerprint: Date.now(),
});
