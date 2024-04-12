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
import { searchFamilyAPICall } from "../../apiCall/family/searchFamilyAPICall";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import FamilyDialog from "./familyDialog";
import FamilyActions from "./familyActions";
import { LoadingButton } from "@mui/lab";

type SearchParams = {
  familyNo: string;
  familyOrPersonName: string;
  halalStatus: HalalStatus;
};

type FamilyItem = {
  id: string;
  sequence: number | null;
  family_no: string;
  name: string;
  last_received_date: string | null;
  is_halal: boolean;
};

const searchParamsDefaultState: SearchParams = {
  familyNo: "",
  familyOrPersonName: "",
  halalStatus: HalalStatus.All,
};

const Family = () => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>(paginationRequestDefaultState);
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    FamilyItem[]
  >([]);
  const [pageState, setPageState] = React.useState<{
    action: Action;
    status: Status;
    id: string | null;
  }>({ action: Action.NONE, status: Status.CLOSED, id: null });
  const { enqueueSnackbar } = useSnackbar();

  const searchFamily = async () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.SEARCH,
      status: Status.LOADING,
    }));

    const result = await searchFamilyAPICall(
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

  const handleFamilySearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await searchFamily();
  };

  //#region Add New Family
  const handleAddNewFamilyDialogOpen = () => {
    setPageState((prevState) => ({
      ...prevState,
      action: Action.ADD,
      status: Status.OPEN,
    }));
  };

  //#endregion

  const columns: readonly GridColDef<FamilyItem>[] = [
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
      minWidth: 150,
    },
    {
      field: "name",
      headerName: "Family Name",
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
      field: "last_received_date",
      headerName: "Last Received Date",
      flex: 1,
      minWidth: 150,
      renderCell(params) {
        return (
          <Typography variant="body2">
            {!!params.row.last_received_date
              ? parseDateStringToFormattedDate(params.row.last_received_date)
              : "NA"}
          </Typography>
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
          <FamilyActions
            params={params}
            pageState={pageState}
            setPageState={setPageState}
            searchFamily={searchFamily}
            enqueueSnackbar={enqueueSnackbar}
          />
        );
      },
    },
  ];

  useEffect(() => {
    searchFamily();
  }, [paginationRequestState]);

  return (
    <>
      <FamilyDialog
        pageState={pageState}
        setPageState={setPageState}
        searchFamily={searchFamily}
        enqueueSnackbar={enqueueSnackbar}
      ></FamilyDialog>
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" justifySelf="flex-start" mb={2}>
          Family
        </Typography>
        <Box justifySelf="flex-end">
          <LoadingButton
            variant="contained"
            onClick={handleAddNewFamilyDialogOpen}
            loading={pageState.status === Status.LOADING}
          >
            <span>Add New Family</span>
          </LoadingButton>
        </Box>
      </Box>
      <form onSubmit={handleFamilySearch}>
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
              label="Family No"
              sx={{ width: { sm: 200, md: 300, lg: 400, xl: 500 } }}
              name="familyNo"
              onChange={handleChange}
              value={searchParamsState.familyNo}
              disabled={pageState.status === Status.LOADING}
            />
            <TextField
              type="text"
              variant="outlined"
              label="Family/Member Name"
              sx={{ width: { sm: 200, md: 300, lg: 400, xl: 500 } }}
              name="familyOrPersonName"
              onChange={handleChange}
              value={searchParamsState.familyOrPersonName}
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

export default Family;
