// See: https://phrase.com/blog/posts/step-step-guide-javascript-localization/

import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import {getPreact} from "perspectives-react";

export async function initI18next (LANG_KEY)
{
  // Load namespace `mycontexts` in the required language
  const mycontextsTranslations = await import(`./lang/${LANG_KEY}/mycontexts.json`);
  // The chunks split off by Webpack for perspectives-react do not automatically end up in 
  // the output directory for mycontexts. We copy them using the copy-webpack-plugin.
  const preactTranslations = await getPreact(LANG_KEY)
  const resources = {};
  resources[LANG_KEY] = 
    { mycontexts: mycontextsTranslations
    , preact: preactTranslations
  }


  await i18next.use(HttpApi)
    .init({
      supportedLngs: ["en", "nl"],
      // The active locale
      lng: LANG_KEY,
      // Enabled useful console output when developing
      debug: true,
      // Disable loading of dev locale
      fallbackLng: false,
      resources
    });
}
