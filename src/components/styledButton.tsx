// Create styled common component
// References https://stackoverflow.com/questions/64983425/material-ui-button-hover-background-color-and-text-color

import { Button, styled } from "@mui/material";

const StyledButton = styled(Button)(
  ({ theme, color = "primary", variant }) => ({
    ...(variant === "contained" && {
      ":default": {
        backgroundColor:
          color === "inherit"
            ? theme.palette.primary.main
            : theme.palette[color].main,
        color: "#fff",
      },
      ":hover": {
        backgroundColor:
          color === "inherit"
            ? theme.palette.primary.dark
            : theme.palette[color].dark,
        color: "#fff",
      },
    }),
  })
);

export default StyledButton;
