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
export function usersHaveBeenConfigured()
{
  return localUsers.info().then( ({doc_count}) => doc_count > 0);
}

///////////////////////////////////////////////////////////////////////////////
//// TYPE POUCHDBUSER
///////////////////////////////////////////////////////////////////////////////
// The Purescript type:
// type PouchdbUser =
//   { _rev :: Maybe String
//   , systemIdentifier :: String
//   , password :: String
//   , couchdbUrl :: Maybe String
//
//   -- TODO. Te verwijderen zodra Perspectives.Persistence.API alles heeft overgenomen.
//   -- We do not need the UserName value in the core, as long as we have the systemIdentifier.
//   , userName :: CDBstate.UserName
//   }

///////////////////////////////////////////////////////////////////////////////
//// ADDUSER
///////////////////////////////////////////////////////////////////////////////

// Returns a promise for this structure:
// {
//   "ok": true,
//   "id": "mydoc",
//   "rev": "1-A6157A5EA545C99B00FF904EEF05FD9F"
// }
// couchdbUrl may be undefined.
export function addUser( userName, password, couchdbUrl )
{
  // For now, we just copy the userName into systemIdentifier.
  return getUser(userName)
    .then(function ({_rev})
      {
        // TODO. Replace systemIdentifier with a guid.
        const user = {_rev, _id: userName, userName, password, couchdbUrl, systemIdentifier: userName };
        return localUsers.put( user );
      })
    .catch(function ()
      {
        // TODO. Replace systemIdentifier with a guid.
        const user = { _id: userName, userName, password, couchdbUrl, systemIdentifier: userName };
        return localUsers.put( user );
      });
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
      return localUsers.remove( pouchdbUser).then( () => pouchdbUser);
    });
}

///////////////////////////////////////////////////////////////////////////////
//// ALLUSERS
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for an array of user ids.
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
