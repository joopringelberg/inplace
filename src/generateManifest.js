
const fs = require('node:fs');

// See: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons#create_the_necessary_icon_sizes
const macIcons = ["512.png", "256.png", "128.png", "32.png", "16.png"].map( 
  function(icon) 
  {
    const size = icon.replace(".png", "");
    return {
      "src": "/appimages/ios/" + icon,
      "sizes": size + "x" + size,
      "type": "image/png"
      }
  });

// TODO: windows, Android.

const manifest = {
  "name": "MyContexts",
  "icons": macIcons,
  "start_url": "../index.html",
  "display": "minimal-ui"
}

fs.writeFile('./perspectives.webmanifest', JSON.stringify(manifest), err => {
  if (err) {
    console.error(err);
  }
  console.log("Manifest written.")
});