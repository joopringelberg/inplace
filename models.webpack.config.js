const path = require("path");
const webpack = require('webpack'); //to access built-in plugins

module.exports = function(env)
  {
    const {repo, target} = env;
    return {
      entry:
        {"models": path.join(__dirname, "src/models.js")
      },
      output: {
          filename: '[name].js',
          path: path.resolve(__dirname, target)
        },
      watch: false,
      mode: "development",
      target: "web",
      resolve: {
        alias: {
          "react": path.resolve(__dirname, "node_modules/react"),
          "@primer/octicons-react": path.resolve(__dirname, "node_modules/@primer/octicons-react"),
          "react-bootstrap": path.resolve(__dirname, "node_modules/react-bootstrap")
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
        new webpack.DefinePlugin(
          {
            //eslint-disable-next-line no-undef
            REPOSITORYURL: JSON.stringify( repo )
          }
        )
      ]
    };
};
