import {
  Action,
  AllocationStatus,
  parseDateTimeStringToFormattedDateTime,
  Status,
} from "@/src/lib/utils";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect } from "react";
import { retrieveAllocationAPICall } from "../apiCall/allocation/retrieveAllocationAPICall";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AllocationChip from "./allocationChip";
import { DataGrid } from "@mui/x-data-grid";
import ViewAllocationInventoriesSection from "./viewAllocationDialogSection-Inventories";
import ViewAllocationFamiliesSection from "./viewAllocationDialogSection-Families";
import { LoadingButton } from "@mui/lab";

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
  webSocketCallRefresh: {
    type: "allocation_process" | "accept_reject_allocation_family";
  };
};

const allocationResponseDefaultState = {
  allocationNo: "loading...",
  startTime: "",
  endTime: "",
  status: null,
  log: "",
  allocationDays: 0,
  diversification: 0,
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

const ViewAllocationDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
  webSocketCallRefresh,
}: Props) => {
  const [allocationResponseState, setAllocationResponseState] =
    React.useState<AllocationResponse>(allocationResponseDefaultState);

  const retrieveAllocation = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveAllocationAPICall(pageState.id);

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("allocationNo" in result) {
      enqueueSnackbar(
        `Allocation ${result.allocationNo} retrieved successfully`,
        {
          variant: "success",
        }
      );
      setAllocationResponseState(result);
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

  const handleDialogClose = () => {
    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
  };

  useEffect(() => {
    if (pageState.action === Action.VIEW && pageState.status === Status.OPEN) {
      // setAllocationResponseState(allocationResponseDefaultState);
      retrieveAllocation();
    }
  }, [pageState.id, webSocketCallRefresh]);

  return (
    <Dialog
      open={
        pageState.action === Action.VIEW &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle display="flex" gap={1} alignItems="center">
        {allocationResponseState.allocationNo}
        {allocationResponseState.status !== null ? (
          <AllocationChip
            status={allocationResponseState.status}
            props={{
              size: "small",
            }}
          />
        ) : null}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Allocation Settings
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} columns={100}>
                  <Grid item xs={100}>
                    <DialogContentText>Allocation Details</DialogContentText>
                  </Grid>
                  <Grid item xs={50} md={28}>
                    <Tooltip
                      arrow
                      title={
                        !!allocationResponseState.startTime
                          ? `Started at: ${parseDateTimeStringToFormattedDateTime(
                              allocationResponseState.startTime
                            )}`
                          : null
                      }
                    >
                      <TextField
                        fullWidth
                        label="Started at"
                        value={
                          !!allocationResponseState.startTime
                            ? parseDateTimeStringToFormattedDateTime(
                                allocationResponseState.startTime
                              )
                            : ""
                        }
                        inputProps={{
                          readOnly: true,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={50} md={28}>
                    <Tooltip
                      arrow
                      title={
                        !!allocationResponseState.endTime
                          ? `Ended at: ${parseDateTimeStringToFormattedDateTime(
                              allocationResponseState.endTime
                            )}`
                          : null
                      }
                    >
                      <TextField
                        fullWidth
                        label="Ended at"
                        value={
                          !!allocationResponseState.endTime
                            ? parseDateTimeStringToFormattedDateTime(
                                allocationResponseState.endTime
                              )
                            : ""
                        }
                        inputProps={{
                          readOnly: true,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={50} md={22}>
                    <Tooltip
                      arrow
                      title={`Diversification: ${allocationResponseState.diversification}`}
                    >
                      <TextField
                        fullWidth
                        label="Diversification"
                        value={allocationResponseState.diversification}
                        inputProps={{
                          readOnly: true,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={50} md={22}>
                    <Tooltip
                      arrow
                      title={`Food Plan Duration (days): ${allocationResponseState.allocationDays}`}
                    >
                      <TextField
                        fullWidth
                        label="Food Plan Duration (days)"
                        value={allocationResponseState.allocationDays}
                        inputProps={{
                          readOnly: true,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={100}>
                    <TextField
                      fullWidth
                      label="Logs"
                      value={allocationResponseState.log}
                      multiline
                      rows={4}
                      inputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={100}>
                    <Divider></Divider>
                  </Grid>
                  <Grid item xs={100}>
                    <DialogContentText>Inventory Settings</DialogContentText>
                  </Grid>
                  <Grid item xs={100}>
                    <ViewAllocationInventoriesSection
                      pageState={pageState}
                      setPageState={setPageState}
                      enqueueSnackbar={enqueueSnackbar}
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
            <DialogContentText>Allocation Families</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <ViewAllocationFamiliesSection
              pageState={pageState}
              setPageState={setPageState}
              enqueueSnackbar={enqueueSnackbar}
              allocationResponseState={allocationResponseState}
              retrieveAllocation={retrieveAllocation}
              webSocketCallRefresh={webSocketCallRefresh}
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
      </DialogActions>
    </Dialog>
  );
};

export default ViewAllocationDialog;
