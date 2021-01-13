const path = require("path");

const config = {
  entry:
    { "index": path.join(__dirname, "src/index.js" )
  },
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'docs')
    },
  externals: { react: "commonjs2 react", "perspectives-proxy": "commonjs2 perspectives-proxy"},
  watch: false,
  mode: "development",
  target: "browserlist",
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
