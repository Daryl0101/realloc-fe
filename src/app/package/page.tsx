"use client";
import generateSequentialNos, {
  Action,
  AllocationStatus,
  PackageStatus,
  PaginationRequest,
  paginationRequestDefaultState,
  PaginationResponse,
  paginationResponseDefaultState,
  Role,
  SortOrder,
  Status,
} from "@/src/lib/utils";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { searchPackageAPICall } from "../../apiCall/package/searchPackageAPICall";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import PackageChip from "./packageChip";
import {
  Autocomplete,
  Box,
  Card,
  CardHeader,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GlobalConfig from "../../../app.config";
import { LoadingButton } from "@mui/lab";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import { retrievePackageAPICall } from "../../apiCall/package/retrievePackageAPICall";
import AssistantIcon from "@mui/icons-material/Assistant";
import PackageDetailCard from "./packageDetailCard";
import { getUserRoleAPICall } from "../../apiCall/authentication/getUserRoleAPICall";
import theme from "@/src/lib/theme";

type SearchParams = {
  packageNo: string;
  allocationNo: string;
  familyNo: string;
  inventoryNo: string;
  productName: string;
  productNo: string;
  status: PackageStatus | null;
};

type PackageFamilyField = {
  id: string;
  family_no: string;
  name: string;
  last_received_date: string;
  is_halal: boolean;
};

type PackageAllocationField = {
  id: string;
  allocation_no: string;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
};

type PackageItem = {
  id: string;
  sequence: number | null;
  package_no: string;
  allocation: PackageAllocationField;
  family: PackageFamilyField;
  created_by: string;
  modified_by: string;
  created_at: string;
  modified_at: string;
  status: PackageStatus;
};

const searchParamsDefaultState: SearchParams = {
  packageNo: "",
  allocationNo: "",
  familyNo: "",
  inventoryNo: "",
  productName: "",
  productNo: "",
  status: null,
};

const Package = () => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>(paginationRequestDefaultState);
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    PackageItem[]
  >([]);
  const [pageState, setPageState] = React.useState<{
    action: Action;
    status: Status;
    id: string | null;
  }>({ action: Action.NONE, status: Status.CLOSED, id: null });
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [webSocketCallRefresh, setWebSocketCallRefresh] = React.useState<
    string[]
  >([]);
  const [userRole, setUserRole] = React.useState<Role>(Role.volunteer);
  const { enqueueSnackbar } = useSnackbar();

  const searchPackage = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchPackageAPICall(
      {
        allocation_no: searchParamsState.allocationNo,
        family_no: searchParamsState.familyNo,
        inventory_no: searchParamsState.inventoryNo,
        product_name: searchParamsState.productName,
        product_no: searchParamsState.productNo,
        package_no: searchParamsState.packageNo,
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

  const getUserRole = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await getUserRoleAPICall();

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (Object.keys(Role).includes(result as string)) {
      const role = result as Role;
      setUserRole(role);
    } else {
      const error = result as { error: string };
      enqueueSnackbar(error.error, { variant: "error" });
    }
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

  const handlePackageSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await searchPackage();
  };

  const columns: readonly GridColDef<PackageItem>[] = [
    {
      field: "sequence",
      headerName: "No",
      width: 50,
      sortable: false,
      filterable: false,
    },
    {
      field: "package_no",
      headerName: "Package No",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "family_no",
      headerName: "Family No",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.family.family_no,
    },
    {
      field: "allocation_no",
      headerName: "Allocation No",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.allocation.allocation_no,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <PackageChip
            status={params.row.status}
            props={{
              size: "small",
            }}
          />
        );
      },
    },
  ];

  const packageWsCall = async () => {
    const socketUrl = `${GlobalConfig.baseWsPath}/package`;
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
        packageWsCall();
      }, 10000);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWebSocketCallRefresh(data);
    };
  };

  useEffect(() => {
    packageWsCall();
    getUserRole();
  }, []);

  // Search package on page load and pagination change
  useEffect(() => {
    searchPackage();
  }, [paginationRequestState]);

  useEffect(() => {
    if (rowSelectionModel.length === 1) {
      setPageState((prevState) => ({
        ...prevState,
        id: rowSelectionModel[0].toString(),
      }));
    } else
      setPageState((prevState) => ({
        ...prevState,
        action: Action.NONE,
        id: null,
      }));
  }, [rowSelectionModel]);

  useEffect(() => {
    console.log(webSocketCallRefresh);
    if (webSocketCallRefresh.length > 0) {
      if (
        searchResultState
          .map((item) => item.id.toString())
          .filter((item) =>
            webSocketCallRefresh.map((item) => item.toString()).includes(item)
          )
      )
        searchPackage();
      setWebSocketCallRefresh([]);
    }
  }, [webSocketCallRefresh]);

  return (
    <>
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" mb={2} mr={2} justifySelf="flex-start">
          Package
        </Typography>
      </Box>
      <form onSubmit={handlePackageSearch}>
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Grid container columnSpacing={2} rowGap={2} p={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                type="text"
                variant="outlined"
                label="Package No"
                name="packageNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.packageNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
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
                label="Family No"
                name="familyNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.familyNo}
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
                label="Product No"
                name="productNo"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.productNo}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                type="text"
                variant="outlined"
                label="Product Name"
                name="productName"
                fullWidth
                onChange={handleChange}
                value={searchParamsState.productName}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Autocomplete
                options={Object.values(PackageStatus)}
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
      {rowSelectionModel.length !== 1 ? (
        <Stack direction="row" spacing={1}>
          <Typography color={theme.palette.text.disabled}>
            Select a package from the table below to perform further actions
          </Typography>
          <AssistantIcon color="disabled" />
        </Stack>
      ) : null}
      <Grid container spacing={2}>
        <Grid item xs={12} md={pageState.id !== null ? 6 : 12}>
          <Paper
            sx={{
              width: "100%",
              my: 2,
              overflow: "hidden",
            }}
          >
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
                // pointer cursor on ALL rows
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
              }}
              rows={searchResultState}
              columns={columns}
              loading={pageState.status === Status.LOADING}
              autoHeight
              pagination
              pageSizeOptions={[10, 20, 50, 100]}
              keepNonExistentRowsSelected
              paginationMode="server"
              paginationModel={{
                page: paginationRequestState.page_no,
                pageSize: paginationRequestState.page_size,
              }}
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newSelection) => {
                setRowSelectionModel(newSelection);
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
        </Grid>
        {pageState.id !== null ? (
          <Grid item xs={12} md={6}>
            <PackageDetailCard
              pageState={pageState}
              setPageState={setPageState}
              setRowSelectionModel={setRowSelectionModel}
              webSocketCallRefresh={webSocketCallRefresh}
              userRole={userRole}
            />
          </Grid>
        ) : null}
      </Grid>
    </>
  );
};

export default Package;
