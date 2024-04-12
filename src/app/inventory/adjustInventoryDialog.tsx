import {
  Action,
  DropdownItem,
  Gender,
  HalalStatus,
  Status,
  inputDateFormat,
  parseDateTimeStringToFormattedDateTime,
} from "@/src/lib/utils";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { deleteInventoryAPICall } from "../../apiCall/inventory/deleteInventoryAPICall";
import { retrieveInventoryAPICall } from "../../apiCall/inventory/retrieveInventoryAPICall";
import { searchFoodCategoryAPICall } from "../../apiCall/sysref/searchFoodCategoryAPICall";
import { MuiTelInput } from "mui-tel-input";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { inboundNewInventoryAPICall } from "../../apiCall/inventory/inboundNewInventoryAPICall";
import { adjustInventoryAPICall } from "../../apiCall/inventory/adjustInventoryAPICall";
import AnimatedArrowRightIcon from "@/src/components/animatedArrowRightIcon";

type Params = {
  inventoryNo: string;
  originalQty: string;
  minQty: string;
  qty: string;
  reason: string;
};

type Props = {
  pageState: { status: Status; action: Action; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action;
      status: Status;
      id: string | null;
    }>
  >;
  searchInventory: () => void;
  enqueueSnackbar: (message: string, options: any) => void;
};

var paramsDefaultState: Params = {
  inventoryNo: "",
  originalQty: "",
  minQty: "",
  qty: "",
  reason: "",
};

const AdjustInventoryDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  searchInventory,
  enqueueSnackbar,
}: Props) => {
  const [inventoryParamsState, setInventoryParamsState] =
    React.useState<Params>(paramsDefaultState);

  const retrieveInventory = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveInventoryAPICall(pageState.id);

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("inventoryNo" in result) {
      enqueueSnackbar(
        `Inventory ${result.inventoryNo} retrieved successfully`,
        {
          variant: "success",
        }
      );
      paramsDefaultState = {
        ...paramsDefaultState,
        inventoryNo: result.inventoryNo,
        originalQty: result.totalQty.toString(),
        minQty: (result.totalQty - result.availableQty).toString(),
      };
      if (pageState.action === Action.DELETE)
        paramsDefaultState.qty = paramsDefaultState.minQty;
      handleResetDialog();
    } else if (result.error) {
      if (typeof result.error === "string")
        enqueueSnackbar(result.error, { variant: "error" });
      else {
        result.error.forEach((error) => {
          enqueueSnackbar(error, { variant: "error" });
        });
      }
    }
  };

  const inventoryAction = async (action: Action) => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = null;
    switch (action) {
      case Action.EDIT:
        result = await adjustInventoryAPICall({
          id: pageState.id,
          qty: inventoryParamsState.qty,
          reason: inventoryParamsState.reason,
        });
        break;
      case Action.DELETE:
        result = await deleteInventoryAPICall({
          id: pageState.id,
          reason: inventoryParamsState.reason,
        });
        break;
    }

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result === null) {
      enqueueSnackbar("No action found in inventory action", {
        variant: "success",
      });
      return;
    }

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleDialogClose();
      handleResetDialog();
      searchInventory();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleDialogClose = () => {
    paramsDefaultState = {
      inventoryNo: "",
      originalQty: "",
      minQty: "",
      qty: "",
      reason: "",
    };
    handleResetDialog();

    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
  };

  const handleResetDialog = () => {
    setInventoryParamsState(paramsDefaultState);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!e.target.value)
      setInventoryParamsState((prevState) => ({
        ...prevState,
        qty: parseInt(e.target.value).toString(),
      }));
    else
      setInventoryParamsState((prevState) => ({
        ...prevState,
        qty: "",
      }));
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      !isNaN(parseInt(e.target.value)) &&
      (parseInt(e.target.value) < parseInt(paramsDefaultState.minQty) ||
        parseInt(e.target.value) === parseInt(paramsDefaultState.originalQty))
    )
      setInventoryParamsState((prevState) => ({
        ...prevState,
        qty: "",
      }));
  };

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleEditInventory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await inventoryAction(Action.EDIT);
  };

  const handleDeleteInventory = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await inventoryAction(Action.DELETE);
  };

  useEffect(() => {
    if (
      [Action.EDIT, Action.DELETE].includes(pageState.action) &&
      pageState.status === Status.OPEN
    ) {
      handleResetDialog();
      retrieveInventory();
    }
  }, [pageState.id]);

  var dialogTitle = "";
  var onSubmit = null;

  switch (pageState.action) {
    case Action.EDIT:
      dialogTitle = inventoryParamsState.inventoryNo
        ? inventoryParamsState.inventoryNo
        : "Loading...";
      onSubmit = handleEditInventory;
      break;
    case Action.DELETE:
      dialogTitle = inventoryParamsState.inventoryNo
        ? inventoryParamsState.inventoryNo
        : "Loading...";
      onSubmit = handleDeleteInventory;
      break;
  }

  return (
    <Dialog
      open={
        [Action.EDIT, Action.DELETE].includes(pageState.action) &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: onSubmit,
      }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          <Grid item xs={12}>
            <DialogContentText>Adjustment Details</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <TextField
                  name="originalAvailableQty"
                  variant="outlined"
                  label="Current"
                  value={paramsDefaultState.originalQty}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid
                item
                xs={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <AnimatedArrowRightIcon />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  name="newAvailableQty"
                  variant="outlined"
                  label={
                    pageState.action === Action.EDIT
                      ? `Adjusted ${
                          parseInt(inventoryParamsState.originalQty) >
                          parseInt(paramsDefaultState.minQty)
                            ? `[${paramsDefaultState.minQty} - ${
                                parseInt(paramsDefaultState.originalQty) - 1
                              }] ,`
                            : null
                        } [${parseInt(paramsDefaultState.originalQty) + 1} - ∞]`
                      : "Adjusted"
                  }
                  value={inventoryParamsState.qty}
                  error={
                    parseInt(inventoryParamsState.qty) <
                      parseInt(paramsDefaultState.minQty) ||
                    parseInt(inventoryParamsState.qty) ===
                      parseInt(paramsDefaultState.originalQty)
                  }
                  type="number"
                  inputProps={{ step: 1 }}
                  fullWidth
                  required={pageState.action === Action.EDIT}
                  autoFocus
                  onFocus={handleFieldFocus}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  disabled={
                    pageState.status === Status.LOADING ||
                    pageState.action === Action.DELETE
                  }
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="reason"
              variant="outlined"
              label="Reason"
              value={inventoryParamsState.reason}
              autoFocus
              multiline
              rows={4}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              fullWidth
              required
              onChange={(e) =>
                setInventoryParamsState((prevState) => ({
                  ...prevState,
                  reason: e.target.value,
                }))
              }
              disabled={pageState.status === Status.LOADING}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="outlined"
          color="error"
          onClick={handleDialogClose}
          disabled={pageState.status === Status.LOADING}
        >
          <span>Cancel</span>
        </LoadingButton>
        {[Action.EDIT, Action.DELETE].includes(pageState.action) ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="outlined"
            onClick={handleResetDialog}
            disabled={pageState.status === Status.LOADING}
          >
            <span>Reset</span>
          </LoadingButton>
        ) : null}
        {pageState.action === Action.DELETE ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            color="error"
            type="submit"
            disabled={pageState.status === Status.LOADING}
          >
            <span>Delete</span>
          </LoadingButton>
        ) : null}
        {pageState.action === Action.EDIT ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            type="submit"
            disabled={pageState.status === Status.LOADING}
          >
            <span>Save</span>
          </LoadingButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default AdjustInventoryDialog;
