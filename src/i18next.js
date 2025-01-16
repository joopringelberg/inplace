// See: https://phrase.com/blog/posts/step-step-guide-javascript-localization/

// We need http-backend to load the translations from the server.

import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import {getPreact} from "perspectives-react";
import LanguageDetector from 'i18next-browser-languagedetector';

export async function initI18next ()
{

  return i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
      supportedLngs: ["en", "nl"],
      // Enabled useful console output when developing
      debug: true,
      // Disable loading of dev locale
      fallbackLng: false,
      ns: []
      })
    .then( () => {
      const LANG_KEY = i18next.language;
      Promise.all([
        import(`./lang/${LANG_KEY}/mycontexts.json`).then( t => i18next.addResourceBundle(LANG_KEY, "mycontexts", t)),
        getPreact(LANG_KEY).then( t => i18next.addResourceBundle(LANG_KEY, "preact", t))
      ])
      .then( () => i18next.loadNamespaces(["mycontexts", "preact"]))
      .then( () => i18next)
    })
    ;
}