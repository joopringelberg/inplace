const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = function(env) {
  const { target, mode } = env;
  return {
    entry: {
      "index": path.join(__dirname, "src/index.js"),
      "models": path.join(__dirname, "src/models.js"),
      "manage": path.join(__dirname, "src/manage.js"),
      "perspectives-serviceworker": path.join(__dirname, "src/perspectives-serviceworker.js"),
      "perspectives-pagedispatcher": path.join(__dirname, "src/perspectives-pagedispatcher.js")
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, target)
    },
    watch: false,
    mode: mode,
    target: "web",
    devtool: "source-map",
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
                presets: ['@babel/preset-env', '@babel/preset-react'],
                sourceMaps: true
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader']
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { context: path.resolve(__dirname, "node_modules/perspectives-react/dist"), from: "*.js", to: path.resolve(__dirname, target) },
          { context: path.resolve(__dirname, "node_modules/perspectives-react/dist"), from: "*.map", to: path.resolve(__dirname, target) },
          { context: path.resolve(__dirname, "node_modules/perspectives-react/dist"), from: "src_lang_*", to: path.resolve(__dirname, target) },
          {
            from: path.resolve(__dirname, "node_modules/perspectives-core/dist/*.*"),
            to: ({ context, absoluteFilename }) => {
              return path.join(__dirname, target, path.basename(absoluteFilename));
            }
          }
        ],
      }),
      new webpack.DefinePlugin({
        __MyContextsversionNumber__: JSON.stringify(require("./package.json").version),
        __BUILD__: require("./build.json").build,
        __REPOSITORYURL__: "'https://perspectives.domains/models_perspectives_domains/'",
        __STARTPAGE__: "'pub:https://perspectives.domains/cw_j4qovsczpm/#bxjprzq9q6$External'"
      })
    ]
  };
};
