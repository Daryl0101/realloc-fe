import { IconButton } from "@mui/material";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { Action, Status } from "@/src/lib/utils";
import { useSnackbar } from "notistack";

type ButtonProps = {
  label: string;
  color:
    | "default"
    | "info"
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | undefined;
  icon: JSX.Element;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled: boolean;
};

type ProductItem = {
  id: string;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

type StorageItem = {
  id: string;
  storage_no: string;
  description: string;
  is_halal: boolean;
};

type InventoryItem = {
  id: string;
  sequence: number | null;
  inventory_no: string;
  product: ProductItem;
  storage: StorageItem;
  expiration_date: string;
  received_date: string;
  total_qty: number;
  available_qty: number;
};

type Props = {
  params: GridRenderCellParams<InventoryItem, any, any, GridTreeNodeWithRender>;
  pageState: { status: Status; action: Action; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action;
      status: Status;
      id: string | null;
    }>
  >;
  searchInventory: () => void;
};

const InventoryActions = ({
  params,
  pageState,
  setPageState,
  searchInventory,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleViewInventory = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.VIEW,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleAdjustInventory = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.EDIT,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleDeleteInventory = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.DELETE,
      status: Status.OPEN,
      id: params.row.id,
    });
  };

  var buttons: ButtonProps[] = [
    {
      label: "view-inventory",
      color: "default",
      icon: <VisibilityIcon />,
      onClick: handleViewInventory,
      disabled: false,
    },
    {
      label: "adjust-inventory",
      color: "info",
      icon: <EditIcon />,
      onClick: handleAdjustInventory,
      disabled:
        // params.row.available_qty <= 0 ||
        // params.row.available_qty > params.row.total_qty,
        false,
    },
    {
      label: "delete-inventory",
      color: "error",
      icon: <DeleteIcon />,
      onClick: handleDeleteInventory,
      disabled:
        params.row.available_qty <= 0 ||
        params.row.available_qty !== params.row.total_qty,
    },
  ];

  if (
    params.row.total_qty < 0 ||
    params.row.available_qty < 0 ||
    params.row.available_qty > params.row.total_qty
  )
    enqueueSnackbar(
      `${params.row.inventory_no}: Error in this line, please inspect`,
      {
        variant: "error",
      }
    );

  return (
    <>
      {buttons.map((button) => {
        return (
          <IconButton
            key={button.label}
            aria-label={button.label}
            color={button.color}
            onClick={button.onClick}
            disabled={button.disabled || pageState.status === Status.LOADING}
          >
            {button.icon}
          </IconButton>
        );
      })}
    </>
  );
};

export default InventoryActions;
