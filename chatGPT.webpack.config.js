const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = function()
  {
    return {
      entry: path.join(__dirname, "chatgpt", "plchatgpt.js"),
      output: {
          filename: 'plchatgpt.js',
          path: path.resolve(__dirname, "development")
        },
      watch: false,
      mode: "development",
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
                  presets: ['@babel/preset-env', "@babel/preset-react"],
                  plugins: [
                    '@babel/plugin-proposal-object-rest-spread',
                    '@babel/plugin-syntax-dynamic-import'
                  ]
                }
              }
            ]
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          },
          {
            test: /\.txt/,
            type: 'asset/source'
          }
        ]
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { context: path.resolve(__dirname, "node_modules/perspectives-react/dist")
            , from: "src_lang_*", to: path.resolve(__dirname, "development") },
          ],
        })
      ]
    };
};
