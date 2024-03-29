import generateSequentialNos, {
  Action,
  PaginationRequest,
  paginationRequestDefaultState,
  PaginationResponse,
  paginationResponseDefaultState,
  parseDateStringToFormattedDate,
  SortOrder,
  Status,
} from "@/src/lib/utils";
import React, { useEffect } from "react";
import { searchAllocationInventoryAPICall } from "../apiCall/allocation/searchAllocationInventoryAPICall";
import { LinearProgress, Paper, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CustomNoRowsOverlay from "@/src/components/dataGrid/noRowsOverlay";

type AllocationInventoryItem = {
  id: number;
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
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  quantity: number;
  max_quantity_per_family: number;
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
};

const ViewAllocationInventoriesSection = ({
  pageState,
  setPageState,
  enqueueSnackbar,
}: Props) => {
  const [paginationRequestState, setPaginationRequestState] =
    React.useState<PaginationRequest>({
      ...paginationRequestDefaultState,
      page_size: 5,
    });
  const [paginationResponseState, setPaginationResponseState] = React.useState<
    PaginationResponse<null>
  >(paginationResponseDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<
    AllocationInventoryItem[]
  >([]);

  const searchAllocationInventory = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));

    const result = await searchAllocationInventoryAPICall(
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

  const columns: readonly GridColDef<AllocationInventoryItem>[] = [
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
      valueGetter: (params) => params.row.inventory.inventory_no,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      align: "center",
      flex: 1,
      minWidth: 50,
    },
    {
      field: "max_quantity_per_family",
      headerName: "Limit",
      align: "center",
      flex: 1,
      minWidth: 50,
    },
    {
      field: "expiration_date",
      headerName: "Expiration Date",
      flex: 1,
      minWidth: 200,
      renderCell(params) {
        return (
          <Tooltip
            arrow
            title={parseDateStringToFormattedDate(
              params.row.inventory.expiration_date
            )}
          >
            <Typography variant="body2">
              {parseDateStringToFormattedDate(
                params.row.inventory.expiration_date
              )}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "received_date",
      headerName: "Received Date",
      flex: 1,
      minWidth: 200,
      renderCell(params) {
        return (
          <Tooltip
            arrow
            title={parseDateStringToFormattedDate(
              params.row.inventory.received_date
            )}
          >
            <Typography variant="body2">
              {parseDateStringToFormattedDate(
                params.row.inventory.received_date
              )}
            </Typography>
          </Tooltip>
        );
      },
    },
  ];

  useEffect(() => {
    searchAllocationInventory();
  }, [paginationRequestState]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
      />
    </Paper>
  );
};

export default ViewAllocationInventoriesSection;
