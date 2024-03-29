import { AllocationStatus } from "@/src/lib/utils";
import { Chip, ChipProps } from "@mui/material";
import React from "react";

const AllocationChip = ({
  status,
  props,
}: {
  status: AllocationStatus;
  props?: ChipProps;
}) => {
  var chipColor: "primary" | "warning" | "success" | "error" = "primary";
  var chipVariant: "outlined" | "filled" = "outlined";
  switch (status) {
    case AllocationStatus.CREATED:
      break;
    case AllocationStatus.ONGOING:
      chipColor = "warning";
      chipVariant = "filled";
      break;
    case AllocationStatus.SUCCESS:
      chipColor = "success";
      chipVariant = "filled";
      break;
    case AllocationStatus.FAILED:
      chipColor = "error";
      chipVariant = "filled";
      break;
    case AllocationStatus.COMPLETED:
      chipColor = "primary";
      chipVariant = "filled";
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

export default AllocationChip;
