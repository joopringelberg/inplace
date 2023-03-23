// See: https://phrase.com/blog/posts/step-step-guide-javascript-localization/

import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import {getPreact} from "perspectives-react";

export async function initI18next (LANG_KEY)
{
  // Load namespace `inplace` in the required language
  const inplaceTranslations = await import(`./lang/${LANG_KEY}/inplace.json`);
  // const preactTranslations = await import(`./lang/${LANG_KEY}/preact.json`);
  const preactTranslations = getPreact(LANG_KEY)
  const resources = {};
  resources[LANG_KEY] = 
    { inplace: inplaceTranslations
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
