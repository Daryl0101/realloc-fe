import {
  Action,
  DropdownItem,
  Gender,
  HalalStatus,
  Status,
  inputDateFormat,
  parseDateStringToFormattedDate,
  parseDateTimeStringToFormattedDateTime,
} from "@/src/lib/utils";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type ProductParams = {
  id: number;
  productNo: string;
  productName: string;
  description: string;
  servingSize: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
  halalStatus: HalalStatus;
  categories: FoodCategory[];
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type StorageParams = {
  id: number;
  storageNo: string;
  description: string;
  halalStatus: HalalStatus;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type Params = {
  inventoryNo: string;
  expirationDate: string;
  receivedDate: string;
  totalQty: string;
  availableQty: string;
  numOfServing: string;
  product: ProductParams;
  storage: StorageParams;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
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

var productParamsDefaultState: ProductParams = {
  id: 0,
  productNo: "",
  productName: "",
  description: "",
  servingSize: "",
  calorie: "",
  carbohydrate: "",
  protein: "",
  fat: "",
  fiber: "",
  sugar: "",
  saturatedFat: "",
  cholesterol: "",
  sodium: "",
  halalStatus: HalalStatus["Non Halal"],
  categories: [],
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

var storageParamsDefaultState: StorageParams = {
  id: 0,
  storageNo: "",
  description: "",
  halalStatus: HalalStatus["Non Halal"],
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

var inventoryParamsDefaultState: Params = {
  inventoryNo: "",
  // expirationDate: dayjs().add(1, "day").format(),
  // receivedDate: dayjs().format(),
  expirationDate: "",
  receivedDate: "",
  totalQty: "",
  availableQty: "",
  numOfServing: "",
  product: productParamsDefaultState,
  storage: storageParamsDefaultState,
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

const ViewInventoryDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  searchInventory,
  enqueueSnackbar,
}: Props) => {
  const [inventoryParamsState, setInventoryParamsState] =
    React.useState<Params>(inventoryParamsDefaultState);
  const [autocompleteFieldStatus, setAutocompleteFieldStatus] =
    React.useState<Status>(Status.OPEN);

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
      inventoryParamsDefaultState = {
        ...result,
        availableQty: result.availableQty.toString(),
        totalQty: result.totalQty.toString(),
        numOfServing: result.numOfServing.toString(),
      };
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

  const handleDialogClose = () => {
    if ([Action.VIEW, Action.EDIT].includes(pageState.action)) {
      productParamsDefaultState = {
        id: 0,
        productNo: "",
        productName: "",
        description: "",
        servingSize: "",
        calorie: "",
        carbohydrate: "",
        protein: "",
        fat: "",
        fiber: "",
        sugar: "",
        saturatedFat: "",
        cholesterol: "",
        sodium: "",
        halalStatus: HalalStatus["Non Halal"],
        categories: [],
        modifiedAt: "",
        modifiedBy: "",
        createdAt: "",
        createdBy: "",
      };

      storageParamsDefaultState = {
        id: 0,
        storageNo: "",
        description: "",
        halalStatus: HalalStatus["Non Halal"],
        modifiedAt: "",
        modifiedBy: "",
        createdAt: "",
        createdBy: "",
      };

      inventoryParamsDefaultState = {
        inventoryNo: "",
        // expirationDate: dayjs().add(1, "day").format(),
        // receivedDate: dayjs().format(),
        expirationDate: "",
        receivedDate: "",
        totalQty: "",
        availableQty: "",
        numOfServing: "",
        product: productParamsDefaultState,
        storage: storageParamsDefaultState,
        modifiedAt: "",
        modifiedBy: "",
        createdAt: "",
        createdBy: "",
      };
      handleResetDialog();
    }

    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
  };

  const handleResetDialog = () => {
    setInventoryParamsState(inventoryParamsDefaultState);
  };

  useEffect(() => {
    if (pageState.action === Action.VIEW && pageState.status === Status.OPEN) {
      handleResetDialog();
      retrieveInventory();
    }
  }, [pageState.id]);

  return (
    <Dialog
      open={
        pageState.action === Action.VIEW &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      // PaperProps={{
      //   component: "form",
      //   onSubmit: onSubmit,
      // }}
    >
      <DialogTitle>
        {inventoryParamsState.inventoryNo
          ? inventoryParamsState.inventoryNo
          : "Loading..."}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          <Grid item xs={12}>
            <DialogContentText>Inventory Details</DialogContentText>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="expirationDate"
              variant="outlined"
              label="Expiration Date"
              value={
                inventoryParamsState.expirationDate !== ""
                  ? parseDateStringToFormattedDate(
                      inventoryParamsState.expirationDate
                    )
                  : ""
              }
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="receivedDate"
              variant="outlined"
              label="Received Date"
              value={
                inventoryParamsState.receivedDate !== ""
                  ? parseDateStringToFormattedDate(
                      inventoryParamsState.receivedDate
                    )
                  : ""
              }
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="totalQty"
              variant="outlined"
              type="number"
              label="Total Quantity"
              value={inventoryParamsState.totalQty}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="availableQty"
              variant="outlined"
              type="number"
              label="Available Quantity"
              value={inventoryParamsState.availableQty}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="numOfServing"
              variant="outlined"
              type="number"
              label="Number of Serving(s)"
              value={parseFloat(inventoryParamsState.numOfServing).toFixed(2)}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider></Divider>
          </Grid>
          <Grid item xs={12}>
            <DialogContentText>Product Information</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {inventoryParamsState.product.productNo}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* <Typography variant="body2">Product Details</Typography> */}
                    <DialogContentText>Product Details</DialogContentText>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="productName"
                      variant="outlined"
                      label="Product Name"
                      value={inventoryParamsState.product.productName}
                      fullWidth
                      required
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      variant="outlined"
                      value={inventoryParamsState.product.description}
                      multiline
                      rows={4}
                      label="Description"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      readOnly={pageState.action === Action.VIEW}
                      id="categories-select-field"
                      multiple
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      options={[]}
                      value={inventoryParamsState.product.categories}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Categories"
                          placeholder="Search"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {autocompleteFieldStatus === Status.LOADING ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => {
                        return (
                          <Tooltip
                            key={`${option.name}-tooltip`}
                            title={option.description}
                            placement="top-start"
                          >
                            <li {...props} key={option.name}>
                              {option.name}
                            </li>
                          </Tooltip>
                        );
                      }}
                      renderTags={(tagValue, getTagProps) => {
                        return tagValue.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.name}
                            label={option.name}
                          />
                        ));
                      }}
                      disabled={
                        pageState.status === Status.LOADING ||
                        pageState.action === Action.EDIT
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      aria-label="halalStatus"
                      fullWidth
                      value={inventoryParamsState.product.halalStatus}
                      disabled
                    >
                      {[HalalStatus.Halal, HalalStatus["Non Halal"]].map(
                        (value) => {
                          return (
                            <ToggleButton
                              key={HalalStatus[value]}
                              value={value}
                            >
                              {HalalStatus[value]}
                            </ToggleButton>
                          );
                        }
                      )}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider></Divider>
                  </Grid>
                  <Grid item xs={12}>
                    <DialogContentText>
                      Nutritional Information
                    </DialogContentText>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="servingSize"
                      variant="outlined"
                      label="Serving Size"
                      value={inventoryParamsState.product.servingSize}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="calorie"
                      variant="outlined"
                      label="Calorie"
                      value={inventoryParamsState.product.calorie}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="carbohydrate"
                      variant="outlined"
                      label="Carbohydrate"
                      value={inventoryParamsState.product.carbohydrate}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="protein"
                      variant="outlined"
                      label="Protein"
                      value={inventoryParamsState.product.protein}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="fat"
                      variant="outlined"
                      label="Fat"
                      value={inventoryParamsState.product.fat}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="sugar"
                      variant="outlined"
                      label="Sugar"
                      value={inventoryParamsState.product.sugar}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="fiber"
                      variant="outlined"
                      label="Fiber"
                      value={inventoryParamsState.product.fiber}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      name="saturatedFat"
                      variant="outlined"
                      label="Saturated Fat"
                      value={inventoryParamsState.product.saturatedFat}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="cholesterol"
                      variant="outlined"
                      label="Cholesterol"
                      value={inventoryParamsState.product.cholesterol}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="sodium"
                      variant="outlined"
                      label="Sodium"
                      value={inventoryParamsState.product.sodium}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Divider></Divider>
          </Grid>
          <Grid item xs={12}>
            <DialogContentText>Storage Information</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {inventoryParamsState.storage.storageNo}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* <Typography variant="body2">Product Details</Typography> */}
                    <DialogContentText>Storage Details</DialogContentText>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      variant="outlined"
                      value={inventoryParamsState.storage.description}
                      multiline
                      rows={4}
                      label="Description"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      aria-label="halalStatus"
                      fullWidth
                      value={inventoryParamsState.storage.halalStatus}
                      disabled
                    >
                      {[HalalStatus.Halal, HalalStatus["Non Halal"]].map(
                        (value) => {
                          return (
                            <ToggleButton
                              key={HalalStatus[value]}
                              value={value}
                            >
                              {HalalStatus[value]}
                            </ToggleButton>
                          );
                        }
                      )}
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Divider></Divider>
          </Grid>
          <Grid item xs={12}>
            <DialogContentText>Metadata Information</DialogContentText>
          </Grid>
          {[
            {
              key: "modifiedAt",
              label: "Modified At",
              value: inventoryParamsState.modifiedAt,
            },
            {
              key: "createdAt",
              label: "Created At",
              value: inventoryParamsState.createdAt,
            },
            {
              key: "modifiedBy",
              label: "Modified By",
              value: inventoryParamsState.modifiedBy,
            },
            {
              key: "createdBy",
              label: "Created By",
              value: inventoryParamsState.createdBy,
            },
          ].map((field) => {
            return (
              <Grid key={field.key} item xs={6}>
                <TextField
                  disabled
                  label={field.label}
                  value={
                    ["modifiedAt", "createdAt"].includes(field.key)
                      ? field.value !== ""
                        ? parseDateTimeStringToFormattedDateTime(field.value)
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
      </DialogActions>
    </Dialog>
  );
};

export default ViewInventoryDialog;
