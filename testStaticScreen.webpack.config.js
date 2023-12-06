const path = require("path");

module.exports = function()
  {
    return {
      entry: {
        "testStaticScreen": path.join(__dirname, "src/testStaticScreen.js")
      },
      output: {
          filename: '[name].js',
          path: path.resolve(__dirname, "development")
        },
      watch: false,
      mode: "development",
      target: "web",
      resolve: {
        alias: {
          "react": path.resolve(__dirname, "node_modules/react"),
          "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
          "react-bootstrap": path.resolve(__dirname, "node_modules/react-bootstrap"),
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
          }
        ]
      }
    };
};
