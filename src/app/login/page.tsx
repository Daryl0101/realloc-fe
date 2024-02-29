import React from "react";
import LoginForm from "./loginForm";
import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { signIn } from "next-auth/react";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

const LoginPage = async () => {
  const session = await getServerSession(options);
  if (session) {
    redirect("/");
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      bgcolor="background.default"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h3" align="center" color="primary" pb={2}>
          Realloc
        </Typography>
        <Divider />
        <Typography variant="h5" align="center" pt={2}>
          Welcome
        </Typography>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;
