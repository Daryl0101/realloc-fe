// References for custom colors https://mui.com/material-ui/customization/palette/
"use client";
import type {} from "@mui/lab/themeAugmentation";
import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f50b5",
      // light: "#757ce8",
      // dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff3d00",
      // light: "#ff7961",
      // dark: "#ba000d",
      contrastText: "#fff",
    },
    mode: "dark",
  },
  components: {
    MuiTimeline: {
      styleOverrides: {
        root: {
          backgroundColor: "red",
        },
      },
    },
  },
});

export default theme;
