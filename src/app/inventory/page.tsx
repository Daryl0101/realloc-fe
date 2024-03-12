"use client";
import generateSequentialNos, {
  HalalStatus,
  Status,
  PaginationResponse,
  paginationResponseDefaultState,
  PaginationRequest,
  paginationRequestDefaultState,
  SortOrder,
  Action,
  parseDateStringToFormattedDate,
} from "@/src/lib/utils";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
// import InventoryDialog from "./inventoryDialog";
import InventoryActions from "./inventoryActions";
import { LoadingButton } from "@mui/lab";
import { searchInventoryAPICall } from "../apiCall/inventory/searchInventoryAPICall";
import CustomDateRangePicker from "@/src/components/dateRangePicker";
import AnimatedArrowRightIcon from "@/src/components/animatedArrowRightIcon";
import AdjustInventoryDialog from "./adjustInventoryDialog";
import ViewInventoryDialog from "./viewInventoryDialog";

type SearchParams = {
  inventoryNo: string;
  productNo: string;
  productName: string;
  storageNo: string;
  storageDescription: string;
  expirationDateStart: string | null;
  expirationDateEnd: string | null;
  receivedDateStart: string | null;
  receivedDateEnd: string | null;
  halalStatus: HalalStatus;
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

const searchParamsDefaultState: SearchParams = {
  inventoryNo: "",
  productNo: "",
  productName: "",
  storageNo: "",
  storageDescription: "",
  expirationDateStart: null,
  expirationDateEnd: null,
  receivedDateStart: null,
  receivedDateEnd: null,
  halalStatus: HalalStatus.All,
};

const Inventory = () => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>(paginationRequestDefaultState);
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    InventoryItem[]
  >([]);
  const [pageState, setPageState] = React.useState<{
    action: Action;
    status: Status;
    id: string | null;
  }>({ action: Action.NONE, status: Status.CLOSED, id: null });
  const { enqueueSnackbar } = useSnackbar();

  const searchInventory = async () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.SEARCH,
      status: Status.LOADING,
    }));

    const result = await searchInventoryAPICall(
      searchParamsState,
      paginationRequestState
    );
    if ("total_page" in result) {
      setPaginationResponseState(() => ({
        ...result,
        items: null,
      }));
      setSearchResultState(
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

    setPageState((prevState) => ({
      ...prevState,
      action: Action.NONE,
      status: Status.OPEN,
    }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSearchParamsState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setSearchParamsState(searchParamsDefaultState);
  };

  const handleInventorySearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await searchInventory();
  };

  //#region Inbound New Inventory
  const handleInboundNewInventoryDialogOpen = () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.ADD,
      status: Status.OPEN,
    }));
  };

  //#endregion

  const columns: readonly GridColDef<InventoryItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "inventory_no",
      headerName: "Inventory No",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "product_no",
      headerName: "Product No",
      valueGetter: (params) => params.row.product.product_no,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "product_name",
      headerName: "Product Name",
      valueGetter: (params) => params.row.product.name,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "storage_no",
      headerName: "Storage No",
      valueGetter: (params) => params.row.storage.storage_no,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "expiration_date",
      headerName: "Expiration Date",
      flex: 1,
      minWidth: 150,
      renderCell(params) {
        return (
          <Typography variant="body2">
            {parseDateStringToFormattedDate(params.row.expiration_date)}
          </Typography>
        );
      },
    },
    {
      field: "received_date",
      headerName: "Received Date",
      flex: 1,
      minWidth: 150,
      renderCell(params) {
        return (
          <Typography variant="body2">
            {parseDateStringToFormattedDate(params.row.received_date)}
          </Typography>
        );
      },
    },
    {
      field: "total_qty",
      headerName: "Total Quantity",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "available_qty",
      headerName: "Available Quantity",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "is_halal",
      headerName: "Halal",
      minWidth: 150,
      flex: 1,
      type: "boolean",
      valueGetter: (params) => params.row.product.is_halal,
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params) => {
        return (
          <InventoryActions
            params={params}
            pageState={pageState}
            setPageState={setPageState}
            searchInventory={searchInventory}
            enqueueSnackbar={enqueueSnackbar}
          />
        );
      },
    },
  ];

  useEffect(() => {
    searchInventory();
  }, [paginationRequestState]);

  return (
    <>
      {/* <InventoryDialog
        pageState={pageState}
        setPageState={setPageState}
        searchInventory={searchInventory}
        enqueueSnackbar={enqueueSnackbar}
      ></InventoryDialog> */}
      <AdjustInventoryDialog
        pageState={pageState}
        setPageState={setPageState}
        searchInventory={searchInventory}
        enqueueSnackbar={enqueueSnackbar}
      />
      <ViewInventoryDialog
        pageState={pageState}
        setPageState={setPageState}
        searchInventory={searchInventory}
        enqueueSnackbar={enqueueSnackbar}
      />
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" mb={2} justifySelf="flex-start">
          Live Inventory
        </Typography>
        {/* <Box justifySelf="flex-end">
          <LoadingButton
            variant="contained"
            onClick={handleInboundNewInventoryDialogOpen}
            loading={pageState.status === Status.LOADING}
          >
            <span>Inbound Inventory</span>
          </LoadingButton>
        </Box> */}
      </Box>
      <form onSubmit={handleInventorySearch}>
        <Paper elevation={3}>
          <Grid container columnSpacing={2} rowGap={2} p={2} columns={30}>
            <Grid item xs={30} sm={10} lg={6}>
              <TextField
                type="text"
                variant="outlined"
                label="Inventory No"
                name="inventoryNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.inventoryNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} sm={10} lg={6}>
              <TextField
                type="text"
                variant="outlined"
                label="Product No"
                fullWidth
                name="productNo"
                onChange={handleChange}
                value={searchParamsState.productNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} sm={10} lg={6}>
              <TextField
                type="text"
                variant="outlined"
                label="Product Name"
                fullWidth
                name="productName"
                onChange={handleChange}
                value={searchParamsState.productName}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} sm={15} lg={6}>
              <TextField
                type="text"
                variant="outlined"
                label="Storage No"
                fullWidth
                name="storageNo"
                onChange={handleChange}
                value={searchParamsState.storageNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} sm={15} lg={6}>
              <TextField
                type="text"
                variant="outlined"
                label="Storage Description"
                fullWidth
                name="storageDescription"
                onChange={handleChange}
                value={searchParamsState.storageDescription}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} md={15} xl={11}>
              <CustomDateRangePicker
                formLabel="Expiry Date"
                formName="expiryDate"
                dateStart={searchParamsState.expirationDateStart}
                dateEnd={searchParamsState.expirationDateEnd}
                onSetDate={(dateStart, dateEnd) => {
                  setSearchParamsState((prevState) => ({
                    ...prevState,
                    expirationDateStart: dateStart,
                    expirationDateEnd: dateEnd,
                  }));
                }}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} md={15} xl={11}>
              <CustomDateRangePicker
                formLabel="Received Date"
                formName="receivedDate"
                dateStart={searchParamsState.receivedDateStart}
                dateEnd={searchParamsState.receivedDateEnd}
                onSetDate={(dateStart, dateEnd) => {
                  setSearchParamsState((prevState) => ({
                    ...prevState,
                    receivedDateStart: dateStart,
                    receivedDateEnd: dateEnd,
                  }));
                }}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={30} xl={8}>
              <FormControl>
                <FormLabel id="halalStatus">Halal Status</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="halalStatus"
                  name="halalStatus"
                  onChange={handleChange}
                  value={searchParamsState.halalStatus}
                >
                  {
                    // Accessing keys of numeric enum in TypeScript (w/o reverse mapping)
                    // References https://stackoverflow.com/questions/48413651/is-there-a-simple-way-to-get-a-list-of-keys-numbers-from-enum-in-typescript#:~:text=Object.keys(enumObj).filter(key%20%3D%3E%20isNaN(Number(key)))
                    Object.keys(HalalStatus)
                      .filter((key) => isNaN(Number(key)))
                      .map((status, index) => (
                        <FormControlLabel
                          key={status}
                          value={index}
                          control={<Radio />}
                          label={status}
                          disabled={pageState.status === Status.LOADING}
                        />
                      ))
                  }
                </RadioGroup>
              </FormControl>
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
              type="submit"
              variant="contained"
              loading={pageState.status === Status.LOADING}
            >
              <span>Search</span>
            </LoadingButton>
          </Box>
        </Paper>
      </form>
      <Paper sx={{ width: "100%", my: 5, overflow: "hidden" }}>
        <DataGrid
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            loadingOverlay: LinearProgress,
            toolbar: GridToolbar,
          }}
          sx={{ p: 1 }}
          rows={searchResultState}
          columns={columns}
          loading={pageState.status === Status.LOADING}
          // initialState={{
          //   pagination: {
          //     paginationModel: {
          //       page: 0,
          //       pageSize: 10,
          //     },
          //   },
          // }}
          // disableRowSelectionOnClick
          autoHeight={true}
          pagination
          pageSizeOptions={[10, 20, 50, 100]}
          paginationMode="server"
          paginationModel={{
            page: paginationRequestState.page_no,
            pageSize: paginationRequestState.page_size,
          }}
          rowCount={paginationResponseState.total_record}
          sortingMode="server"
          onSortModelChange={React.useCallback((sortModel: GridSortModel) => {
            if (!!sortModel[0]?.field && !!sortModel[0]?.sort)
              setPaginationRequestState(() => {
                return {
                  ...paginationRequestState,
                  sort_column: !!sortModel[0].field ? sortModel[0].field : "",
                  sort_order: !!sortModel[0].sort
                    ? sortModel[0].sort === "asc"
                      ? SortOrder.ASC
                      : SortOrder.DESC
                    : SortOrder.DESC,
                };
              });
          }, [])}
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
    </>
  );
};

export default Inventory;
