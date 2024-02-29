"use client";
import React from "react";
import { Typography, Button, Box } from "@mui/material";

function ErrorPage() {
  const onRetry = () => {
    window.location.reload();
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      bgcolor="background.default"
    >
      <Box textAlign="center">
        <Typography variant="h6" color="textPrimary">
          Oops! Something went wrong.
        </Typography>
        <Button variant="text" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    </Box>
  );
}

export default ErrorPage;
