module.exports = {
  expo: {
    name: "Flick",
    slug: "flick",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.flick.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.flick.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-notifications"
    ],
    scheme: "flick",
    extra: {
      eas: {
        projectId: "flick-app-1234-5678-9012-3456"
      }
    }
  }
}; 