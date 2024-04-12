"use client";
import generateSequentialNos, {
  Action,
  AllocationStatus,
  PaginationRequest,
  PaginationResponse,
  SortOrder,
  Status,
  paginationRequestDefaultState,
  paginationResponseDefaultState,
  parseDateTimeStringToFormattedDateTime,
} from "@/src/lib/utils";
import {
  Autocomplete,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardActions,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { searchAllocationAPICall } from "../../apiCall/allocation/searchAllocationAPICall";
import { LoadingButton } from "@mui/lab";
import GlobalConfig from "../../../app.config";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import AllocationChip from "./allocationChip";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { validateAllocationCreatableAPICall } from "../../apiCall/allocation/validateAllocationCreatableAPICall";
import CreateAllocationDialog from "./createAllocationDialog";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CheckIcon from "@mui/icons-material/Check";
import { BorderLinearProgress } from "@/src/components/borderLinearProgress";
import theme from "@/src/lib/theme";
import InfoIcon from "@mui/icons-material/Info";
import ViewAllocationDialog from "./viewAllocationDialog";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";

type SearchParams = {
  allocationNo: string;
  familyNo: string;
  inventoryNo: string;
  status: AllocationStatus | null;
};

type AllocationItem = {
  id: string;
  sequence: number | null;
  allocation_no: string;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
};

type AllocationDetailResponse = {
  id: number;
  allocationNo: string;
  startTime: string | null;
  endTime: string | null;
  status: AllocationStatus;
  log: string;
  allocationDays: number;
  diversification: number;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type AllocationCreatableResponse = {
  isAllowed: boolean;
  currentAllocation: AllocationDetailResponse | null;
};

const searchParamsDefaultState: SearchParams = {
  allocationNo: "",
  familyNo: "",
  inventoryNo: "",
  status: null,
};

const allocationCreatableResponseDefaultState: AllocationCreatableResponse = {
  isAllowed: false,
  currentAllocation: null,
};

const AllocationInternal = () => {
  const [didMount, setDidMount] = React.useState(false);
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>(paginationRequestDefaultState);
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    AllocationItem[]
  >([]);
  const [pageState, setPageState] = React.useState<{
    action: Action;
    status: Status;
    id: string | null;
  }>({ action: Action.NONE, status: Status.CLOSED, id: null });
  const [allocationCreatable, setAllocationCreatable] =
    React.useState<AllocationCreatableResponse>(
      allocationCreatableResponseDefaultState
    );
  const [webSocketCallRefresh, setWebSocketCallRefresh] = React.useState<{
    type: any;
  }>({ type: "allocation_process" });
  const { enqueueSnackbar } = useSnackbar();

  const searchAllocation = async () => {
    if (pageState.action === Action.ADD)
      setPageState((prevState) => ({
        ...prevState,
        action: Action.SEARCH,
        status: Status.LOADING,
      }));
    else
      setPageState((prevState) => ({
        ...prevState,
        status: Status.LOADING,
      }));

    const result = await searchAllocationAPICall(
      {
        allocation_no: searchParamsState.allocationNo,
        family_no: searchParamsState.familyNo,
        inventory_no: searchParamsState.inventoryNo,
        status: searchParamsState.status,
      },
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

  const validateAllocationCreatable = async () => {
    setPageState((prevState) => ({
      ...prevState,
      // action: Action.SEARCH,
      status: Status.LOADING,
    }));

    const result = await validateAllocationCreatableAPICall();
    if ("isAllowed" in result) {
      setAllocationCreatable(result);
      enqueueSnackbar("Retrieve successful", { variant: "success" });
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
      // action: Action.NONE,
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

  const handleAllocationSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await searchAllocation();
  };

  const columns: readonly GridColDef<AllocationItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "allocation_no",
      headerName: "Allocation No",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "start_time",
      headerName: "Started",
      valueGetter: (params) =>
        params.row.start_time
          ? parseDateTimeStringToFormattedDateTime(params.row.start_time)
          : "",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "end_time",
      headerName: "Ended",
      valueGetter: (params) =>
        params.row.end_time
          ? parseDateTimeStringToFormattedDateTime(params.row.end_time)
          : "",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <AllocationChip
            status={params.row.status}
            props={{
              size: "small",
            }}
          />
        );
      },
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
          <Tooltip
            arrow
            title={
              params.row.status === AllocationStatus.SUCCESS
                ? "Continue Allocation Process"
                : "View Allocation"
            }
          >
            <Box>
              <IconButton
                key="view-allocation"
                aria-label="view-allocation"
                color={
                  params.row.status === AllocationStatus.SUCCESS
                    ? "info"
                    : "default"
                }
                onClick={() =>
                  setPageState({
                    action: Action.VIEW,
                    status: Status.OPEN,
                    id: params.row.id,
                  })
                }
                disabled={pageState.status === Status.LOADING}
              >
                {params.row.status === AllocationStatus.SUCCESS ? (
                  <AssignmentIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  const allocationWsCall = async () => {
    const socketUrl = `${GlobalConfig.baseWsPath}/allocation`;
    const socket = new WebSocket(socketUrl);

    socket.onerror = (error) => {
      enqueueSnackbar("WebSocket connection failed", { variant: "error" });
    };

    socket.onopen = (event) => {
      enqueueSnackbar("WebSocket connection established", {
        variant: "success",
      });
    };

    socket.onclose = (event) => {
      enqueueSnackbar(
        "WebSocket connection lost. Reconnecting in 10 seconds ...",
        {
          variant: "warning",
        }
      );
      // retry connection after 10 seconds
      setTimeout(() => {
        allocationWsCall();
      }, 10000);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      setWebSocketCallRefresh({
        type: data.type,
      });
      if (data.type === "allocation_process")
        enqueueSnackbar(data.message, {
          variant: "info",
        });
    };
  };

  // Connect to WebSocket
  // Flip mount flag
  useEffect(() => {
    allocationWsCall();
    setDidMount(true);
  }, []);

  // Re-validate allocation creatable every time an allocation_process is performed
  useEffect(() => {
    if (webSocketCallRefresh.type === "allocation_process")
      validateAllocationCreatable();
  }, [webSocketCallRefresh]);

  // Search allocation on page load and pagination change
  useEffect(() => {
    searchAllocation();
  }, [paginationRequestState]);

  // Search allocation on allocation_process performed and disable search during page load
  useEffect(() => {
    if (didMount && webSocketCallRefresh.type === "allocation_process")
      searchAllocation();
  }, [webSocketCallRefresh]);

  return (
    <>
      <CreateAllocationDialog
        pageState={pageState}
        setPageState={setPageState}
        enqueueSnackbar={enqueueSnackbar}
      />
      <ViewAllocationDialog
        pageState={pageState}
        setPageState={setPageState}
        enqueueSnackbar={enqueueSnackbar}
        webSocketCallRefresh={webSocketCallRefresh}
      />
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" mb={2} mr={2} justifySelf="flex-start">
          Allocation
        </Typography>
        {allocationCreatable.isAllowed ? (
          <Box justifySelf="flex-end">
            <Tooltip
              title={
                allocationCreatable.isAllowed
                  ? "Create new allocation"
                  : "Complete current allocation before creating new one."
              }
              placement="top"
            >
              <Box>
                <LoadingButton
                  variant="contained"
                  // onClick={handleInboundInventoryDialogOpen}
                  loading={pageState.status === Status.LOADING}
                  disabled={!allocationCreatable.isAllowed}
                  onClick={() => {
                    setPageState({
                      action: Action.ADD,
                      status: Status.OPEN,
                      id: null,
                    });
                  }}
                >
                  <span>Create Allocation</span>
                </LoadingButton>
              </Box>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
      {!allocationCreatable.isAllowed &&
      allocationCreatable.currentAllocation !== null ? (
        <Box
          width="100%"
          my={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Card>
            <CardActionArea
              sx={{
                p: 2,
                display: "flex",
                // justifyContent: "center",
                alignItems: "center",
                gap: 1,
                minWidth: 300,
                maxWidth: 600,
              }}
              onClick={() =>
                setPageState({
                  action: Action.VIEW,
                  status: Status.OPEN,
                  id:
                    allocationCreatable.currentAllocation !== null
                      ? allocationCreatable.currentAllocation.id.toString()
                      : null,
                })
              }
            >
              <Box m={1} position="relative" minWidth={60}>
                <Avatar
                  sx={{
                    bgcolor:
                      allocationCreatable.currentAllocation.status ===
                      AllocationStatus.CREATED
                        ? theme.palette.primary.main
                        : allocationCreatable.currentAllocation.status ===
                          AllocationStatus.ONGOING
                        ? theme.palette.warning.dark
                        : allocationCreatable.currentAllocation.status ===
                          AllocationStatus.SUCCESS
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    width: 56,
                    height: 56,
                  }}
                >
                  {allocationCreatable.currentAllocation.status !==
                  AllocationStatus.SUCCESS ? (
                    <AccountTreeIcon />
                  ) : (
                    <CheckIcon />
                  )}
                </Avatar>
                {allocationCreatable.currentAllocation.status !==
                AllocationStatus.SUCCESS ? (
                  <CircularProgress
                    size={68}
                    // color="info"
                    sx={{
                      color:
                        allocationCreatable.currentAllocation.status ===
                        AllocationStatus.CREATED
                          ? theme.palette.primary.light
                          : allocationCreatable.currentAllocation.status ===
                            AllocationStatus.ONGOING
                          ? theme.palette.warning.light
                          : theme.palette.error.main,
                      position: "absolute",
                      top: -6,
                      left: -6,
                      zIndex: 1,
                    }}
                  />
                ) : null}
              </Box>
              <Grid container item xs={10} spacing={1}>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" align="left">
                      {allocationCreatable.currentAllocation.allocationNo}
                    </Typography>
                    <Tooltip
                      arrow
                      placement="right-start"
                      title={
                        <div>
                          <div>
                            <b>Settings:</b>
                          </div>
                          <div>
                            Diversification:{" "}
                            {
                              allocationCreatable.currentAllocation
                                .diversification
                            }
                          </div>
                          <div>
                            Food Plan Duration (days):{" "}
                            {
                              allocationCreatable.currentAllocation
                                .allocationDays
                            }
                          </div>
                        </div>
                      }
                    >
                      <InfoIcon fontSize="small" alignmentBaseline="middle" />
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="flex-end">
                  <AllocationChip
                    status={allocationCreatable.currentAllocation.status}
                    props={{ size: "small" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={1} columns={15}>
                    <Grid item xs={5} sm={3}>
                      <Typography
                        variant="caption"
                        align="left"
                        noWrap
                        color={theme.palette.text.secondary}
                      >
                        Start:
                      </Typography>
                    </Grid>
                    <Grid item xs={10} sm={12}>
                      {allocationCreatable.currentAllocation.startTime !==
                      null ? (
                        <Tooltip
                          arrow
                          title={parseDateTimeStringToFormattedDateTime(
                            allocationCreatable.currentAllocation.startTime
                          )}
                        >
                          <Chip
                            size="small"
                            label={parseDateTimeStringToFormattedDateTime(
                              allocationCreatable.currentAllocation.startTime
                            )}
                          />
                        </Tooltip>
                      ) : null}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={1} columns={15}>
                    <Grid item xs={4} sm={3}>
                      <Typography
                        variant="caption"
                        align="left"
                        noWrap
                        color={theme.palette.text.secondary}
                      >
                        End:
                      </Typography>
                    </Grid>
                    <Grid item xs={11} sm={12}>
                      {allocationCreatable.currentAllocation.endTime !==
                      null ? (
                        <Tooltip
                          arrow
                          title={parseDateTimeStringToFormattedDateTime(
                            allocationCreatable.currentAllocation.endTime
                          )}
                        >
                          <Chip
                            size="small"
                            label={parseDateTimeStringToFormattedDateTime(
                              allocationCreatable.currentAllocation.endTime
                            )}
                          />
                        </Tooltip>
                      ) : null}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <BorderLinearProgress
                    color={
                      allocationCreatable.currentAllocation.status ===
                      AllocationStatus.SUCCESS
                        ? "success"
                        : "info"
                    }
                    variant="determinate"
                    value={
                      allocationCreatable.currentAllocation.status ===
                      AllocationStatus.CREATED
                        ? 10
                        : allocationCreatable.currentAllocation.status ===
                          AllocationStatus.ONGOING
                        ? 50
                        : allocationCreatable.currentAllocation.status ===
                          AllocationStatus.SUCCESS
                        ? 100
                        : 0
                    }
                  />
                </Grid>
              </Grid>
            </CardActionArea>
            {allocationCreatable.currentAllocation.status ===
            AllocationStatus.SUCCESS ? (
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <LoadingButton
                  endIcon={
                    <SkipNextIcon />
                    // <PlayCircleOutlineIcon />
                  }
                  autoFocus
                  variant="text"
                  size="small"
                  loading={pageState.status === Status.LOADING}
                  onClick={() =>
                    setPageState({
                      action: Action.VIEW,
                      status: Status.OPEN,
                      id:
                        allocationCreatable.currentAllocation !== null
                          ? allocationCreatable.currentAllocation.id.toString()
                          : null,
                    })
                  }
                >
                  Continue
                </LoadingButton>
              </CardActions>
            ) : null}
          </Card>
        </Box>
      ) : null}
      <form onSubmit={handleAllocationSearch}>
        <Paper elevation={3}>
          <Grid container columnSpacing={2} rowGap={2} p={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                type="text"
                variant="outlined"
                label="Allocation No"
                name="allocationNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.allocationNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
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
            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                type="text"
                variant="outlined"
                label="Family No"
                name="familyNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.familyNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Autocomplete
                options={Object.values(AllocationStatus)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    variant="outlined"
                    fullWidth
                  />
                )}
                disablePortal
                fullWidth
                onChange={(event, value) => {
                  setSearchParamsState((prevState) => ({
                    ...prevState,
                    status: value,
                  }));
                }}
                value={searchParamsState.status}
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
              type="submit"
              variant="contained"
              loading={pageState.status === Status.LOADING}
            >
              <span>Search</span>
            </LoadingButton>
          </Box>
        </Paper>
      </form>
      <Paper
        sx={{
          width: "100%",
          my: 5,
          overflow: "hidden",
        }}
      >
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

export default AllocationInternal;
