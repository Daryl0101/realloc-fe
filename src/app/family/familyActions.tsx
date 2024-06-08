import { IconButton } from "@mui/material";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { deleteFamilyAPICall } from "../../apiCall/family/deleteFamilyAPICall";
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
};

type FamilyItem = {
  id: string;
  sequence: number | null;
  family_no: string;
  name: string;
  last_received_date: string | null;
  is_halal: boolean;
};

type Props = {
  params: GridRenderCellParams<FamilyItem, any, any, GridTreeNodeWithRender>;
  pageState: { status: Status; action: Action; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action;
      status: Status;
      id: string | null;
    }>
  >;
  searchFamily: () => void;
};

const FamilyActions = ({
  params,
  pageState,
  setPageState,
  searchFamily,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const deleteFamily = async () => {
    setPageState((prevState) => ({ ...prevState, status: Status.LOADING }));
    const result = await deleteFamilyAPICall(params.row.id);
    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      searchFamily();
    } else if (result.error) {
      if (typeof result.error === "string")
        enqueueSnackbar(result.error, { variant: "error" });
      else {
        result.error.forEach((error) => {
          enqueueSnackbar(error, { variant: "error" });
        });
      }
    }

    setPageState((prevState) => ({ ...prevState, status: Status.OPEN }));
  };

  const handleViewFamily = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.VIEW,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleEditFamily = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setPageState({
      action: Action.EDIT,
      status: Status.OPEN,
      id: params.row.id,
    });
  };
  const handleDeleteFamily = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    deleteFamily();
  };

  const buttons: ButtonProps[] = [
    {
      label: "view-family",
      color: "default",
      icon: <VisibilityIcon />,
      onClick: handleViewFamily,
    },
    {
      label: "edit-family",
      color: "info",
      icon: <EditIcon />,
      onClick: handleEditFamily,
    },
    {
      label: "delete-family",
      color: "error",
      icon: <DeleteIcon />,
      onClick: handleDeleteFamily,
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

export default FamilyActions;
