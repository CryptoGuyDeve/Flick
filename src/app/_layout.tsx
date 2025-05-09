import { Slot } from "expo-router";

import { ThemeProvider, DarkTheme } from "@react-navigation/native";

const myTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "white",
  }
};

export default function RootLayout() {
  console.log("RootLayout rendered");
  return (
    <ThemeProvider value={myTheme}>
      <Slot />
    </ThemeProvider>
  );
}

