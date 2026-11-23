const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // включаем NativeWind
  return withNativeWind(config, { input: "./global.css" });
})();
