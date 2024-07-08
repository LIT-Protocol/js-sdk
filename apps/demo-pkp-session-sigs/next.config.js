const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.plugins = [
      ...config.plugins,
      new NodePolyfillPlugin(),
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    ];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "url": require.resolve("url/"),
      "path": require.resolve("path-browserify"),
    };

    return config;
  }
}

module.exports = nextConfig;
