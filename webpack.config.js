const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: ["./src/app/app.js", "./css/city_tour.css"],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
        ],
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({terserOptions: { compress: true, mangle: true }, exclude: "lib/"}),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "city_tour.html" },
        { from: "lib/*.js" },
        { from: "textures/*.png" },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "city_tour.css",
    }),
  ],
  output: {
    filename: "city_tour.js",
    path: path.resolve(__dirname, "./dist"),
  }
};
