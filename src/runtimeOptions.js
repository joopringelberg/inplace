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

We store these parameter-value combinations in a single JSON document in the database runtimeoptions in IndexedDB.
*/

import Pouchdb from "pouchdb-browser";

// The IndexedDB database "runtimeoptions"
const runtimeOptionsDB = new Pouchdb("runtimeoptions");

// Returns a Promise for a boolean value
export function optionsHaveBeenConfigured()
{
  return runtimeOptionsDB.info().then( ({doc_count}) => doc_count > 0);
}

///////////////////////////////////////////////////////////////////////////////
//// GETOPTIONS
///////////////////////////////////////////////////////////////////////////////
// Returns a promise for the options. If no options have been configured, returns an empty object.
export function getOptions()
{
  return runtimeOptionsDB.get( "options" ).catch( () => console.log("No options configured, yet") ).then( function(){return {};});;
}

///////////////////////////////////////////////////////////////////////////////
//// SET/GETDEFAULTSYSTEM
//// The identifier of the system that has been installed without entering user credentials.
///////////////////////////////////////////////////////////////////////////////
export function setDefaultSystem( systemId )
{
  getOptions().then( options => 
    {
      options.defaultSystem = systemId;
      runtimeOptionsDB.put( options ) 
    });
}

// Returns undefined if no default system has been set.
export function getDefaultSystem()
{
  return getOptions().then( options => options.defaultSystem );
}