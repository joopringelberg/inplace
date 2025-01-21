const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
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
      new CleanWebpackPlugin(), // Add this line to clean the target directory before each build
      new CopyPlugin({
        patterns: [
          { context: path.resolve(__dirname, "node_modules/perspectives-react/dist"), from: "src_lang_*", to: path.resolve(__dirname, target) },
          {
            from: path.resolve(__dirname, "node_modules/perspectives-core/dist/*.*"),
            to: ({ context, absoluteFilename }) => {
              return path.join(__dirname, target, path.basename(absoluteFilename));
            }
          },
          // Add a pattern to copy the files index.html, file.png, manage.html,favicon.png, models.html, and the directory AppImages to the target directory.
          {
            from: path.resolve(__dirname, "src/index.html"),
            to: path.resolve(__dirname, target)
          },
          {
            from: path.resolve(__dirname, "src/file.png"),
            to: path.resolve(__dirname, target)
          },
          {
            from: path.resolve(__dirname, "src/manage.html"),
            to: path.resolve(__dirname, target)
          },
          {
            from: path.resolve(__dirname, "src/favicon.png"),
            to: path.resolve(__dirname, target)
          },
          {
            from: path.resolve(__dirname, "src/AppImages"),
            to: path.resolve(__dirname, target, "AppImages")
          },
          {
            from: path.resolve(__dirname, "src/models.html"),
            to: path.resolve(__dirname, target )
          },
          {
            from: path.resolve(__dirname, "node_modules/perspectives-pageworker/dist/perspectives-pageworker.js"),
            to: path.resolve(__dirname, target)
          },
          {
            from: path.resolve(__dirname, "node_modules/perspectives-sharedworker/dist/perspectives-sharedworker.js"),
            to: path.resolve(__dirname, target)
          }
        ],
      }),
      new WebpackShellPluginNext({
        onBuildEnd: {
          scripts: [
            // this script generates the manifest and copies it to the target directory.
            `node ./src/generateManifest.js` + " " + target,
            // run the postWebpack.sh shell script. It copies the generated files to the remote target directory.
            `./rebuildRemoteTarget.sh --target ${target}`
          ],
          blocking: true,
          parallel: false
        }
      }),
      new webpack.DefinePlugin({
        __MyContextsversionNumber__: JSON.stringify(require("./package.json").version),
        __BUILD__: require("./build.json").build,
        __REPOSITORYURL__: "'https://perspectives.domains/models_perspectives_domains/'",
        __STARTPAGE__: "'pub:https://perspectives.domains/cw_j4qovsczpm/#bxjprzq9q6$External'"
      })
    ],
    externals: {
      "perspectives-core": {
        commonjs: "perspectives-core",
        commonjs2: "perspectives-core",
        amd: "perspectives-core",
        root: "perspectives-core"
      }
    }
  };
};
