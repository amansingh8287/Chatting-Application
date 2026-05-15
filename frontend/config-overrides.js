module.exports = function override(config) {
  config.resolve.fallback = {
    process: require.resolve("process/browser"),
    stream: require.resolve("stream-browserify"),
  };
  return config;
};