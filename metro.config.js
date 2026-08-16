// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  tslib: require.resolve('tslib'),
};

defaultConfig.transformer.unstable_allowRequireContext = true;
defaultConfig.transformer.unstable_enablePackageExports = true;

// Add support for .cjs (used in some Firebase packages)
defaultConfig.resolver.sourceExts.push('cjs');

// Enable modern package exports resolution
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
