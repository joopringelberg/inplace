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
    PerspectiveForm,
    isSchemedResourceIdentifier,
    isExternalRole,
    externalRole,
    ModelDependencies,
    EndUserNotifier,
    initUserMessaging,
    UserMessagingPromise,
    takeCUID
  } from "perspectives-react";

import Container from 'react-bootstrap/Container';

// import 'bootstrap/dist/css/bootstrap.min.css';

import './bootstrap.css'

import NavigationBar from "./navigationbar.js";

import AccountManagement from "./AccountManagement.js";

import {NotificationsDisplayer} from "./notifications.js";

import {SelectContext} from "./selectContext.js";

import i18next from "i18next";

import {initI18next} from "./i18next.js";

import {init} from '@paralleldrive/cuid2';

import { del as deleteCryptoKey, set as setCryptoKey } from 'idb-keyval';

import { createOptionsDocument, deleteOptions, getOptions } from "./runtimeOptions.js";
import { putUser, allUsers, getUser, removeUser, usersHaveBeenConfigured, perspectivesUser2userName } from "./usermanagement.js";
import IntroductionScreen from "./introductionSplash.js";
import StartupScreen from "./startupSplash.js";
import DeleteInstallation from "./deleteInstallationSplash.js";
import RecompileLocalModelsScreen from "./recompileLocalModelsScreen.js";
import NoContextSelected from "./noContextScreen.js";
import ReCreateInstancesScreen from "./reCreateInstancesScreen.js";
import { InvitationImportDialog } from "./invitationImportDialog.js";
import InstallationAborted from "./installationAbortedSplash.js";
import { addUserNameToUser, fixUser, getInstalledVersion, initializeMyContextsVersions, runUpgrade, setMyContextsVersion } from "./dataUpgrade.js";
import { hideCursorWaitingOverlay, showCursorWaitingOverlay } from "./cursor.js";

/*
QUERY PARAMETERS AND VALUES
  - recompilelocalmodels=true
  - recreateinstances=true
  - manualaccountcreation=true
  - isfirstinstallation=true
  - usesystemversion=MAJOR.MINOR
  - deleteaccount=true
  - opencontext=<external role or contextrole identifier>
  - openroleform=<role identifier>
  - viewname=<view identifier>
  - cardprop=<property type identifier>
*/

const PUBLICKEY = "_publicKey";
const PRIVATEKEY = "_privateKey";

export default class App extends Component
{
  constructor(props)
  {
    super(props);
    const component = this;
    this.i18nextPromise = initI18next("en");
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
      , reCreationState: "pending"
      , accountDeletionComplete: false
      , i8nextReady: false
      , droppedFile: undefined
      , exportedPublicKey: undefined
      , exportedPrivateKey: undefined
      , keypairSaveResolver: undefined    // use this resolver to continue the installation after the public-private keypair has been saved.
      , keypairSaveRejecter: undefined    // use this rejecter to abort the installation when the public-private keypair has NOT been saved.
      , keypairUploadResolver: undefined  // use this resolver to communicate back whether the end user has uploaded a keypair.
      , keypairUploadRejecter: undefined  // use this rejector when uploading has gone irrecoverably wrong.
      , reasonForAbortion: ""             // A message string that says something about why the installation went wrong.
      , perspectivesUsersId: undefined    // The string that identifies the natural person in the Perspectives Universe.
      
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
    const params = new URLSearchParams(document.location.search.substring(1));

    component.i18nextPromise.then( () => component.setState({i8nextReady: true}))

    initializeMyContextsVersions()
      .then( () =>
        SharedWorkerChannelPromise
          .then( proxy => proxy.pdrStarted())
          .then( hasStarted => 
            {
              if (hasStarted)
              {
                // As the PDR has started, the user must have logged in (or it has been done automatically with the passwordless defaultSystem).
                PDRproxy.then( proxy => proxy.getPerspectivesUser())
                  .then( perspectivesUser => 
                    {
                      if ( params.get("deleteaccount") || params.get("recreateinstances") || params.get("recompilelocalmodels") )
                      {
                        component.singleAccount( takeCUID( perspectivesUser[0] ) );
                      }
                      else
                      {
                        perspectivesUser2userName( takeCUID( perspectivesUser[0] ) )
                          .then( getUser )
                          .then( ({systemIdentifier}) => component.prepareMyContextsScreen( systemIdentifier ));
                      }
                    });
              }
              else
              {
                // Vraag hier op of er een param is met een username
                if (params.get("username"))
                {
                  component.setState({render: "createAccountAutomatically"});
                  component.createAccountInCouchdb( params.get("username") );
                }
                else
                {
                  usersHaveBeenConfigured()
                    .then( usersConfigured => 
                      {
                        if (usersConfigured)
                        {
                          allUsers().then( users => 
                            {
                              if (users.length == 1)
                              {
                                component.runDataUpgrades( users[0] )
                                  .then( getUser )
                                  .then( user => 
                                  {
                                    if (user.couchdbUrl)
                                    {
                                      // NU MISSEN WE DE ANALYSE VAN SINGLEACCOUNT
                                      component.setState({render: "login", couchdbUrl: user.couchdbUrl})
                                    }
                                    else
                                    {
                                      // A single user and not in Couchdb. We can start right away.
                                      component.singleAccount( users[0] );
                                    }
                                  });
                              }
                              else
                              {
                                component.setState({render: "login"});
                              }
                            })
                        }
                        else
                        {
                          if (params.get("manualaccountcreation"))
                          {
                            component.setState( 
                              { isFirstInstallation: params.get("isfirstinstallation") == null ? true : params.get("isfirstinstallation") == "true"
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
                  }}
              } ) );
  }

  // Runs all applicable upgrades and just returns the perspectivesUsersId that was passed in.
  runDataUpgrades(perspectivesUsersId)
  {
    // Make sure we have a version number. Initializes to the current version.
    return getInstalledVersion()
      .then( installedVersion => 
        {
          runUpgrade( installedVersion, "0.22.1", () => fixUser(perspectivesUsersId));
          runUpgrade( installedVersion, "0.22.2", () => addUserNameToUser(perspectivesUsersId));
        })
      .then( () => setMyContextsVersion())
      .then( () => perspectivesUsersId );
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  singleAccount(perspectivesUsersId)
  {
    const component = this;
    const params = new URLSearchParams(document.location.search.substring(1));
    if (params.get("recompilelocalmodels"))
    {
      component.runDataUpgrades(perspectivesUsersId)
        .then( () => 
      {
        component.setState({render: "recompileLocalModels"})
        getUser( perspectivesUsersId )
          .then( user => component.recompileLocalModels( user ));
      });
    }
    else if (params.get("recreateinstances"))
    {
      component.runDataUpgrades(perspectivesUsersId)
        .then( () => 
        {
          component.setState({render: "reCreateInstances"});
          getUser( perspectivesUsersId )
            .then( user => component.reCreateInstances( perspectivesUsersId, user ) );
            });
    }
    else if (params.get("deleteaccount"))
    {
      component.setState({render: "deleteAccount"});
      component.deleteAccount( perspectivesUsersId );
    }
    else if ( params.get( "manualaccountcreation"))
    {
      component.setState( 
        { isFirstInstallation: params.get("isfirstinstallation") == null ? true : params.get("isfirstinstallation") == "true"
        , useSystemVersion: params.get("usesystemversion")
        , render: "createAccountManually"} );              
    }
    else
    {
      component.runDataUpgrades(perspectivesUsersId)
        .then( () => 
        {
          component.setState({render: "startup"});
          getUser( perspectivesUsersId )
            .then( user => getOptions( perspectivesUsersId)
              .then( options => SharedWorkerChannelPromise
                .then( proxy => proxy.runPDR( perspectivesUsersId, user, options) )
                .then( () => component.prepareMyContextsScreen( user.systemIdentifier ))));
        });
    }
  }


  componentDidUpdate(prevProps, prevState)
  {
    const component = this;
    if (!prevState.loggedIn && this.state.loggedIn)
    {
      component.setState({render: "startup"});
      PDRproxy.then( proxy => proxy.getSystemIdentifier())
        .then ( systemIdentifiers => component.prepareMyContextsScreen( systemIdentifiers[0] ))
    }
  }

  // Only call this function when the PDR is running.
  prepareMyContextsScreen( systemIdentifier )
  {
    const component = this;
    const params = new URLSearchParams(document.location.search.substring(1));
    const additionalState = {systemIdentifier};
    const mycontextStartPage = __STARTPAGE__;
    let contextrole;

    component.setHandlers()

    if (params.get("opencontext"))
    {
      contextrole = decodeURIComponent( params.get("opencontext") );
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
      // We execute this once on starting up the client, once for every tab or screen.
      // additionalState.render = "openEmptyScreen"
      // component.setState(additionalState)
      document.title = "Welcome to MyContexts";
      history.pushState({ selectedContext: mycontextStartPage, title: "Welcome to MyContexts" }, "");
      additionalState.externalRoleId = mycontextStartPage;
      additionalState.render = "opencontext";
      component.setState( additionalState );
    }
  }

  setHandlers()
  {
    const component = this;
    const beforeUnloadListener = (event) => {
      event.preventDefault();
      return event.returnValue = "Are you sure you want to exit?";
    };
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
              },
              FIREANDFORGET
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

  deleteAccount( perspectivesUsersId )
  {
    const component = this;
    SharedWorkerChannelPromise
      .then( proxy => deleteOptions( perspectivesUsersId )
        .then( () => removeUser( perspectivesUsersId ))
        .then( user => proxy.removeAccount(user.userName, user))
        .then( () => deleteCryptoKey( perspectivesUsersId + PUBLICKEY) )
        .then( () => deleteCryptoKey( perspectivesUsersId + PRIVATEKEY) )
        .then( () => component.setState({accountDeletionComplete: true}))
        .then( () => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (let registration of registrations) {
                registration.unregister();
              }
            });
          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              cacheNames.forEach((cacheName) => {
                caches.delete(cacheName);
              });
            });
          }
          localStorage.clear();
          indexedDB.databases().then((dbs) => {
            dbs.forEach((db) => {
              indexedDB.deleteDatabase(db.name);
            });
          });          
          }})
      );
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

  reCreateInstances(perspectivesUsersId, user)
  {
    const component = this;
    SharedWorkerChannelPromise.then( function (proxy)
    {
      getOptions( perspectivesUsersId ).then( options => 
        proxy.reCreateInstances( user, options )
          .then(
            function(success)
            {
              component.setState({reCreationState: success ? "success" : "failure"});
            }));
    });
  }

  createAccountAutomatically()
  {
    const newPerspectivesUserId = cuid2();
    this.createAccount(newPerspectivesUserId, {})
  }

  // Whenever this function is called, a user document with systemIdentifier, password and couchdburl has been saved 
  // with _id equal to the userName (which doubles as perspectivesUser, the identifier of the natural person in the Perspectives Universe).
  createAccountInCouchdb( userName )
  {
    getUser(userName).then( user => this.createAccount(userName, user))
  }

  createAccount(newPerspectivesUserId, user)
  {
    const component = this;
    let options, systemId,
      keypairUploaded = false, 
      identityDoc = null, 
      definitePerspectivesUserId = newPerspectivesUserId;
    // Create the runtime options document. Also create and store a private and public key.
    // Read values from component state, that have been salvaged from query parameters.
    // 
    return component.askForKeypair()
      .then( ({keypair, installationSequenceNumber, identityDocument}) => 
        {
          // The document has identifiers for the perspectivesSystem and for author that include storage schemes.
          // However, we have to provide schemaless identifiers to the PDR.
          keypairUploaded = !!keypair;
          identityDoc = identityDocument;
          if (keypairUploaded)
          {
            // When re-using a cryptographic keypair, we MUST use the PerspectivesUser id that this pair is allotted to.
            definitePerspectivesUserId = takeCUID( identityDoc.author )
          }
          systemId = definitePerspectivesUserId + installationSequenceNumber
          if (!keypairUploaded)
          {
            return component.createKeypair(definitePerspectivesUserId);
          }
          else { 
            // we need to return a value for the Promise to resolve. Its value is not consumed.
            return true; 
          }
        })
        // Create or modify the user document stored with _id equal to systemId.
        .then( () => 
          {
            const definiteUser = 
              { _id: definitePerspectivesUserId
              , systemIdentifier: systemId
              , perspectivesUser: definitePerspectivesUserId
              , userName: user.userName || definitePerspectivesUserId
              , password: user.password
              , couchdbUrl: user.couchdbUrl
              };
            return putUser( definiteUser );
          })
        .then( dUser => createOptionsDocument(dUser.userName,
          { isFirstInstallation: !keypairUploaded
          , useSystemVersion: component.props.usesystemversion
          , myContextsVersion: __MyContextsversionNumber__
          }) )
        // Display the modal dialog that forces the user to store the keypair.
        .then( o => 
          {
            options = o;
            // Only ask to save the keypair if it wasn't uploaded before.
            if (!keypairUploaded)
            {
              return component.saveKeyPair();
            }
          })
        // After the end user has downloaded her keys, create the user in the PDR.
        .then( () => 
          {
            showCursorWaitingOverlay();
            return getUser( definitePerspectivesUserId )
          } )
        .then( u => SharedWorkerChannelPromise.then( proxy => proxy.createAccount( definitePerspectivesUserId, u, options, identityDoc )) )
        // Finally, we remove the keypair from state. From now on, the only copy of the private key 
        // is in the file on the end users' hard disk or wherever she chose to store it.
        .then( () => component.setState({configurationComplete: true, exportedPrivateKey: undefined, exportedPublicKey: undefined}) ) 
        .catch( e => component.setState({render: "installationaborted", reasonForAbortion: e.message || e.reason}));
  }

  // Show modal dialog with an opportunity to upload a keypair.
  // If the end user uploads a keypair: sets two crypto keys.
  // Returns a promise for {keypair, identityDocument, installationSequenceNumber}.
  // keypair and identityDocument are optional.
  askForKeypair()
  {
    // takeCUID( response.identityDocument.author )
    const component = this;
    function setKeyPair( {privateKey, publicKey}, definitePerspectivesUserId )
    {
      return window.crypto.subtle.importKey( "jwk", privateKey, { name: "ECDSA", namedCurve: "P-384" }, false, ["sign"])
        .then( key => setCryptoKey( definitePerspectivesUserId + PRIVATEKEY, key ))
        .then( () => window.crypto.subtle.importKey( "jwk", publicKey, { name: "ECDSA", namedCurve: "P-384" }, true, ["verify"]))
        .then( key => setCryptoKey( definitePerspectivesUserId + PUBLICKEY, key ) )
    }

    return new Promise( (resolver, keypairUploadRejecter) => 
      {
        // use the resolver to return either true or false. The rejecter is for emergency cases and will lead to abortion of the installation.
        component.setState( 
          { keypairUploadRejecter
          , keypairUploadResolver: response =>
            {
              const author = response.identityDocument ? takeCUID( response.identityDocument.author ) : undefined;
              // response is {keypair, identityDocument, installationSequenceNumber}. Import both keys and return the identityDocument.
              if ( response.keypair )
              {
                setKeyPair(response.keypair, author)
                  .then( () => resolver( response ) )
              }
              else 
              {
                resolver (response );
              }
            }
          });
      } );
  }

  saveKeyPair()
  {
    const component = this;
    return new Promise( (keypairSaveResolver, keypairSaveRejecter) =>
    {
      // Now display the modal dialog. Resolve the promise when the user completes the download.
      // Reject any other course of action.
      component.setState( {keypairSaveResolver, keypairSaveRejecter} );
    })
  }

  createKeypair (perspectivesUsersId)
  {
    const component = this;
    let keypair, exportedPrivateKey, exportedPublicKey;
    return window.crypto.subtle.generateKey(
        {
        name: "ECDSA",
        namedCurve: "P-384"
        },
        true, // extractable.
        ["sign", "verify"])
      .then( kp => keypair = kp)
      .then( () => setCryptoKey( perspectivesUsersId + PUBLICKEY, keypair.publicKey ) )
      .then( () => window.crypto.subtle.exportKey( "jwk", keypair.privateKey ) )
      .then( buff => 
        {
          // We must save the exported private key because it appears as if it can only be exported once.
          exportedPrivateKey = buff;
          return window.crypto.subtle.importKey( "jwk", buff, { name: "ECDSA", namedCurve: "P-384" }, false, ["sign"])
        } )
      .then( unextractablePrivateKey => setCryptoKey( perspectivesUsersId + PRIVATEKEY, unextractablePrivateKey))
      .then( () => window.crypto.subtle.exportKey( "jwk", keypair.publicKey ) )
      .then( buff => exportedPublicKey = buff)
      // Put the keys in state so they can be exported.
      // We'll delete them from state as soon as that has been done.
      .then( () => component.setState({exportedPrivateKey, exportedPublicKey, perspectivesUsersId} ) )
      .catch( e => console.log( e ));
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
    hideCursorWaitingOverlay();
    return (
      <MySystem>
        <PSContext.Consumer>{ mysystem =>
          <AppContext.Provider value={
            { systemExternalRole: externalRole(mysystem.contextinstance)
            , roleId: component.state.roleId
            , myRoleType: component.state.myRoleType
            , systemIdentifier: component.state.systemIdentifier
            , externalRoleId: component.state.externalRoleId
            , setEventDispatcher: function(f)
                {
                  component.eventDispatcher.eventDispatcher = f;
                }
            , couchdbUrl: component.state.couchdbUrl}}>
            <Container id="__MyContextsContainer__">
              <div onKeyDown={event => component.handleKeyDown(event, externalRole(mysystem.contextinstance) )}>
                <NavigationBar
                  systemexternalrole={externalRole(mysystem.contextinstance)}
                  setshownotifications={value => component.setState({showNotifications: value})}
                  isbasepage={!component.usesSharedWorker && component.state.isFirstChannel}
                  eventdispatcher={component.eventDispatcher}
                  myroletype={component.state.myRoleType}
                  externalroleid={component.state.externalRoleId}
                  clearexternalroleid={component.clearExternalRoleId}
                  setdroppedfile={ theFile => component.setState({droppedFile: theFile})}
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
                        <NoContextSelected/>
                      )
                    )
                  }</Container>
                  {
                    component.state.externalRoleId && component.state.showNotifications ?
                    <NotificationsDisplayer
                      externalroleid={component.state.externalRoleId}
                      systemcontextinstance={mysystem.contextinstance}
                      shownotifications={component.state.showNotifications}
                      navigateto={propagate}
                      />
                    : null
                  }
                  <EndUserNotifier message={component.state.endUserMessage}/>
                  <InvitationImportDialog thefile={component.state.droppedFile} setdroppedfile={ theFile => component.setState({droppedFile: theFile})}/>
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
        case "reCreateInstances":
          return <ReCreateInstancesScreen recreationstate={component.state.reCreationState}/>;
        case "login":
          return <AccountManagement
            isfirstinstallation={ component.state.isFirstInstallation }
            usesystemversion={ component.state.useSystemVersion }
            continuation={ user => component.singleAccount( user )}
            />;
        case "createAccountManually":
          return <AccountManagement
            isfirstinstallation={ component.state.isFirstInstallation }
            usesystemversion={ component.state.useSystemVersion }
            continuation={ user => component.singleAccount( user )}
            />;
        case "createAccountAutomatically":
          return <IntroductionScreen 
                  perspectivesuserid={component.state.perspectivesUsersId}
                  configurationcomplete={component.state.configurationComplete} 
                  keypairsaverejecter={component.state.keypairSaveRejecter} 
                  keypairsaveresolver={component.state.keypairSaveResolver} 
                  keypair={{privateKey: component.state.exportedPrivateKey, publicKey: component.state.exportedPublicKey}}
                  keypairuploadresolver={component.state.keypairUploadResolver}
                  keypairuploadrejecter={component.state.keypairUploadRejecter}/>;
        case "startup":
          showCursorWaitingOverlay();
          return <StartupScreen/>;
        case "deleteAccount":
          return <DeleteInstallation accountdeletioncomplete={component.state.accountDeletionComplete}/>;
        case "opencontext":
        case "openroleform":
        case "contextchoice":
        case "openEmptyScreen":
          return component.openMyContextsScreen();
        case "installationaborted":
          hideCursorWaitingOverlay();
          return <InstallationAborted reason={component.state.reasonForAbortion}/>
      }
    }
    else if (component.state.i8nextReady)
    {
      return <div className="introductionSplash text-muted">
              <div className="bg-primary text-white pb-3">
                <Container>
                  <h1 className="text-center pt-5">MyContexts</h1>
                </Container>
              </div>
              <Container>
                <h3 className="text-center pt-5 pb-5">{ i18next.t("app_application_loads", { ns: 'mycontexts' }) }</h3>
              </Container>
              </div>;
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
// It expands default namespaces and dereferences IndexedContext names.
// If the role is a context role, returns the binding of that role.
//  - pass through an external role
//  - expand namespace and dereference indexed contexts
//  - construct an external role for a context identifier
//  - return the context of the filler for a role identifier.
//  - throw an error in all other cases.
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
          proxy.matchContextName( s, 
            ( function (serialisedtable)
              {
                const table = JSON.parse( serialisedtable[0]);
                if (table[s])
                {
                  resolve( externalRole( table[s] ))
                }
                else if (Object.keys(table).length == 1)
                {
                  resolve( externalRole( Object.values(table)[0]) );
                }
                else
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
                }
              })
            , FIREANDFORGET );
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
