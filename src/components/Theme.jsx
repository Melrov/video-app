import React from "react";
import { ThemeProvider } from "styled-components";

const theme = {
  colors: {
    primary: "#1b1e1f",
    primaryLight: "#1d2325",
    secondary: "#0d0e10",
    secondaryLight: "#32363d",
    accent: "#2DE1FC",
  },
  text: {
    main: "#fffaaa",
    primary: "#ffffff",
    secondary: "#ababab",
    accent: "#2DE1FC",
    accentDark: "#2fc6dc",
  },
  fonts: ["sans-serif", "Roboto"],
  fontSizes: {
    small: "1em",
    medium: "2em",
    large: "3em",
  },
};

const Theme = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

export default Theme;
