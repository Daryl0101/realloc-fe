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
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect } from "react";
import { searchProductAPICall } from "../../apiCall/product/searchProductAPICall";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import ProductDialog from "./productDialog";
import ProductActions from "./productActions";
import { LoadingButton } from "@mui/lab";
import InboundInventoryDialog from "./inboundInventoryDialog";

type SearchParams = {
  productNo: string;
  productNameOrDescription: string;
  halalStatus: HalalStatus;
};

type ProductItem = {
  id: string;
  sequence: number | null;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

const searchParamsDefaultState: SearchParams = {
  productNo: "",
  productNameOrDescription: "",
  halalStatus: HalalStatus.All,
};

const Product = () => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>(paginationRequestDefaultState);
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    ProductItem[]
  >([]);
  const [pageState, setPageState] = React.useState<{
    action: Action | "INBOUND";
    status: Status;
    id: string | null;
  }>({ action: Action.NONE, status: Status.CLOSED, id: null });
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const { enqueueSnackbar } = useSnackbar();

  const searchProduct = async () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.SEARCH,
      status: Status.LOADING,
    }));

    const result = await searchProductAPICall(
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

  const handleProductSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await searchProduct();
  };

  //#region Add New Product
  const handleAddNewProductDialogOpen = () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.ADD,
      status: Status.OPEN,
    }));
  };

  //#endregion

  const handleInboundInventoryDialogOpen = () => {
    setPageState((prevState) => ({
      ...prevState,
      action: "INBOUND",
      status: Status.OPEN,
    }));
  };

  const columns: readonly GridColDef<ProductItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "product_no",
      headerName: "Product No",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "name",
      headerName: "Name",
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
    {
      field: "action",
      headerName: "Action",
      width: 150,
      headerAlign: "center",
      align: "center",
      type: "actions",
      renderCell: (params) => {
        return (
          <ProductActions
            params={params}
            pageState={pageState}
            setPageState={setPageState}
            searchProduct={searchProduct}
            enqueueSnackbar={enqueueSnackbar}
          />
        );
      },
    },
  ];

  useEffect(() => {
    searchProduct();
  }, [paginationRequestState]);

  return (
    <>
      <InboundInventoryDialog
        pageState={pageState}
        setPageState={setPageState}
        productId={
          rowSelectionModel.length == 1 ? rowSelectionModel[0].toString() : ""
        }
        enqueueSnackbar={enqueueSnackbar}
      ></InboundInventoryDialog>
      <ProductDialog
        pageState={pageState}
        setPageState={setPageState}
        searchProduct={searchProduct}
        enqueueSnackbar={enqueueSnackbar}
      ></ProductDialog>
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" mb={2} mr={2} justifySelf="flex-start">
          Product
        </Typography>
        <Box display="flex" gap={2}>
          {/* <Grid container spacing={2} justifySelf="flex-end"> */}
          {/* <Grid item xs={6}> */}
          <Tooltip
            title={
              rowSelectionModel.length == 1
                ? "Start inbound"
                : rowSelectionModel.length > 1
                ? "Select only one product from the table below"
                : "Select a product from the table below to start inbound"
            }
            placement="top"
          >
            <Box>
              <LoadingButton
                variant="contained"
                onClick={handleInboundInventoryDialogOpen}
                loading={pageState.status === Status.LOADING}
                disabled={rowSelectionModel.length != 1}
              >
                <span>Inbound</span>
              </LoadingButton>
            </Box>
          </Tooltip>
          {/* </Grid> */}
          {/* <Grid item xs={6}> */}
          <Box>
            <LoadingButton
              variant="contained"
              onClick={handleAddNewProductDialogOpen}
              loading={pageState.status === Status.LOADING}
            >
              <span>Add New Product</span>
            </LoadingButton>
          </Box>
          {/* </Grid> */}
          {/* </Grid> */}
        </Box>
      </Box>
      <form onSubmit={handleProductSearch}>
        <Paper elevation={3}>
          <Box
            sx={{
              display: "flex",
              p: 2,
              flexWrap: "wrap",
              rowGap: 2,
              columnGap: 10,
              justifyContent: "flex-start",
            }}
          >
            <TextField
              type="text"
              variant="outlined"
              label="Product No"
              sx={{ width: { sm: 200, md: 300, lg: 400, xl: 500 } }}
              name="productNo"
              onChange={handleChange}
              value={searchParamsState.productNo}
              disabled={pageState.status === Status.LOADING}
            />
            <TextField
              type="text"
              variant="outlined"
              label="Product Name/Description"
              sx={{ width: { sm: 200, md: 300, lg: 400, xl: 500 } }}
              name="productNameOrDescription"
              onChange={handleChange}
              value={searchParamsState.productNameOrDescription}
              disabled={pageState.status === Status.LOADING}
            />
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
          </Box>
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
          sx={{
            p: 1, // disable cell selection style
            ".MuiDataGrid-cell:focus": {
              outline: "none",
            },
            // pointer cursor on ALL rows
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
          rows={searchResultState}
          columns={columns}
          loading={pageState.status === Status.LOADING}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(newSelection) => {
            setRowSelectionModel(newSelection);
          }}
          getRowId={(row) => row.id}
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

export default Product;
