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

/*
The PDR needs values for some parameters that determine how it runs, such as the duration of interval between successive rounds of storing changed resources in the database.
Collectively, we call them runtime options. As these options must be available BEFORE the PDR starts, it is convenient to have access to them in a way that does not rely
on the PDR itself. 
Some of these parameters may be set with a query string parameter.
Others are set during the installation process.
Even more options may be set from within MyContexts itself.

These parameter-value combinations are specific for an installation.
We keep them in a single JSON document per installation in the database runtimeoptions in IndexedDB.
This means that the installations' System identifier is the most logical choice as key.
However, as the options document is used to authenticate against for Couchdb installations, we must be able to find it using 
the PerspectivesUsers identifier.
This leads to the following design decision: for a given (Chrome) profile, only a single Couchdb installation can be made for any 
given PerspectivesUsers identifier. Or, simply put: one Couchdb installation per Chrome profile, identified by the Couchdb user name.
For an IndexedDB installation, we use the PerspectivesUserId.
That implies that for a given (Chrome) profile, only a single IndexedDb installation can be made. 
The overall design decision is then that a profile supports exactly one Perspectives installation.

Options can be:

  { 
  -- Default: true. Should be false when someone installs MyContexts on a second device.
  -- Only relevant on creating an installation (app.createAccount).
  isFirstInstallation :: Boolean

  -- Default: null. Provide a value to test setup of an experimental new System version.
  -- Only relevant on creating an installation (app.createAccount).
  , useSystemVersion :: Nullable String

  -- Default: the package number taken from package.json
  -- Relevant for runPDR in order to be able to show to the end user.
  , myContextsVersion :: String

  -- the members privateKey and publicKey are not used clientside, as we cannot store CryptoKey objects through Pouchdb. 
  -- we use IDB
}

However, notice that we cannot put the privateKey or publicKey in the options database, as Pouchdb requires JSON
(and the CryptoKey objects are no json values).

Instead, we put them into a key-value store with 'idb-keyval'. In the PDR, we extract that value and put it back into the runtime options.

*/

import Pouchdb from "pouchdb-browser";

// The IndexedDB database "runtimeoptions"
const runtimeOptionsDB = new Pouchdb("runtimeoptions");

///////////////////////////////////////////////////////////////////////////////
//// CREATE AND DELETE OPTIONS
///////////////////////////////////////////////////////////////////////////////
// Creates a new options document in the runtimeoptions database. Returns a promise for the options as passed in.
export function createOptionsDocument ( userName, options )
{
  options._id = userName;
  return runtimeOptionsDB.put(options).then( () => options );
}

// Returns a Promise for a boolean value
export function optionsHaveBeenConfigured()
{
  return runtimeOptionsDB.info().then( ({doc_count}) => doc_count > 0);
}

export function deleteOptions ( perspectivesUsersId )
{
  return runtimeOptionsDB.get( perspectivesUsersId )
    .then( options => runtimeOptionsDB.remove( options ) )
    .catch( e => alert( e ));
}

export function getOptions( perspectivesUsersId )
{
  return runtimeOptionsDB.get( perspectivesUsersId );
}