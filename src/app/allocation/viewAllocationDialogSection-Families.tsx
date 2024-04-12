import generateSequentialNos, {
  Action,
  AllocationFamilyStatus,
  AllocationStatus,
  NutrientWeight,
  PaginationRequest,
  paginationRequestDefaultState,
  PaginationResponse,
  paginationResponseDefaultState,
  parseDateStringToFormattedDate,
  SortOrder,
  Status,
} from "@/src/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Chip,
  DialogContentText,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import { searchAllocationFamilyAPICall } from "../../apiCall/allocation/searchAllocationFamilyAPICall";
import { calculateNutrientOverallFulfilment } from "./calculateNutrientOverallFulfilment";
import { green, grey, orange, red, yellow } from "@mui/material/colors";
import theme from "@/src/lib/theme";
import AllocationFamilyChip from "./allocationFamilyChip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { acceptAllocationFamilyAPICall } from "../../apiCall/allocation/acceptAllocationFamilyAPICall";
import { rejectAllocationFamilyAPICall } from "../../apiCall/allocation/rejectAllocationFamilyAPICall";

type AllocationResponse = {
  allocationNo: string;
  startTime: string | null;
  endTime: string | null;
  status: AllocationStatus | null;
  log: string;
  allocationDays: number;
  diversification: number;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type AllocationFamilyInventoryItem = {
  sequence: number | null;
  inventory: {
    id: number;
    inventory_no: string;
    total_qty: number;
    available_qty: number;
    expiration_date: string;
    received_date: string;
    is_active: boolean;
  };
  quantity: number;
};

type AllocationFamilyItem = {
  id: number;
  sequence: number | null;
  family: {
    id: number;
    family_no: string;
    name: string;
    last_received_date: string;
    is_halal: boolean;
  };
  allocation_family_inventories: AllocationFamilyInventoryItem[];
  status: AllocationFamilyStatus;
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  calorie_needed: string;
  carbohydrate_needed: string;
  protein_needed: string;
  fat_needed: string;
  fiber_needed: string;
  sugar_needed: string;
  saturated_fat_needed: string;
  cholesterol_needed: string;
  sodium_needed: string;
  calorie_allocated: string;
  carbohydrate_allocated: string;
  protein_allocated: string;
  fat_allocated: string;
  fiber_allocated: string;
  sugar_allocated: string;
  saturated_fat_allocated: string;
  cholesterol_allocated: string;
  sodium_allocated: string;
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
  allocationResponseState: AllocationResponse;
  retrieveAllocation: () => Promise<void>;
  webSocketCallRefresh: {
    type: "allocation_process" | "accept_reject_allocation_family";
  };
};

const ViewAllocationFamiliesSection = ({
  pageState,
  setPageState,
  enqueueSnackbar,
  allocationResponseState,
  retrieveAllocation,
  webSocketCallRefresh,
}: Props) => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>({
      ...paginationRequestDefaultState,
      page_size: 5,
      sort_column: "status",
    });
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    AllocationFamilyItem[]
  >([]);
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [allocationFamilyInventories, setAllocationFamilyInventories] =
    React.useState<AllocationFamilyInventoryItem[]>([]);
  const [nutritionDetails, setNutritionDetails] = React.useState<{
    Calorie: {
      needed: number;
      allocated: number;
    };
    Carbohydrate: {
      needed: number;
      allocated: number;
    };
    Protein: {
      needed: number;
      allocated: number;
    };
    Fat: {
      needed: number;
      allocated: number;
    };
    Fiber: {
      needed: number;
      allocated: number;
    };
    Sugar: {
      needed: number;
      allocated: number;
    };
    "Saturated Fat": {
      needed: number;
      allocated: number;
    };
    Cholesterol: {
      needed: number;
      allocated: number;
    };
    Sodium: {
      needed: number;
      allocated: number;
    };
  }>({
    Calorie: {
      needed: 0,
      allocated: 0,
    },
    Carbohydrate: {
      needed: 0,
      allocated: 0,
    },
    Protein: {
      needed: 0,
      allocated: 0,
    },
    Fat: {
      needed: 0,
      allocated: 0,
    },
    Fiber: {
      needed: 0,
      allocated: 0,
    },
    Sugar: {
      needed: 0,
      allocated: 0,
    },
    "Saturated Fat": {
      needed: 0,
      allocated: 0,
    },
    Cholesterol: {
      needed: 0,
      allocated: 0,
    },
    Sodium: {
      needed: 0,
      allocated: 0,
    },
  });
  const aifDataGridRef = useRef<HTMLDivElement>(null);
  const [dataGridHeight, setDataGridHeight] = useState(0);

  const searchAllocationFamily = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchAllocationFamilyAPICall(
      pageState.id,
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

  const acceptRejectAllocation = async (
    is_accept: boolean,
    allocation_family_id: string
  ) => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = null;
    if (is_accept) {
      result = await acceptAllocationFamilyAPICall(allocation_family_id);
    } else {
      result = await rejectAllocationFamilyAPICall(allocation_family_id);
    }

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      searchAllocationFamily();
      retrieveAllocation();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleAcceptRejectButtonClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    is_accept: boolean,
    allocation_family_id: string
  ) => {
    event.preventDefault();
    await acceptRejectAllocation(is_accept, allocation_family_id);
  };

  const columns: GridColDef<AllocationFamilyItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "family_no",
      headerName: "Family No",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.row.family.family_no,
    },
    {
      field: "last_received_date",
      headerName: "Last Received Date",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) =>
        !!params.row.family.last_received_date
          ? parseDateStringToFormattedDate(params.row.family.last_received_date)
          : "NA",
    },
    {
      field: "halal",
      type: "boolean",
      headerName: "Halal",
      flex: 1,
      minWidth: 50,
      valueGetter: (params) => params.row.family.is_halal,
    },
    {
      field: "status",
      headerName: "Status",
      // headerAlign: "center",
      // align: "center",
      flex: 1,
      minWidth: 120,
      renderCell(params) {
        return (
          <AllocationFamilyChip
            status={params.row.status}
            props={{
              size: "small",
            }}
          />
        );
      },
    },
    {
      field: "fulfilment",
      headerName: "Fulfilment",
      align: "center",
      // headerAlign: "center",
      flex: 1,
      minWidth: 100,
      // Weighted sum of all nutrients' percentage
      renderCell(params) {
        return (
          <Tooltip
            title={
              calculateNutrientOverallFulfilment(params.row).toFixed(2) + "%"
            }
            arrow
          >
            <Box position="relative" width={1}>
              <LinearProgress
                variant="determinate"
                value={parseFloat(
                  calculateNutrientOverallFulfilment(params.row).toFixed(2)
                )}
                // color="default"
                sx={{
                  // scale: "-1 1",
                  // width: 1,
                  flex: 1,
                  height: "52px",
                  // borderRadius: 1,
                  // height: "14px",
                  // borderRadius: "7px",
                  backgroundColor: "transparent",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      calculateNutrientOverallFulfilment(params.row) < 30
                        ? theme.palette.mode === "light"
                          ? red[500]
                          : red[800]
                        : calculateNutrientOverallFulfilment(params.row) < 60
                        ? theme.palette.mode === "light"
                          ? orange[500]
                          : orange[800]
                        : theme.palette.mode === "light"
                        ? green[500]
                        : green[800],
                    transition: "none",
                    transformOrigin: "left",
                  },
                }}
              />
              <Box
                position="absolute"
                display="flex"
                alignItems="center"
                sx={{
                  // marginLeft: 1,
                  margin: "auto",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 1,
                }}
                padding={1}
              >
                <Typography fontFamily="cursive" variant="body2">
                  {calculateNutrientOverallFulfilment(params.row).toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  if (allocationResponseState.status === AllocationStatus.SUCCESS) {
    columns.push({
      field: "action",
      type: "action",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      renderCell(params) {
        return (
          <Box
            display={
              params.row.status === AllocationFamilyStatus.SERVED
                ? "flex"
                : "none"
            }
            justifyContent="center"
          >
            <Tooltip title="Accept" arrow>
              <Box>
                <IconButton
                  size="small"
                  color="success"
                  disabled={params.row.status !== AllocationFamilyStatus.SERVED}
                  onClick={(event) =>
                    handleAcceptRejectButtonClick(
                      event,
                      true,
                      params.row.id.toString()
                    )
                  }
                >
                  <CheckIcon />
                </IconButton>
              </Box>
            </Tooltip>
            <Tooltip title="Reject" arrow>
              <Box>
                <IconButton
                  size="small"
                  color="error"
                  disabled={params.row.status !== AllocationFamilyStatus.SERVED}
                  onClick={(event) =>
                    handleAcceptRejectButtonClick(
                      event,
                      false,
                      params.row.id.toString()
                    )
                  }
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  const allocationFamilyInventoryColumns: readonly GridColDef<AllocationFamilyInventoryItem>[] =
    [
      {
        field: "inventory_no",
        headerName: "Inventory No",
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => params.row.inventory.inventory_no,
      },
      {
        field: "expiration_date",
        headerName: "Expiration Date",
        flex: 1,
        minWidth: 100,
        valueGetter: (params) =>
          dayjs(params.row.inventory.expiration_date).format("DD/MM/YYYY"),
      },
      {
        field: "received_date",
        headerName: "Received Date",
        flex: 1,
        minWidth: 100,
        valueGetter: (params) =>
          dayjs(params.row.inventory.expiration_date).format("DD/MM/YYYY"),
      },
      {
        field: "quantity",
        headerName: "Quantity",
        flex: 1,
        align: "center",
        headerAlign: "center",
        minWidth: 80,
        valueGetter: (params) => params.row.quantity,
      },
    ];

  useEffect(() => {
    const selectedItem = searchResultState.find(
      (x) => x.id === rowSelectionModel[0]
    );
    if (rowSelectionModel.length === 1 && selectedItem !== undefined) {
      setAllocationFamilyInventories(
        selectedItem.allocation_family_inventories
      );
      setNutritionDetails({
        Calorie: {
          needed: parseFloat(selectedItem.calorie_needed),
          allocated: parseFloat(selectedItem.calorie_allocated),
        },
        Carbohydrate: {
          needed: parseFloat(selectedItem.carbohydrate_needed),
          allocated: parseFloat(selectedItem.carbohydrate_allocated),
        },
        Protein: {
          needed: parseFloat(selectedItem.protein_needed),
          allocated: parseFloat(selectedItem.protein_allocated),
        },
        Fat: {
          needed: parseFloat(selectedItem.fat_needed),
          allocated: parseFloat(selectedItem.fat_allocated),
        },
        Fiber: {
          needed: parseFloat(selectedItem.fiber_needed),
          allocated: parseFloat(selectedItem.fiber_allocated),
        },
        Sugar: {
          needed: parseFloat(selectedItem.sugar_needed),
          allocated: parseFloat(selectedItem.sugar_allocated),
        },
        "Saturated Fat": {
          needed: parseFloat(selectedItem.saturated_fat_needed),
          allocated: parseFloat(selectedItem.saturated_fat_allocated),
        },
        Cholesterol: {
          needed: parseFloat(selectedItem.cholesterol_needed),
          allocated: parseFloat(selectedItem.cholesterol_allocated),
        },
        Sodium: {
          needed: parseFloat(selectedItem.sodium_needed),
          allocated: parseFloat(selectedItem.sodium_allocated),
        },
      });
    } else {
      setAllocationFamilyInventories([]);
      setNutritionDetails({
        Calorie: {
          needed: 0,
          allocated: 0,
        },
        Carbohydrate: {
          needed: 0,
          allocated: 0,
        },
        Protein: {
          needed: 0,
          allocated: 0,
        },
        Fat: {
          needed: 0,
          allocated: 0,
        },
        Fiber: {
          needed: 0,
          allocated: 0,
        },
        Sugar: {
          needed: 0,
          allocated: 0,
        },
        "Saturated Fat": {
          needed: 0,
          allocated: 0,
        },
        Cholesterol: {
          needed: 0,
          allocated: 0,
        },
        Sodium: {
          needed: 0,
          allocated: 0,
        },
      });
    }
  }, [rowSelectionModel, searchResultState]);

  useEffect(() => {
    searchAllocationFamily();
  }, [paginationRequestState, webSocketCallRefresh]);

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <DataGrid
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            loadingOverlay: LinearProgress,
            toolbar: GridToolbar,
          }}
          sx={{
            p: 1,
            ".MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell[data-field='fulfilment']": {
              padding: 0,
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
          rows={searchResultState}
          columns={columns}
          loading={pageState.status === Status.LOADING}
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
          onRowSelectionModelChange={(selection) =>
            setRowSelectionModel(selection)
          }
        />
      </Paper>
      {allocationResponseState.status !== AllocationStatus.CREATED ? (
        <Grid container spacing={1} mt={1}>
          <Grid item xs={12} md={8}>
            <DialogContentText>Allocated Inventories </DialogContentText>
            <Paper
              sx={{ width: "100%", overflow: "hidden", height: "450px", mt: 1 }}
            >
              <DataGrid
                ref={aifDataGridRef}
                getRowId={(row) => row.inventory.id.toString()}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                  // () => {
                  //   return CustomNoRowsOverlay({
                  //     noRowsTitle: "No family selected",
                  //     noRowsDescription:
                  //       "Select a family to view allocated inventories",
                  //   });
                  // },
                  loadingOverlay: LinearProgress,
                  toolbar: GridToolbar,
                }}
                sx={{
                  p: 1,
                }}
                rows={allocationFamilyInventories}
                columns={allocationFamilyInventoryColumns}
                loading={pageState.status === Status.LOADING}
                // autoHeight={true}
                autoPageSize
                onStateChange={() => {
                  setDataGridHeight(
                    aifDataGridRef.current
                      ? aifDataGridRef.current.clientHeight
                      : 0
                  );
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <DialogContentText>Nutrient Details</DialogContentText>
            <TableContainer
              component={Paper}
              sx={{
                height: dataGridHeight,
                maxHeight: "525px",
                mt: 1,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nutrients</TableCell>
                    <TableCell>Fulfilment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowSelectionModel.length === 1 ? (
                    Object.keys(nutritionDetails).map((key) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell padding="none">
                          <Tooltip
                            title={
                              nutritionDetails[
                                key as keyof typeof nutritionDetails
                              ].needed > 0
                                ? `${(
                                    (100 *
                                      nutritionDetails[
                                        key as keyof typeof nutritionDetails
                                      ].allocated) /
                                    nutritionDetails[
                                      key as keyof typeof nutritionDetails
                                    ].needed
                                  ).toFixed(2)}% \(${nutritionDetails[
                                    key as keyof typeof nutritionDetails
                                  ].allocated.toFixed(2)}/${nutritionDetails[
                                    key as keyof typeof nutritionDetails
                                  ].needed.toFixed(2)}\)`
                                : null
                            }
                            arrow
                          >
                            <Box position="relative" width={1}>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  nutritionDetails[
                                    key as keyof typeof nutritionDetails
                                  ].needed > 0
                                    ? parseFloat(
                                        (
                                          (100 *
                                            nutritionDetails[
                                              key as keyof typeof nutritionDetails
                                            ].allocated) /
                                          nutritionDetails[
                                            key as keyof typeof nutritionDetails
                                          ].needed
                                        ).toFixed(2)
                                      )
                                    : 0
                                }
                                // color="default"
                                sx={{
                                  // scale: "-1 1",
                                  // width: 1,
                                  flex: 1,
                                  height: "52px",
                                  // borderRadius: 1,
                                  // height: "14px",
                                  // borderRadius: "7px",
                                  backgroundColor: "transparent",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      (100 *
                                        nutritionDetails[
                                          key as keyof typeof nutritionDetails
                                        ].allocated) /
                                        nutritionDetails[
                                          key as keyof typeof nutritionDetails
                                        ].needed <
                                      30
                                        ? theme.palette.mode === "light"
                                          ? red[500]
                                          : red[800]
                                        : (100 *
                                            nutritionDetails[
                                              key as keyof typeof nutritionDetails
                                            ].allocated) /
                                            nutritionDetails[
                                              key as keyof typeof nutritionDetails
                                            ].needed <
                                          60
                                        ? theme.palette.mode === "light"
                                          ? orange[500]
                                          : orange[800]
                                        : theme.palette.mode === "light"
                                        ? green[500]
                                        : green[800],
                                    // transition: "none",
                                    transformOrigin: "left",
                                  },
                                }}
                              />
                              <Box
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                sx={{
                                  // marginLeft: 1,
                                  margin: "auto",
                                  left: 0,
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  zIndex: 1,
                                }}
                                padding={1}
                              >
                                <Typography
                                  fontFamily="cursive"
                                  variant="body2"
                                >
                                  {nutritionDetails[
                                    key as keyof typeof nutritionDetails
                                  ].needed > 0
                                    ? `${(
                                        (100 *
                                          nutritionDetails[
                                            key as keyof typeof nutritionDetails
                                          ].allocated) /
                                        nutritionDetails[
                                          key as keyof typeof nutritionDetails
                                        ].needed
                                      ).toFixed(2)}%`
                                    : "0.00%"}
                                </Typography>
                              </Box>
                            </Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        align="center"
                        size="medium"
                        height={400}
                        sx={{
                          border: 0,
                        }}
                      >
                        <InfoOutlinedIcon
                          color="disabled"
                          style={{ fontSize: 100 }}
                        />
                        <Typography variant="h6" color="textSecondary">
                          No family selected
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          fontSize="0.8rem"
                        >
                          Select a family to view nutrient details
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default ViewAllocationFamiliesSection;
