import {
  Action,
  PackageStatus,
  parseDateStringToFormattedDate,
  parseDateTimeStringToFormattedDateTime,
  Role,
  Status,
} from "@/src/lib/utils";
import React, { useEffect } from "react";
import { retrievePackageAPICall } from "../../apiCall/package/retrievePackageAPICall";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import PackageChip from "./packageChip";
import dayjs from "dayjs";
import { ColorlibStepIcon } from "@/src/components/stepper/colorLib";
import theme from "@/src/lib/theme";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import { packPackageAPICall } from "../../apiCall/package/packPackageAPICall";
import { deliverPackageAPICall } from "../../apiCall/package/deliverPackageAPICall";
import { cancelPackageAPICall } from "../../apiCall/package/cancelPackageAPICall";

type Props = {
  pageState: { status: Status; action: Action; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action;
      status: Status;
      id: string | null;
    }>
  >;
  enqueueSnackbar: (message: string, options: any) => void;
  setRowSelectionModel: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  webSocketCallRefresh: string[];
  userRole: Role;
};

type PackageHistoryItemResponseField = {
  id: string;
  action: PackageStatus;
  cancelReason: string;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type ProductResponseField = {
  id: string;
  productNo: string;
  name: string;
  description: string;
  isHalal: boolean;
};

type StorageResponseField = {
  id: string;
  storageNo: string;
  description: string;
  isHalal: boolean;
};

type InventoryResponseField = {
  id: string;
  inventoryNo: string;
  product: ProductResponseField;
  storage: StorageResponseField;
  expirationDate: string;
  receivedDate: string;
  totalQty: number;
  availableQty: number;
};

type PackageItemResponseField = {
  id: string;
  inventory: InventoryResponseField;
  quantity: number;
};

type PackageResponse = {
  packageNo: string;
  packageItems: PackageItemResponseField[];
  packageHistories: PackageHistoryItemResponseField[];
  allocationNo: string;
  familyNo: string;
  status: PackageStatus | null;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

const packageResponseDefaultState = {
  packageNo: "loading...",
  packageItems: [],
  packageHistories: [],
  allocationNo: "",
  familyNo: "",
  status: null,
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

const PackageDetailCard = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
  setRowSelectionModel,
  webSocketCallRefresh,
  userRole,
}: Props) => {
  const [packageResponseState, setPackageResponseState] =
    React.useState<PackageResponse>(packageResponseDefaultState);
  const [packageItemsRowSelectionModel, setPackageItemsRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [dialogOpenState, setDialogOpenState] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState<string>("");
  const screenSizeMatch = useMediaQuery(theme.breakpoints.up("sm"));

  const retrievePackage = async () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.EDIT,
      status: Status.LOADING,
    }));
    const result = await retrievePackageAPICall(pageState.id);

    setPageState((prevState) => ({
      ...prevState,
      action: Action.NONE,
      status: Status.OPEN,
    }));

    if ("packageNo" in result) {
      enqueueSnackbar(`Package ${result.packageNo} retrieved successfully`, {
        variant: "success",
      });
      setPackageResponseState(result);
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

  const processPackage = async (processType: "pack" | "deliver" | "cancel") => {
    setPageState((prevState) => ({ ...prevState, status: Status.LOADING }));
    var result = null;
    switch (processType) {
      case "pack":
        result = await packPackageAPICall(pageState.id);
        break;
      case "deliver":
        result = await deliverPackageAPICall(pageState.id);
        break;
      case "cancel":
        if (!cancelReason) {
          result = { error: "Cancel Reason is required" };
          break;
        }
        result = await cancelPackageAPICall(pageState.id, cancelReason);
        break;
    }

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

    setPageState((prevState) => ({ ...prevState, status: Status.OPEN }));
  };

  const handleCancelDialogSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cancelReason = (event.target as any).cancelReason.value;
    await processPackage("cancel");
  };

  const handleDialogClose = () => {
    setDialogOpenState(false);
    setCancelReason("");
  };

  const columns: GridColDef<PackageItemResponseField>[] = [
    {
      field: "product_no",
      headerName: "Product No",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.inventory.product.productNo,
    },
    {
      field: "product_name",
      headerName: "Product Name",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.inventory.product.name,
    },
    {
      field: "storage_no",
      headerName: "Storage No",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.inventory.storage.storageNo,
    },
    {
      field: "qty",
      headerName: "Quantity",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.quantity,
    },
    {
      field: "inventory_no",
      headerName: "Inventory No",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.inventory.inventoryNo,
    },
    {
      field: "expiration_date",
      headerName: "Expiration Date",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) =>
        parseDateStringToFormattedDate(params.row.inventory.expirationDate),
    },
  ];

  useEffect(() => {
    setPackageResponseState(packageResponseDefaultState);
    setPackageItemsRowSelectionModel([]);
    if (!!pageState.id) retrievePackage();
  }, [pageState.id]);

  useEffect(() => {
    if (
      pageState.id !== null &&
      Array.isArray(webSocketCallRefresh) &&
      webSocketCallRefresh.map((item) => item.toString()).includes(pageState.id)
    ) {
      handleDialogClose();
      retrievePackage();
    }
  }, [webSocketCallRefresh]);

  return (
    <Card
      sx={{
        height: "85vh",
        my: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Dialog
        open={dialogOpenState}
        onClose={handleDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: handleCancelDialogSubmit,
        }}
      >
        <DialogTitle>Cancel Reason</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <DialogContentText mb={1}>
            Please provide a reason for cancellation
          </DialogContentText>
          <TextField
            autoFocus
            id="cancelReason"
            label="Cancel Reason"
            type="text"
            fullWidth
            required
            onChange={(event) => setCancelReason(event.target.value)}
            value={cancelReason}
            error={!cancelReason.trim()}
            helperText={!cancelReason.trim() ? "Cancel Reason is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={
              pageState.action === Action.EDIT &&
              pageState.status === Status.LOADING
            }
            variant="contained"
            type="submit"
            color="error"
            disabled={
              (pageState.action === Action.EDIT &&
                pageState.status === Status.LOADING) ||
              !cancelReason.trim()
            }
          >
            <span>Confirm</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <CardHeader
        title={
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">
                {packageResponseState.packageNo}
              </Typography>
              {packageResponseState.status !== null ? (
                <PackageChip
                  status={packageResponseState.status}
                  props={{
                    size: "small",
                  }}
                />
              ) : null}
            </Stack>
            <IconButton onClick={() => setRowSelectionModel([])}>
              <CloseIcon sx={{ cursor: "pointer" }} />
            </IconButton>
          </Stack>
        }
      />
      <CardContent sx={{ overflow: "auto" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8} order={{ xs: 2, sm: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DialogContentText>Package Information</DialogContentText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip arrow title={packageResponseState.familyNo}>
                  <TextField
                    fullWidth
                    label="Family No"
                    value={packageResponseState.familyNo}
                    inputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip arrow title={packageResponseState.allocationNo}>
                  <TextField
                    fullWidth
                    label="Allocation No"
                    value={packageResponseState.allocationNo}
                    inputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <DialogContentText>Package Items</DialogContentText>
              </Grid>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    height: "450px",
                    mt: 1,
                  }}
                >
                  <DataGrid
                    getRowId={(row) => row.id.toString()}
                    slots={{
                      noRowsOverlay: CustomNoRowsOverlay,
                      loadingOverlay: LinearProgress,
                      toolbar: GridToolbar,
                    }}
                    sx={{
                      p: 1,
                    }}
                    checkboxSelection={
                      packageResponseState.status === PackageStatus.NEW
                    }
                    rowSelectionModel={packageItemsRowSelectionModel}
                    onRowSelectionModelChange={(newSelection) => {
                      setPackageItemsRowSelectionModel(newSelection);
                    }}
                    rows={packageResponseState.packageItems}
                    columns={columns}
                    loading={
                      pageState.action === Action.EDIT &&
                      pageState.status === Status.LOADING
                    }
                    autoPageSize
                    initialState={{
                      columns: {
                        columnVisibilityModel: {
                          product_name: false,
                          inventory_no: false,
                          expiration_date: false,
                        },
                      },
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <DialogContentText>Metadata Information</DialogContentText>
              </Grid>
              {[
                {
                  key: "modifiedAt",
                  label: "Modified At",
                  value: packageResponseState.modifiedAt,
                },
                {
                  key: "createdAt",
                  label: "Created At",
                  value: packageResponseState.createdAt,
                },
                {
                  key: "modifiedBy",
                  label: "Modified By",
                  value: packageResponseState.modifiedBy,
                },
                {
                  key: "createdBy",
                  label: "Created By",
                  value: packageResponseState.createdBy,
                },
              ].map((field) => {
                return (
                  <Grid key={field.key} item xs={12} sm={6}>
                    <TextField
                      disabled
                      label={field.label}
                      value={
                        ["modifiedAt", "createdAt"].includes(field.key)
                          ? field.value !== ""
                            ? parseDateTimeStringToFormattedDateTime(
                                field.value
                              )
                            : ""
                          : field.value
                      }
                      name={field.key}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4} order={{ xs: 1, sm: 2 }}>
            <Stack direction="column" spacing={1}>
              <DialogContentText>Timeline</DialogContentText>
              <Stepper
                activeStep={0}
                orientation={screenSizeMatch ? "vertical" : "horizontal"}
                alternativeLabel={!screenSizeMatch}
              >
                {packageResponseState.packageHistories
                  .toSorted(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((history) => (
                    <Step key={history.action}>
                      <StepLabel
                        StepIconComponent={(props) =>
                          ColorlibStepIcon({
                            packageStatus: history.action,
                            props: props,
                          })
                        }
                        optional={
                          <Stack>
                            <Typography variant="caption">
                              {parseDateTimeStringToFormattedDateTime(
                                history.createdAt
                              )}
                            </Typography>
                            <Typography variant="caption">
                              {history.createdBy}
                            </Typography>
                            {history.action === PackageStatus.CANCELLED ? (
                              <Box display="flex" gap={1} alignItems="bottom">
                                <Typography
                                  variant="caption"
                                  fontStyle="oblique"
                                >
                                  Cancel Reason
                                </Typography>
                                <Tooltip title={history.cancelReason}>
                                  <InfoOutlinedIcon sx={{ fontSize: "16px" }} />
                                </Tooltip>
                              </Box>
                            ) : null}
                          </Stack>
                        }
                      >
                        {history.action}
                      </StepLabel>
                    </Step>
                  ))}
              </Stepper>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        {userRole === Role.manager &&
        !!packageResponseState.status &&
        [PackageStatus.NEW, PackageStatus.PACKED].includes(
          packageResponseState.status
        ) ? (
          <Tooltip
            title={
              packageResponseState.status === PackageStatus.NEW &&
              packageResponseState.packageItems
                .map((item) => item.id.toString())
                .filter((item) => packageItemsRowSelectionModel.includes(item))
                .length > 0
                ? "Put all items back and deselect them before cancelling package"
                : "Cancel Package"
            }
          >
            <Box>
              <LoadingButton
                loading={
                  pageState.action === Action.EDIT &&
                  pageState.status === Status.LOADING
                }
                variant="contained"
                color="error"
                onClick={() => setDialogOpenState(true)}
                disabled={
                  (pageState.action === Action.EDIT &&
                    pageState.status === Status.LOADING) ||
                  (packageResponseState.status === PackageStatus.NEW &&
                    packageResponseState.packageItems
                      .map((item) => item.id.toString())
                      .filter((item) =>
                        packageItemsRowSelectionModel.includes(item)
                      ).length > 0)
                }
              >
                Cancel Package
              </LoadingButton>
            </Box>
          </Tooltip>
        ) : null}
        {!!packageResponseState.status &&
        packageResponseState.status === PackageStatus.NEW ? (
          <Tooltip
            title={
              packageResponseState.packageItems
                .map((item) => item.id.toString())
                .filter((item) => !packageItemsRowSelectionModel.includes(item))
                .length > 0
                ? "Check all items before complete packing"
                : "Complete packing"
            }
          >
            <Box>
              <LoadingButton
                loading={
                  pageState.action === Action.EDIT &&
                  pageState.status === Status.LOADING
                }
                variant="contained"
                color="primary"
                onClick={() => processPackage("pack")}
                disabled={
                  (pageState.action === Action.EDIT &&
                    pageState.status === Status.LOADING) ||
                  packageResponseState.packageItems
                    .map((item) => item.id.toString())
                    .filter(
                      (item) => !packageItemsRowSelectionModel.includes(item)
                    ).length > 0
                }
              >
                Complete Packing
              </LoadingButton>
            </Box>
          </Tooltip>
        ) : null}
        {!!packageResponseState.status &&
        packageResponseState.status === PackageStatus.PACKED ? (
          <LoadingButton
            loading={
              pageState.action === Action.EDIT &&
              pageState.status === Status.LOADING
            }
            variant="contained"
            color="primary"
            onClick={() => processPackage("deliver")}
            disabled={
              pageState.action === Action.EDIT &&
              pageState.status === Status.LOADING
            }
          >
            Complete Delivery
          </LoadingButton>
        ) : null}
      </CardActions>
    </Card>
  );
};

export default PackageDetailCard;
