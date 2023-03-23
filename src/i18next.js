import i18next from "i18next";
import HttpApi from "i18next-http-backend";

async function initI18next ()
{
  await i18next.use(HttpApi)
    .init({

      // The active locale

      lng: "en",

      // Enabled useful console output when developing

      debug: true,

      // Disable loading of dev locale
      fallbackLng: false,

      // Configure Http backend
      backend: {
        loadPath: "/lang/{{lng}}.json",
      }
    });
}

initI18next()

export {i18next}