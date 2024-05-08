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

import { getUser, putUser } from './usermanagement';

const idbKeyval = require('idb-keyval')
const myContextsVersion = __MyContextsversionNumber__; 

// Runs the upgrade only if it is associated with a version that is higher than 
// the installed version but lower than or equal to the version that is running right now.
// This ensures that the upgrade is run only once in history for each installation.
// An upgrade must return a promise; its result is ignored.
export function runUpgrade( installedVersion, upgradeVersion, upgrade)
{
  if (installedVersion < upgradeVersion && upgradeVersion <= myContextsVersion)
  {
    return upgrade();
  }
}

// If the recorded version is lower than that provided as parameter value, it will be overwritten
// by that value.
export function setMyContextsVersion()
{
  return idbKeyval.get("currentMyContextsVersion")
    .then( installedVersion =>
      {
        if ( installedVersion < myContextsVersion )
        {
          return idbKeyval.set( "currentMyContextsVersion", myContextsVersion );
        }
      })
}

// If There was no previous record of `currentMyContextsVersion`, this function will initialize it to the current version that is running.
export function initializeMyContextsVersions()
{
  return idbKeyval.get("CurrentPDRVersion")
    .then( v => 
      {
        if (v)
        {
          // This cannot be a first installation; otherwise there wouldn't be a value for CurrentPDRVersion.
          return idbKeyval.get("currentMyContextsVersion")
            .then(( installedVersion =>
              {
                if ( !installedVersion )
                {
                  // No value for currentMyContextsVersion: we want to apply patch fixUser, so initialize to "0.22.0".
                  return idbKeyval.set("currentMyContextsVersion", "0.22.0");
                }
                else
                {
                  return installedVersion;
                }
              }))
            .catch ( () => idbKeyval.set("currentMyContextsVersion", "0.22.0") );
        }
        else 
        {
          // No previous installation, just initialize to the version we're installing.
          idbKeyval.set("currentMyContextsVersion", myContextsVersion);
        }
      })
    // No previous installation, just initialize to the version we're installing.
    .catch( () => idbKeyval.set("currentMyContextsVersion", myContextsVersion))
}

export function getInstalledVersion()
{
  return idbKeyval.get("currentMyContextsVersion");
}

////////////////////////////////////////////////////////////////////////////////////
////    ACTUAL UPGRADES
////////////////////////////////////////////////////////////////////////////////////

export function fixUser(perspectivesUsersId)
{
  return getUser(perspectivesUsersId)
    .then( user => 
      {
        user.perspectivesUser = perspectivesUsersId + "_KeyHolder";
        return putUser( user );
      })
}
