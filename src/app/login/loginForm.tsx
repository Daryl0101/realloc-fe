"use client";
import React, { useRef, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Box, Button, Grid, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Status } from "../../lib/utils";
import { useSnackbar } from "notistack";

const LoginForm = () => {
  const [formSubmissionStatus, setFormSubmissionStatus] = useState<Status>(
    Status.OPEN
  );
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setFormSubmissionStatus(Status.LOADING);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    await signIn("credentials", {
      username: formJson.username,
      password: formJson.password,
      redirect: true,
      callbackUrl: "/",
    });
    setFormSubmissionStatus(Status.OPEN);

    const session = await getSession();
    if (!session) {
      enqueueSnackbar("Failed to login", {
        variant: "error",
      });
    } else {
      enqueueSnackbar("Logged in successfully", {
        variant: "success",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <TextField
        label="Username"
        name="username"
        variant="outlined"
        fullWidth
        margin="normal"
        defaultValue=""
        required
        disabled={formSubmissionStatus === Status.LOADING}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        name="password"
        fullWidth
        margin="normal"
        defaultValue=""
        required
        disabled={formSubmissionStatus === Status.LOADING}
        InputLabelProps={{ shrink: true }}
      />
      <LoadingButton
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        loading={formSubmissionStatus === Status.LOADING}
      >
        Login
      </LoadingButton>
    </form>
  );
};

export default LoginForm;
