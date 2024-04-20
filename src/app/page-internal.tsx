"use client";
import { Box } from "@mui/material";
import React from "react";

const HomeInternal = () => {
  return (
    <Box display="flex" width="100%" height="85vh">
      <iframe
        title="fyp-dashboard"
        width="100%"
        height="100%"
        src="https://app.powerbi.com/reportEmbed?reportId=ecb9569c-c1be-4277-99e0-ed489918abcc&autoAuth=true&ctid=0ad0fbf8-69ca-4e5e-afad-cd70424ac626&pageName=&navContentPaneEnabled=false"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </Box>
  );
};

export default HomeInternal;
