const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = function(env)
  {
    const {target, mode} = env;
    return {
      entry:
        { "index": path.join(__dirname, "src/index.js" )
        , "models": path.join(__dirname, "src/models.js")
        , "manage": path.join(__dirname, "src/manage.js")
        , "perspectives-serviceworker": path.join(__dirname, "src/perspectives-serviceworker.js")
        , "perspectives-pagedispatcher": path.join(__dirname, "src/perspectives-pagedispatcher.js")
      },
      output: 
        { filename: '[name].js'
        , path: path.resolve(__dirname, target)
        },
      watch: false,
      mode: mode,
      target: "web",
      resolve: {
        alias: {
          "react": path.resolve(__dirname, "node_modules/react"),
          "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
          "@primer/octicons-react": path.resolve(__dirname, "node_modules/@primer/octicons-react"),
          "react-bootstrap": path.resolve(__dirname, "node_modules/react-bootstrap"),
          "perspectives-core": path.resolve(__dirname, "node_modules/perspectives-core"),
          "perspectives-pageworker": path.resolve(__dirname, "node_modules/perspectives-pageworker"),
          "pouchdb-browser": path.resolve(__dirname, "node_modules/pouchdb-browser"),
          "i18next": path.resolve(__dirname, "node_modules/i18next")
        }
      },
      module: {
        rules: [
          {
            test: /.jsx?$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: ['@babel/preset-env', "@babel/preset-react"]
                }
              }
            ]
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          }
        ]
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { context: path.resolve(__dirname, "node_modules/perspectives-react/dist")
            , from: "src_lang_*", to: path.resolve(__dirname, target) },
          ],
        }),
        new webpack.DefinePlugin({
          __MyContextsversionNumber__: JSON.stringify(require("./package.json").version),
          __BUILD__: require("./build.json").build,
          __REPOSITORYURL__: "'https://perspectives.domains/models_perspectives_domains/'",
          __STARTPAGE__: "'pub:https://perspectives.domains/cw_j4qovsczpm/#bxjprzq9q6$External'"
        })        
      ],
      externals: {
        // These are Affjax dependencies when running on node.
        "xhr2-cookies": {
          commonjs: "xhr2-cookies",
          commonjs2: "xhr2-cookies",
          amd: "xhr2-cookies",
          root: "xhr2-cookies"
        },
        "url": {
          commonjs: "url",
          commonjs2: "url",
          amd: "url",
          root: "url"
        }
      }
    };
};
