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

///////////////////////////////////////////////////////////////////////////////
//// TYPE POUCHDBUSER
///////////////////////////////////////////////////////////////////////////////
// The Purescript type:
// type PouchdbUser =
// type PouchdbUser =
//   { systemIdentifier :: String
//   , perspectivesUser :: PerspectivesUser
//   , userName :: String
//   , password :: Maybe String
//   , couchdbUrl :: Maybe String
//   }

///////////////////////////////////////////////////////////////////////////////
//// THE USER DOCUMENT IN INDEXEDDB
///////////////////////////////////////////////////////////////////////////////
/*
The user document equals the PouchdbUser structure, but has two additional member for Pouchdb:
  - _rev: the revision
  - _id: the documents identification. This is equal to the perspectivesUser member and it is the identifier of the
        PerspectivesUsers role instance that uniquely identifies a particular natural person within the Perspectives Universe.

For a Couchdb installation, the Couchdb username equals the PerspectivesUsers identifier. For that reason, we often use the 
`username` paramater in these functions.
*/

import Pouchdb from "pouchdb-browser";

// The IndexedDB database "localUsers"
const localUsers = new Pouchdb("localUsers");

///////////////////////////////////////////////////////////////////////////////
//// USERSHAVEBEENCONFIGURED
///////////////////////////////////////////////////////////////////////////////
// The type returned from db.info
// {
//   "db_name": "test",
//   "doc_count": 4,
//   "update_seq": 5
// }

// Returns a Promise for a boolean value
export async function usersHaveBeenConfigured()
{
  const { doc_count } = await localUsers.info();
  return doc_count > 0;
}

///////////////////////////////////////////////////////////////////////////////
//// ADDUSER
///////////////////////////////////////////////////////////////////////////////

// Returns a promise for this structure:
// {
//   "ok": true,
//   "id": "mydoc",
//   "rev": "1-A6157A5EA545C99B00FF904EEF05FD9F"
// }
// couchdbUrl and password may be undefined.
export function addUser( userName, password, couchdbUrl, perspectivesUser )
{
  return getUser(userName)
    .then(function ({_rev})
      {
        const user = 
          { _rev
          , _id: userName
          // , systemIdentifier
          , userName
          , perspectivesUser
          , password
          , couchdbUrl
          };
        return localUsers.put( user );
      })
    .catch(function ()
      {
        const user = 
          {_id: userName
          // , systemIdentifier
          , userName
          , perspectivesUser
          , password
          , couchdbUrl
          };
        return localUsers.put( user );
      });
}

///////////////////////////////////////////////////////////////////////////////
//// PUTUSER
///////////////////////////////////////////////////////////////////////////////
// Either modify an existing user, or create a new one.
// The document provided doesn't have to have a revision: we fetch it first.
// Returns the document (with the previous revision!)
export function putUser( doc )
{
  return getUser(doc._id)
    .then(function ({_rev})
      {
        doc._rev = _rev;
        return localUsers.put( doc ).then( () => doc );
      })
    .catch( () => localUsers.put( doc ).then( () => doc ) );
}

///////////////////////////////////////////////////////////////////////////////
//// MODIFYUSER
// OBSOLETE
///////////////////////////////////////////////////////////////////////////////
export function modifyUser( perspectivesUsersId, newMembers )
{
  return getUser(perspectivesUsersId)
    .then(function (doc)
      {
        Object.keys(newMembers).forEach( key => doc[key] = newMembers[key])
        return localUsers.put( doc );
      })
    .catch(function (err)
      {
        newMembers._id = perspectivesUsersId;
        return localUsers.put( newMembers );
      })
}

///////////////////////////////////////////////////////////////////////////////
//// GETUSER
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for the User. Catch the promise to detect that no users with the given name exists.
export function getUser( userName )
{
  return localUsers.get( userName );
}

///////////////////////////////////////////////////////////////////////////////
//// REMOVEUSER
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for the removed PouchdbUser. Catch the promise to detect that no users with the given name exists.
export function removeUser( userName )
{
  return localUsers.get( userName ).then( pouchdbUser =>
    {
      return localUsers.remove( pouchdbUser)
        .then( () => pouchdbUser )
        .catch( e => alert( e ));
    });
}

///////////////////////////////////////////////////////////////////////////////
//// ALLUSERS
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for an array of PerspectivesUsers identifiers (Couchdb user names).
export function allUsers()
{
  return localUsers.allDocs().then(result => result.rows.map( row => row.id));
}

///////////////////////////////////////////////////////////////////////////////
//// AUTHENTICATEUSER
///////////////////////////////////////////////////////////////////////////////
// Returns a promise with one of three values:
//  - "ok" when username and password belong to each other.
//  - "wrongpassword" when the password is not equal to that stored with the user.
//  - "unknownuser" when no user could be found.
export function authenticateUser( userName, pwd )
{
  return localUsers.get( userName )
    .then( ({password}) => pwd === password ? "ok" : "wrongpassword")
    .catch( () => "unknownuser");
}

///////////////////////////////////////////////////////////////////////////////
//// DETECTCOUCHDB
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for a Boolean. False if the Couchdb endpoint does not exist, true otherwise.
export function detectCouchdb(url)
{
  const FETCH_TIMEOUT = 5000;
  const db = new Pouchdb(url);
  let didTimeOut = false;

  return new Promise(function(resolve, reject) {
      const timeout = setTimeout(function() {
          didTimeOut = true;
          reject(false);
      }, FETCH_TIMEOUT);

      db.info()
        .then(function() {
            // Clear the timeout as cleanup
            clearTimeout(timeout);
            if(!didTimeOut) {
                resolve(true);
            }
        })
        .catch(function() {

            // Rejection already happened with setTimeout
            if(didTimeOut) return;
            // Reject with error
            reject(false);
        });
    }).then( () => true).catch( () => false );
}
