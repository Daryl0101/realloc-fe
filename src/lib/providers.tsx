// Reference https://vercel.com/guides/react-context-state-management-nextjs
"use client";
import { IconButton, ThemeProvider } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
import theme from "./theme";
import { SnackbarProvider, useSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";

interface props {
  children: ReactNode;
}

// Reference https://github.com/iamhosseindhv/notistack/issues/60#issuecomment-1168521444
const CloseSnackbarAction = ({ id }: any) => {
  const { closeSnackbar } = useSnackbar();
  return (
    <IconButton
      style={{ marginTop: "0.1em" }}
      onClick={() => {
        closeSnackbar(id);
      }}
    >
      <CloseIcon />
    </IconButton>
  );
};

const Providers = ({ children }: props) => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        autoHideDuration={3000}
        action={(key) => <CloseSnackbarAction id={key} />}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <SessionProvider>{children}</SessionProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default Providers;
