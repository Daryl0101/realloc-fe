import React from "react";
import { CircularProgress, Typography, Box } from "@mui/material";

function Loading() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      bgcolor="background.default"
    >
      <Box textAlign="center">
        <CircularProgress color="primary" size={48} />
        <Typography variant="h6" color="textPrimary" mt={2}>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
}

export default Loading;
