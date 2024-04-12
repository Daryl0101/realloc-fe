import generateSequentialNos, {
  Action,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  SortOrder,
  Status,
  paginationRequestDefaultState,
  paginationResponseDefaultState,
  parseDateStringToFormattedDate,
} from "@/src/lib/utils";
import React, { useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Slide,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";
import { searchFamilyAPICall } from "../../apiCall/family/searchFamilyAPICall";
import { green } from "@mui/material/colors";

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

const CreateAllocationFamilySection = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
  allocationCreateRequestState: allocationCreateRequestState,
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
      sort_column: "last_received_date",
      sort_order: SortOrder.ASC,
    });
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    FamilyItem[]
  >([]);

  const searchFamily = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchFamilyAPICall(
      { ...searchParamsState, allocationCreatableOnly: true },
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

  const handleFamilySearch = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await searchFamily();
  };

  //#endregion

  const columns: readonly GridColDef<FamilyItem>[] = [
    {
      field: "family_no",
      headerName: "Family No",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "name",
      headerName: "Family Name",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "last_received_date",
      headerName: "Last Received Date",
      flex: 1,
      minWidth: 160,
      renderCell(params) {
        return (
          <Tooltip
            title={
              params.row.last_received_date !== null
                ? parseDateStringToFormattedDate(params.row.last_received_date)
                : "NA"
            }
          >
            <Typography variant="body2">
              {params.row.last_received_date !== null
                ? parseDateStringToFormattedDate(params.row.last_received_date)
                : "NA"}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "is_halal",
      headerName: "Halal",
      minWidth: 150,
      flex: 1,
      type: "boolean",
      valueGetter: (params) => params.row.is_halal,
    },
  ];

  useEffect(() => {
    searchFamily();
  }, [paginationRequestState]);

  useEffect(() => {
    setIsAbleToProceed(allocationCreateRequestState.familyIds.length > 0);
  }, [allocationCreateRequestState.familyIds]);

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
            <Grid item xs={12} sm={6} lg={4}>
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
            <Grid item xs={12} sm={6} lg={4}>
              <TextField
                type="text"
                variant="outlined"
                label="Family/Member Name"
                fullWidth
                name="familyOrPersonName"
                onChange={handleChange}
                value={searchParamsState.familyOrPersonName}
                disabled={pageState.status === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
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
              onClick={handleFamilySearch}
            >
              <span>Search</span>
            </LoadingButton>
          </Box>
        </Paper>
        <Paper sx={{ width: "100%", overflow: "hidden", my: 2 }}>
          <DataGrid
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
            rowSelectionModel={allocationCreateRequestState.familyIds}
            onRowSelectionModelChange={(newSelection) => {
              setAllocationCreateRequestState((prevState) => ({
                ...prevState,
                familyIds: newSelection.map((id) => parseInt(id.toString())),
              }));
            }}
            getRowId={(row) => row.id}
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
      </Box>
    </Slide>
  );
};

export default CreateAllocationFamilySection;
