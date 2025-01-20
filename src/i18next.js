// See: https://phrase.com/blog/posts/step-step-guide-javascript-localization/

// We need http-backend to load the translations from the server.

import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import {getPreact} from "perspectives-react";
import LanguageDetector from 'i18next-browser-languagedetector';
const idbKeyval = require('idb-keyval')

export async function initI18next ()
{
  let currentLanguage = await idbKeyval.get("currentLanguage");

  i18next.on('initialized', () => {
    if (!currentLanguage)
    {
      idbKeyval.set("currentLanguage", i18next.language);
      currentLanguage = i18next.language;
    }
    loadLanguageResources(currentLanguage)
    .then( () => i18next.loadNamespaces(["mycontexts", "preact"]))
    .then( () => i18next)
    });

  return i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
      supportedLngs: ["en", "nl"],
      // Enabled useful console output when developing
      debug: true,
      // Disable loading of dev locale
      fallbackLng: false,
      ns: [],
      lng: currentLanguage
      })
    ;
}

export function loadLanguageResources (currentLanguage)
{
  return Promise.all([
    import(`./lang/${currentLanguage}/mycontexts.json`).then( t => i18next.addResourceBundle(currentLanguage, "mycontexts", t)),
    getPreact(currentLanguage).then( t => i18next.addResourceBundle(currentLanguage, "preact", t))
  ])
}