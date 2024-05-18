"use client";
import { Box, Grid } from "@mui/material";
import React from "react";

const HomeInternal = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box display="flex" width="100%" height="40vw">
          <iframe
            title="fyp-dashboard"
            width="100%"
            height="100%"
            src="https://app.powerbi.com/reportEmbed?reportId=ecb9569c-c1be-4277-99e0-ed489918abcc&autoAuth=true&ctid=0ad0fbf8-69ca-4e5e-afad-cd70424ac626&pageName=ReportSectionf4b2434989b967d3a718&navContentPaneEnabled=false"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </Box>
      </Grid>
      <Grid item container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box display="flex" width="100%" height="40vw">
            <iframe
              title="fyp-dashboard"
              width="100%"
              height="100%"
              src="https://app.powerbi.com/reportEmbed?reportId=ecb9569c-c1be-4277-99e0-ed489918abcc&autoAuth=true&ctid=0ad0fbf8-69ca-4e5e-afad-cd70424ac626&pageName=866852f657c1146609b6&navContentPaneEnabled=false"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" width="100%" height="40vw">
            <iframe
              title="fyp-dashboard"
              width="100%"
              height="100%"
              src="https://app.powerbi.com/reportEmbed?reportId=ecb9569c-c1be-4277-99e0-ed489918abcc&autoAuth=true&ctid=0ad0fbf8-69ca-4e5e-afad-cd70424ac626&pageName=14d0a08e59790061509c&navContentPaneEnabled=false"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomeInternal;
