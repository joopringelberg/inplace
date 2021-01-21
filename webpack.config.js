const path = require("path");

const config = {
  entry:
    { "index": path.join(__dirname, "src/index.js" )
  },
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'docs')
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
        test: /\.crl$/,
        loader: 'ignore-loader'
      },
      {
        test: /\.html$/,
        loader: 'ignore-loader'
      },
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

module.exports = [config];
