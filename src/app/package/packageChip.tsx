import { AllocationStatus, PackageStatus } from "@/src/lib/utils";
import { Chip, ChipProps } from "@mui/material";
import React from "react";

const PackageChip = ({
  status,
  props,
}: {
  status: PackageStatus;
  props?: ChipProps;
}) => {
  var chipColor: "primary" | "info" | "success" | "error" = "success";
  var chipVariant: "outlined" | "filled" = "filled";
  switch (status) {
    case PackageStatus.NEW:
      break;
    case PackageStatus.PACKED:
      chipColor = "info";
      break;
    case PackageStatus.DELIVERED:
      chipColor = "primary";
      break;
    case PackageStatus.CANCELLED:
      chipColor = "error";
      break;
  }
  return (
    <Chip
      label={status}
      variant={chipVariant}
      color={chipColor}
      {...props}
      sx={{ fontWeight: "bold" }}
    />
  );
};

export default PackageChip;
