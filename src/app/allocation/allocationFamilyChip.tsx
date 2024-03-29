import theme from "@/src/lib/theme";
import { AllocationFamilyStatus } from "@/src/lib/utils";
import { Chip, ChipProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

const AllocationFamilyChip = ({
  status,
  props,
}: {
  status: AllocationFamilyStatus;
  props?: ChipProps;
}) => {
  var chipColor: "default" | "warning" | "success" | "error" = "warning";
  var chipVariant: "outlined" | "filled" = "filled";
  var statusDescription: AllocationFamilyStatus | string = status;
  switch (status) {
    case AllocationFamilyStatus.PENDING:
      break;
    case AllocationFamilyStatus.SERVED:
      chipColor = "success";
      chipVariant = "outlined";
      break;
    case AllocationFamilyStatus.ACCEPTED:
      chipColor = "success";
      chipVariant = "filled";
      break;
    case AllocationFamilyStatus.REJECTED:
      chipColor = "error";
      chipVariant = "filled";
      break;
    case AllocationFamilyStatus.NOT_SERVED:
      statusDescription = "NOT SERVED";
      chipColor = "default";
      chipVariant = "outlined";
      break;
  }
  return (
    <Chip
      label={statusDescription}
      variant={chipVariant}
      color={chipColor}
      {...props}
      sx={{
        fontWeight: "bold",
        color: chipColor === "default" ? grey[500] : null,
        borderColor: chipColor === "default" ? grey[500] : null,
      }}
    />
  );
};

export default AllocationFamilyChip;
