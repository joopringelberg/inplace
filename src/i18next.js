// See: https://phrase.com/blog/posts/step-step-guide-javascript-localization/

// We need http-backend to load the translations from the server.

import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import {getPreact} from "perspectives-react";
import LanguageDetector from 'i18next-browser-languagedetector';
const idbKeyval = require('idb-keyval')

export async function initI18next ()
{
  const idbDetector = {
    name: 'idbDetector',
  
    async lookup(options) {
      // options -> are passed in options
      const result = await idbKeyval.get("currentLanguage");
      return result;
    },
  
    cacheUserLanguage(lng, options) {
      // options -> are passed in options
      // lng -> current language, will be called after init and on changeLanguage
      idbKeyval.set("currentLanguage", lng);
    }
  };

  const languageDetector = new LanguageDetector();
  languageDetector.addDetector(idbDetector);

  i18next.on('languageChanged', () => {
    const LANG_KEY = i18next.language;
    // Save in IDB. This setting is leading for the PDR, too.
    idbKeyval.set("currentLanguage", LANG_KEY);
    Promise.all([
      import(`./lang/${LANG_KEY}/mycontexts.json`).then( t => i18next.addResourceBundle(LANG_KEY, "mycontexts", t)),
      getPreact(LANG_KEY).then( t => i18next.addResourceBundle(LANG_KEY, "preact", t))
    ])
    .then( () => i18next.loadNamespaces(["mycontexts", "preact"]))
    .then( () => i18next)
});

  return i18next
    .use(HttpApi)
    .use(languageDetector)
    .init({
      supportedLngs: ["en", "nl"],
      // Enabled useful console output when developing
      debug: true,
      // Disable loading of dev locale
      fallbackLng: false,
      ns: [],
      detection: {
        // Detection options
        order: ["idbDetector", "navigator"], // Use custom detector first
        caches: ["idbDetector"], // Cache detected language using custom detector
      }
      })
    ;
}

