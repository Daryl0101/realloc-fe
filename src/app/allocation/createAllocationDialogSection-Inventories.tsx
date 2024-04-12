import generateSequentialNos, {
  Action,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  SortOrder,
  Status,
  apiDateFormat,
  inputDateFormat,
  paginationRequestDefaultState,
  paginationResponseDefaultState,
  parseDateStringToFormattedDate,
} from "@/src/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { searchInventoryAPICall } from "../../apiCall/inventory/searchInventoryAPICall";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Container,
  DialogContentText,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Slide,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CustomDateRangePicker from "@/src/components/customDateRangePicker";
import { LoadingButton } from "@mui/lab";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import HelpIcon from "@mui/icons-material/Help";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";

type InventoryItem = {
  inventoryId: number;
  inventoryNo: string;
  quantity: number;
  maxQuantity: number;
  maxQuantityPerFamily: number;
};

type AllocationCreateRequest = {
  inventories: InventoryItem[];
  familyIds: number[];
  allocationDays: number;
  diversification: number;
};

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

type InventorySearchItem = {
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
  allocationCreateRequestState: AllocationCreateRequest;
  setAllocationCreateRequestState: React.Dispatch<
    React.SetStateAction<AllocationCreateRequest>
  >;
  isAbleToProceed: boolean;
  setIsAbleToProceed: React.Dispatch<React.SetStateAction<boolean>>;
  direction: "left" | "right";
  slideIn: boolean;
  container: HTMLElement | null;
};

const CreateAllocationInventoriesSection = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
  allocationCreateRequestState,
  setAllocationCreateRequestState,
  isAbleToProceed,
  setIsAbleToProceed,
  direction,
  slideIn,
  container,
}: Props) => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>({
      ...paginationRequestDefaultState,
      page_size: 5,
      sort_column: "expiration_date",
      sort_order: SortOrder.ASC,
    });
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    InventorySearchItem[]
  >([]);
  const [selectedRow, setSelectedRow] = React.useState<number | null>(null);
  const dataGridRef = useRef<HTMLDivElement>(null);
  const [dataGridHeight, setDataGridHeight] = useState(0);

  const searchInventory = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchInventoryAPICall(
      { ...searchParamsState, allowedForAllocationOnly: true },
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
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await searchInventory();
  };

  //#endregion

  const columns: readonly GridColDef<InventorySearchItem>[] = [
    {
      field: "inventory_no",
      headerName: "Inventory No",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "product_no",
      headerName: "Product No",
      valueGetter: (params) => params.row.product.product_no,
      flex: 1,
      minWidth: 130,
    },
    {
      field: "product_name",
      headerName: "Product Name",
      valueGetter: (params) => params.row.product.name,
      flex: 1,
      minWidth: 140,
    },
    {
      field: "expiration_date",
      headerName: "Expiration Date",
      flex: 1,
      minWidth: 160,
      renderCell(params) {
        return (
          <Tooltip
            title={parseDateStringToFormattedDate(params.row.expiration_date)}
          >
            <Typography variant="body2">
              {parseDateStringToFormattedDate(params.row.expiration_date)}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "received_date",
      headerName: "Received Date",
      flex: 1,
      minWidth: 160,
      renderCell(params) {
        return (
          <Tooltip
            title={parseDateStringToFormattedDate(params.row.received_date)}
          >
            <Typography variant="body2">
              {parseDateStringToFormattedDate(params.row.received_date)}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "available_qty",
      headerName: "Available Quantity",
      flex: 1,
      minWidth: 150,
      align: "center",
    },
    {
      field: "is_halal",
      headerName: "Halal",
      minWidth: 150,
      flex: 1,
      type: "boolean",
      valueGetter: (params) => params.row.product.is_halal,
    },
  ];

  useEffect(() => {
    setIsAbleToProceed(
      allocationCreateRequestState.inventories.length > 0 &&
        allocationCreateRequestState.inventories.every(
          (row) =>
            row.quantity > 0 &&
            row.quantity <= row.maxQuantity &&
            row.maxQuantityPerFamily > 0 &&
            row.maxQuantityPerFamily <= row.quantity
        )
    );
  }, [allocationCreateRequestState.inventories]);

  useEffect(() => {
    searchInventory();
  }, [paginationRequestState]);

  useEffect(() => {
    const handleResize = () => {
      if (dataGridRef.current) {
        setDataGridHeight(dataGridRef.current.clientHeight);
      }
    };

    // Initial height calculation
    handleResize();

    // Listen for changes in DataGrid height
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dataGridRef]);

  useEffect(() => {
    const element = document.getElementById(`table-row-${selectedRow}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [selectedRow]);

  return (
    <Slide
      direction={direction}
      in={slideIn}
      container={container}
      mountOnEnter
      unmountOnExit
    >
      <Box>
        <Paper elevation={3}>
          <Grid container columnSpacing={2} rowGap={2} p={2}>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} md={6} xl={4}>
              <CustomDateRangePicker
                formLabel="Expiry Date"
                formName="expiryDate"
                dateStart={searchParamsState.expirationDateStart}
                dateEnd={searchParamsState.expirationDateEnd}
                minDate={dayjs().add(1, "day")}
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
            <Grid item xs={12} md={6} xl={4}>
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
            <Grid item xs={12} xl={4}>
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
              // type="submit"
              variant="contained"
              loading={pageState.status === Status.LOADING}
              onClick={handleInventorySearch}
            >
              <span>Search</span>
            </LoadingButton>
          </Box>
        </Paper>
        <Grid container columnSpacing={1} rowGap={2} my={2} columns={20}>
          <Grid item xs={20} lg={15} sx={{ width: "100%", height: "100%" }}>
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <DataGrid
                ref={dataGridRef}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                  loadingOverlay: LinearProgress,
                  toolbar: () => (
                    <GridToolbarContainer>
                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarDensitySelector />
                    </GridToolbarContainer>
                  ),
                }}
                disableRowSelectionOnClick
                keepNonExistentRowsSelected // Prevents deselection of rows when page changes
                sx={{
                  p: 1,
                  ".MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  // pointer cursor on ALL rows
                  "& .MuiDataGrid-row:hover": {
                    cursor: "pointer",
                  },
                }}
                rows={searchResultState}
                checkboxSelection
                rowSelectionModel={allocationCreateRequestState.inventories.map(
                  (row) => row.inventoryId
                )}
                onRowSelectionModelChange={(newSelection) => {
                  const newSelectedRowsId = newSelection.filter(
                    (row) =>
                      !allocationCreateRequestState.inventories
                        .map((row) => row.inventoryId)
                        .includes(parseInt(row.toString()))
                  );
                  const newSelectedRows = searchResultState.filter((item) =>
                    newSelectedRowsId.includes(item.id)
                  );
                  const deselectedRows =
                    allocationCreateRequestState.inventories.filter(
                      (row) => !newSelection.includes(row.inventoryId)
                    );

                  if (newSelectedRows.length > 0) {
                    setAllocationCreateRequestState((prevState) => {
                      return {
                        ...prevState,
                        inventories: [
                          ...prevState.inventories,
                          ...newSelectedRows.map((row) => ({
                            inventoryId: parseInt(row.id.toString()),
                            inventoryNo: row.inventory_no,
                            quantity: row.available_qty,
                            maxQuantity: row.available_qty,
                            maxQuantityPerFamily:
                              row.available_qty < 5 ? row.available_qty : 5,
                          })),
                        ],
                      };
                    });
                    setSelectedRow(parseInt(newSelectedRows[0].id));
                  }

                  if (deselectedRows.length > 0) {
                    setAllocationCreateRequestState((prevState) => {
                      return {
                        ...prevState,
                        inventories: prevState.inventories.filter(
                          (item) =>
                            !deselectedRows
                              .map((row) => row.inventoryId)
                              .includes(item.inventoryId)
                        ),
                      };
                    });
                    setSelectedRow(null);
                  }
                }}
                getRowId={(row) => row.id}
                isRowSelectable={(params) => {
                  return (
                    params.row.available_qty > 0 &&
                    dayjs(params.row.expiration_date) > dayjs()
                  );
                }}
                columns={columns}
                loading={pageState.status === Status.LOADING}
                onRowClick={(params) => {
                  setSelectedRow(params.row.id);
                }}
                autoHeight={true}
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
                onStateChange={() =>
                  setDataGridHeight(
                    dataGridRef.current ? dataGridRef.current.clientHeight : 0
                  )
                }
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
          </Grid>
          <Grid
            item
            xs={20}
            lg={5}
            sx={{ width: "100%", height: 1, overflow: "auto" }}
          >
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                height: dataGridHeight,
                alignSelf: "flex-end",
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  {/* <TableRow>
                  <TableCell
                    align="center"
                    colSpan={3}
                    style={{ backgroundColor: "transparent" }}
                  >
                    <Typography variant="body1">Selected Inventory</Typography>
                  </TableCell>
                </TableRow> */}
                  <TableRow>
                    <TableCell>Inventory</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="right"
                        gap={1}
                      >
                        Quantity
                        <Tooltip title="Quantity of inventory to be allocated">
                          <HelpIcon
                            fontSize="small"
                            alignmentBaseline="middle"
                          />
                        </Tooltip>
                      </Stack>
                      {/* </Box> */}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="right"
                        gap={1}
                      >
                        Limit
                        <Tooltip title="Maximum quantity of inventory receivable per family ">
                          <HelpIcon fontSize="small" />
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocationCreateRequestState.inventories.length > 0 ? (
                    allocationCreateRequestState.inventories
                      .toSorted(
                        (item1, item2) => item1.inventoryId - item2.inventoryId
                      )
                      .map((row) => (
                        <TableRow
                          key={row.inventoryId}
                          id={`table-row-${row.inventoryId}`}
                          selected={selectedRow === row.inventoryId}
                        >
                          <TableCell component="th" scope="row">
                            {row.inventoryNo}
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              label="Quantity"
                              size="small"
                              type="number"
                              variant="outlined"
                              name="qty"
                              fullWidth
                              autoFocus={selectedRow === row.inventoryId}
                              onFocus={(event) => event.target.select()}
                              value={row.quantity}
                              disabled={pageState.status === Status.LOADING}
                              error={
                                row.quantity > row.maxQuantity ||
                                row.quantity <= 0
                              }
                              onChange={(event) => {
                                const value = parseInt(event.target.value);
                                if (isNaN(value)) return;
                                setAllocationCreateRequestState((prevState) => {
                                  return {
                                    ...prevState,
                                    inventories: prevState.inventories.map(
                                      (item) => {
                                        if (
                                          item.inventoryId === row.inventoryId
                                        ) {
                                          return {
                                            ...item,
                                            quantity: value,
                                          };
                                        }
                                        return item;
                                      }
                                    ),
                                  };
                                });
                              }}
                              onBlur={(event) => {
                                const value = parseInt(event.target.value);
                                if (
                                  isNaN(value) ||
                                  value > row.maxQuantity ||
                                  value <= 0
                                )
                                  setAllocationCreateRequestState(
                                    (prevState) => {
                                      return {
                                        ...prevState,
                                        inventories: prevState.inventories.map(
                                          (item) => {
                                            if (
                                              item.inventoryId ===
                                              row.inventoryId
                                            ) {
                                              return {
                                                ...item,
                                                quantity: row.maxQuantity,
                                              };
                                            }
                                            return item;
                                          }
                                        ),
                                      };
                                    }
                                  );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              label="Limit per pax"
                              size="small"
                              type="number"
                              fullWidth
                              name="maxQtyPerFamily"
                              variant="outlined"
                              value={row.maxQuantityPerFamily}
                              disabled={pageState.status === Status.LOADING}
                              onFocus={(event) => event.target.select()}
                              error={
                                row.maxQuantityPerFamily > row.quantity ||
                                row.quantity <= 0
                              }
                              onChange={(event) => {
                                const value = parseInt(event.target.value);
                                if (isNaN(value)) return;
                                setAllocationCreateRequestState((prevState) => {
                                  return {
                                    ...prevState,
                                    inventories: prevState.inventories.map(
                                      (item) => {
                                        if (
                                          item.inventoryId === row.inventoryId
                                        ) {
                                          return {
                                            ...item,
                                            maxQuantityPerFamily: value,
                                          };
                                        }
                                        return item;
                                      }
                                    ),
                                  };
                                });
                              }}
                              onBlur={(event) => {
                                const value = parseInt(event.target.value);
                                if (
                                  isNaN(value) ||
                                  value > row.quantity ||
                                  value <= 0
                                )
                                  setAllocationCreateRequestState(
                                    (prevState) => {
                                      return {
                                        ...prevState,
                                        inventories: prevState.inventories.map(
                                          (item) => {
                                            if (
                                              item.inventoryId ===
                                              row.inventoryId
                                            ) {
                                              return {
                                                ...item,
                                                maxQuantityPerFamily:
                                                  row.quantity < 5
                                                    ? row.quantity
                                                    : 5,
                                              };
                                            }
                                            return item;
                                          }
                                        ),
                                      };
                                    }
                                  );
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        size="medium"
                        height={dataGridHeight - 50}
                        sx={{
                          border: 0,
                        }}
                      >
                        <InfoOutlinedIcon
                          color="disabled"
                          style={{ fontSize: 100 }}
                        />
                        <Typography variant="h6" color="textSecondary">
                          No inventory selected
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          fontSize="0.8rem"
                        >
                          Select an inventory from the table to start
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Slide>
  );
};

export default CreateAllocationInventoriesSection;
