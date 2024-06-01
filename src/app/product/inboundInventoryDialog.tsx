import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import generateSequentialNos, {
  Action,
  DropdownItem,
  Gender,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  SortOrder,
  Status,
  inputDateFormat,
  paginationRequestDefaultState,
  paginationResponseDefaultState,
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
  LinearProgress,
  Paper,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { inboundNewInventoryAPICall } from "../../apiCall/inventory/inboundNewInventoryAPICall";
import { adjustInventoryAPICall } from "../../apiCall/inventory/adjustInventoryAPICall";
import { retrieveProductAPICall } from "../../apiCall/product/retrieveProductAPICall";
import { searchStorageAPICall } from "../../apiCall/sysref/searchStorageAPICall";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import AssistantIcon from "@mui/icons-material/Assistant";
import { retrieveStorageAPICall } from "../../apiCall/sysref/retrieveStorageAPICall";
import { useSnackbar } from "notistack";

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
  expirationDate: string;
  receivedDate: string;
  totalQty: string;
  numOfServing: string;
  product: ProductParams;
  storage: StorageParams;
};

type SearchStorageParams = {
  storageNo: string;
  description: string;
};

type StorageItem = {
  id: string;
  sequence: number | null;
  storage_no: string;
  description: string;
  is_halal: boolean;
};

type Props = {
  pageState: { status: Status; action: Action | "INBOUND"; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action | "INBOUND";
      status: Status;
      id: string | null;
    }>
  >;
  productId: string;
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
  expirationDate: dayjs().add(1, "day").format(),
  receivedDate: dayjs().format(),
  totalQty: "1",
  numOfServing: "0.01",
  product: productParamsDefaultState,
  storage: storageParamsDefaultState,
};

var searchStorageParamsDefaultState: SearchStorageParams = {
  storageNo: "",
  description: "",
};

const InboundInventoryDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  productId: productId,
}: Props) => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>({
      ...paginationRequestDefaultState,
      page_size: 5,
    });
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [inventoryParamsState, setInventoryParamsState] =
    React.useState<Params>(inventoryParamsDefaultState);
  const [searchStorageParamsState, setSearchStorageParamsState] =
    React.useState<SearchStorageParams>(searchStorageParamsDefaultState);
  const [searchStorageResultState, setSearchStorageResultState] =
    React.useState<StorageItem[]>([]);
  const [autocompleteFieldStatus, setAutocompleteFieldStatus] =
    React.useState<Status>(Status.OPEN);
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [storageAccordionExpanded, setStorageAccordionExpanded] =
    React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const retrieveProduct = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveProductAPICall(productId);

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("productNo" in result) {
      enqueueSnackbar(`Product ${result.productNo} retrieved successfully`, {
        variant: "success",
      });
      productParamsDefaultState = { ...result, id: parseInt(productId) };
      inventoryParamsDefaultState = {
        ...inventoryParamsDefaultState,
        product: productParamsDefaultState,
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

  const retrieveStorage = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveStorageAPICall(
      rowSelectionModel[0].toString()
    );

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("storageNo" in result) {
      enqueueSnackbar(`Storage ${result.storageNo} retrieved successfully`, {
        variant: "success",
      });
      setInventoryParamsState((prevState) => {
        return {
          ...prevState,
          storage: { ...result, id: parseInt(rowSelectionModel[0].toString()) },
        };
      });
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

  const searchStorage = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchStorageAPICall(
      {
        ...searchStorageParamsState,
        excludeProductId: productId,
        halalStatus: inventoryParamsState.product.halalStatus,
      },
      paginationRequestState
    );

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("total_page" in result) {
      setPaginationResponseState(() => ({
        ...result,
        items: null,
      }));
      setSearchStorageResultState(
        generateSequentialNos(
          result.items,
          paginationRequestState.page_no * paginationRequestState.page_size + 1
        )
      );
      enqueueSnackbar("Search successful", { variant: "success" });
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSearchStorageParamsState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setSearchStorageParamsState(searchStorageParamsDefaultState);
  };

  const handleStorageSearch = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await searchStorage();
  };

  const inboundNewInventory = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = await inboundNewInventoryAPICall({
      productId: inventoryParamsState.product.id,
      storageId: inventoryParamsState.storage.id,
      expirationDate: inventoryParamsState.expirationDate,
      receivedDate: inventoryParamsState.receivedDate,
      totalQty: inventoryParamsState.totalQty,
      numOfServing: inventoryParamsState.numOfServing,
    });

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleDialogClose();
      handleResetDialog();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleDialogClose = () => {
    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
  };

  const handleResetDialog = () => {
    setInventoryParamsState(inventoryParamsDefaultState);
    setRowSelectionModel([]);
    setStorageAccordionExpanded(false);
    setSearchStorageParamsState(searchStorageParamsDefaultState);
    setPaginationRequestState({
      ...paginationRequestDefaultState,
      page_size: 5,
    });
    setPaginationResponseState(paginationResponseDefaultState);
    setSearchStorageResultState([]);
  };

  const handleInboundNewInventory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await inboundNewInventory();
  };

  useEffect(() => {
    if (
      productId !== "" &&
      pageState.action === "INBOUND" &&
      pageState.status === Status.OPEN
    ) {
      retrieveProduct();
      searchStorage();
    }
  }, [productId, pageState.action]);

  useEffect(() => {
    if (pageState.action === "INBOUND" && pageState.status === Status.OPEN)
      searchStorage();
  }, [paginationRequestState]);

  useEffect(() => {
    if (rowSelectionModel.length === 1) retrieveStorage();
    // else
    //   setInventoryParamsState((prevState) => {
    //     return {
    //       ...prevState,
    //       storage: storageParamsDefaultState,
    //     };
    //   });
  }, [rowSelectionModel]);

  const columns: readonly GridColDef<StorageItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "storage_no",
      headerName: "Storage No",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "is_halal",
      headerName: "Halal",
      minWidth: 150,
      flex: 1,
      type: "boolean",
    },
  ];

  return (
    <Dialog
      open={
        pageState.action === "INBOUND" &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: handleInboundNewInventory,
      }}
    >
      <DialogTitle>Inbound New Inventory</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          <Grid item xs={12}>
            <DialogContentText>Product Details</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <Accordion defaultExpanded={false}>
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
                      readOnly={true}
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
            {inventoryParamsState.storage.id <= 0 ? (
              <Stack direction="row" spacing={1}>
                <DialogContentText>
                  Select a Storage from the list below
                </DialogContentText>
                <AssistantIcon color="disabled" />
              </Stack>
            ) : (
              <DialogContentText>Storage Details</DialogContentText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box
              display={inventoryParamsState.storage.id <= 0 ? "block" : "none"}
            >
              {/* <form onSubmit={}> */}
              <Paper elevation={3}>
                <Grid container spacing={1} p={2}>
                  <Grid item xs={6}>
                    <TextField
                      type="text"
                      variant="outlined"
                      label="Storage No"
                      name="storageNo"
                      fullWidth
                      onChange={handleChange}
                      value={searchStorageParamsState.storageNo}
                      disabled={pageState.status === Status.LOADING}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      type="text"
                      variant="outlined"
                      label="Description"
                      name="description"
                      onChange={handleChange}
                      value={searchStorageParamsState.description}
                      disabled={pageState.status === Status.LOADING}
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: "flex",
                    px: 2,
                    pb: 2,
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <LoadingButton
                    variant="outlined"
                    loading={pageState.status === Status.LOADING}
                    onClick={handleReset}
                  >
                    <span>Reset</span>
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    loading={pageState.status === Status.LOADING}
                    onClick={handleStorageSearch}
                  >
                    <span>Search</span>
                  </LoadingButton>
                </Box>
              </Paper>
              {/* </form> */}
              <Paper sx={{ width: "100%", my: 5, overflow: "hidden" }}>
                <DataGrid
                  slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                    loadingOverlay: LinearProgress,
                    toolbar: GridToolbar,
                  }}
                  sx={{
                    p: 1,
                    width: "100%",
                    ".MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                    // pointer cursor on ALL rows
                    "& .MuiDataGrid-row:hover": {
                      cursor: "pointer",
                    },
                  }}
                  rows={searchStorageResultState}
                  columns={columns}
                  loading={pageState.status === Status.LOADING}
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={(newSelection) => {
                    setRowSelectionModel(newSelection);
                    setStorageAccordionExpanded(false);
                  }}
                  getRowId={(row) => row.id}
                  autoHeight
                  pagination
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  paginationMode="server"
                  paginationModel={{
                    page: paginationRequestState.page_no,
                    pageSize: paginationRequestState.page_size,
                  }}
                  rowCount={paginationResponseState.total_record}
                  sortingMode="server"
                  onSortModelChange={React.useCallback(
                    (sortModel: GridSortModel) => {
                      if (!!sortModel[0]?.field && !!sortModel[0]?.sort)
                        setPaginationRequestState(() => {
                          return {
                            ...paginationRequestState,
                            sort_column: !!sortModel[0].field
                              ? sortModel[0].field
                              : "",
                            sort_order: !!sortModel[0].sort
                              ? sortModel[0].sort === "asc"
                                ? SortOrder.ASC
                                : SortOrder.DESC
                              : SortOrder.DESC,
                          };
                        });
                    },
                    []
                  )}
                  onPaginationModelChange={(paginationModel) => {
                    setPaginationRequestState(() => {
                      return {
                        ...paginationRequestState,
                        page_no: paginationModel.page,
                        page_size: paginationModel.pageSize,
                      };
                    });
                  }}
                />
              </Paper>
            </Box>
            <Box
              display={inventoryParamsState.storage.id <= 0 ? "none" : "block"}
            >
              <Accordion expanded={storageAccordionExpanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  onClick={() =>
                    setStorageAccordionExpanded(!storageAccordionExpanded)
                  }
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box
                      justifySelf="flex-start"
                      display="flex"
                      alignItems="center"
                    >
                      {inventoryParamsState.storage.storageNo}
                    </Box>
                    <Box justifySelf="flex-end">
                      <IconButton
                        onClick={() => {
                          setInventoryParamsState((prevState) => {
                            return {
                              ...prevState,
                              storage: storageParamsDefaultState,
                            };
                          });
                          setRowSelectionModel([]);
                        }}
                      >
                        <DeleteOutlineIcon color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
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
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider></Divider>
          </Grid>
          <Grid item xs={12}>
            <DialogContentText>Inventory Details</DialogContentText>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="numOfServing"
              variant="outlined"
              label="Number of Serving"
              value={inventoryParamsState.numOfServing}
              error={parseFloat(inventoryParamsState.numOfServing) < 0.01}
              type="number"
              inputProps={{ step: 0.01 }}
              fullWidth
              required
              autoFocus
              autoComplete="off"
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setInventoryParamsState((prevState) => ({
                  ...prevState,
                  numOfServing: e.target.value,
                }));
              }}
              onBlur={(e) => {
                var value = parseFloat(e.target.value);
                if (!value || value < 0.01) value = 0.01;
                e.target.value = value.toFixed(2).toString();
                setInventoryParamsState((prevState) => ({
                  ...prevState,
                  numOfServing: e.target.value,
                }));
              }}
              disabled={pageState.status === Status.LOADING}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="totalQty"
              variant="outlined"
              label="Total Quantity"
              value={inventoryParamsState.totalQty}
              error={parseInt(inventoryParamsState.totalQty) < 1}
              type="number"
              inputProps={{ step: 1 }}
              fullWidth
              required
              autoComplete="off"
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setInventoryParamsState((prevState) => ({
                  ...prevState,
                  totalQty: e.target.value,
                }));
              }}
              onBlur={(e) => {
                var value = parseInt(e.target.value);
                if (!value || value < 1) value = 1;
                e.target.value = value.toString();
                setInventoryParamsState((prevState) => ({
                  ...prevState,
                  totalQty: e.target.value,
                }));
              }}
              disabled={pageState.status === Status.LOADING}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="Received Date"
              value={dayjs(inventoryParamsState.receivedDate)}
              format={inputDateFormat}
              onChange={(newValue) => {
                setInventoryParamsState((prevState) => {
                  return {
                    ...prevState,
                    receivedDate: newValue !== null ? newValue.format() : "",
                  };
                });
              }}
              slotProps={{
                field: {
                  onBlur: (e) => {
                    if (
                      !dayjs(inventoryParamsState.receivedDate).isValid() ||
                      dayjs(inventoryParamsState.receivedDate) > dayjs()
                    )
                      setInventoryParamsState((prevState) => ({
                        ...prevState,
                        receivedDate: dayjs().format(),
                      }));
                  },
                },
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
              maxDate={dayjs()}
              disabled={pageState.status === Status.LOADING}
            />
          </Grid>

          <Grid item xs={6}>
            <DatePicker
              label="Expiration Date"
              value={dayjs(inventoryParamsState.expirationDate)}
              format={inputDateFormat}
              onChange={(newValue) => {
                setInventoryParamsState((prevState) => {
                  return {
                    ...prevState,
                    expirationDate: newValue !== null ? newValue.format() : "",
                  };
                });
              }}
              slotProps={{
                field: {
                  onBlur: (e) => {
                    if (
                      !dayjs(inventoryParamsState.expirationDate).isValid() ||
                      dayjs(inventoryParamsState.expirationDate) <= dayjs()
                    )
                      setInventoryParamsState((prevState) => ({
                        ...prevState,
                        expirationDate: dayjs().add(1, "day").format(),
                      }));
                  },
                },
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
              minDate={dayjs().add(1, "day")}
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
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="outlined"
          onClick={handleResetDialog}
          disabled={pageState.status === Status.LOADING}
        >
          <span>Reset</span>
        </LoadingButton>
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="contained"
          type="submit"
          disabled={pageState.status === Status.LOADING}
        >
          <span>Add</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default InboundInventoryDialog;
