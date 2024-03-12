import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { SxProps, Theme, createTheme } from "@mui/material";

import React from "react";

const sx: SxProps<Theme> = {
  animation: "fade-accordingly 1.5s infinite",
  "@keyframes fade-accordingly": {
    "0%": {
      opacity: 0.5,
    },
    "50%": {
      opacity: 1,
    },
    "100%": {
      opacity: 0.5,
    },
  },
};

const AnimatedArrowRightIcon = () => {
  return (
    <>
      <KeyboardArrowRightIcon sx={sx} />
      <KeyboardArrowRightIcon sx={{ ...sx, animationDelay: "0.25s" }} />
      <KeyboardArrowRightIcon sx={{ ...sx, animationDelay: "0.5s" }} />
    </>
  );
};

export default AnimatedArrowRightIcon;
