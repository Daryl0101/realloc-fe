import { IconButton } from "@mui/material";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { deleteProductAPICall } from "../../apiCall/product/deleteProductAPICall";
import { Action, Status } from "@/src/lib/utils";

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
};

type ProductItem = {
  id: string;
  sequence: number | null;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

type Props = {
  params: GridRenderCellParams<ProductItem, any, any, GridTreeNodeWithRender>;
  pageState: { status: Status; action: Action | "INBOUND"; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action | "INBOUND";
      status: Status;
      id: string | null;
    }>
  >;
  searchProduct: () => void;
  enqueueSnackbar: (message: string, options?: any) => void;
};

const ProductActions = ({
  params,
  pageState,
  setPageState,
  searchProduct,
  enqueueSnackbar,
}: Props) => {
  const deleteProduct = async () => {
    setPageState((prevState) => ({ ...prevState, status: Status.LOADING }));
    const result = await deleteProductAPICall(params.row.id);
    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
    } else if (result.error) {
      if (typeof result.error === "string")
        enqueueSnackbar(result.error, { variant: "error" });
      else {
        result.error.forEach((error) => {
          enqueueSnackbar(error, { variant: "error" });
        });
      }
    }
    searchProduct();

    setPageState((prevState) => ({ ...prevState, status: Status.OPEN }));
  };

  const handleViewProduct = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.VIEW,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleEditProduct = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.EDIT,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleDeleteProduct = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    deleteProduct();
  };

  const buttons: ButtonProps[] = [
    {
      label: "view-product",
      color: "default",
      icon: <VisibilityIcon />,
      onClick: handleViewProduct,
    },
    {
      label: "edit-product",
      color: "info",
      icon: <EditIcon />,
      onClick: handleEditProduct,
    },
    {
      label: "delete-product",
      color: "error",
      icon: <DeleteIcon />,
      onClick: handleDeleteProduct,
    },
  ];
  return (
    <>
      {buttons.map((button) => {
        return (
          <IconButton
            key={button.label}
            aria-label={button.label}
            color={button.color}
            onClick={button.onClick}
            disabled={pageState.status === Status.LOADING}
          >
            {button.icon}
          </IconButton>
        );
      })}
    </>
  );
};

export default ProductActions;
