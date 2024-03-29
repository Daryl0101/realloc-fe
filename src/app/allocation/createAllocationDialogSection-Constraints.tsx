import { Action, Status } from "@/src/lib/utils";
import { Box, Grid, Paper, Slide, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";

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
  direction: "left" | "right";
  slideIn: boolean;
  container: HTMLElement | null;
};

const CreateAllocationConstraintsSection = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
  allocationCreateRequestState,
  setAllocationCreateRequestState,
  direction,
  slideIn,
  container,
}: Props) => {
  return (
    <Slide
      in={slideIn}
      direction={direction}
      container={container}
      mountOnEnter
      unmountOnExit
    >
      <Box display="flex" justifyContent="center">
        <Paper sx={{ width: 1 / 4 }}>
          <Grid container columnSpacing={2} rowGap={2} p={2}>
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                Allocation Constraints
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="number"
                variant="outlined"
                label="Diversification [1-10]"
                name="diversification"
                fullWidth
                value={allocationCreateRequestState.diversification}
                disabled={pageState.status === Status.LOADING}
                onFocus={(event) => event.target.select()}
                error={
                  allocationCreateRequestState.diversification < 1 ||
                  allocationCreateRequestState.diversification > 10
                }
                onChange={(event) => {
                  const value = parseInt(event.target.value);
                  if (isNaN(value)) return;
                  setAllocationCreateRequestState((prevState) => ({
                    ...prevState,
                    diversification: value,
                  }));
                }}
                onBlur={(event) => {
                  const value = parseInt(event.target.value);
                  if (isNaN(value) || value <= 0 || value > 10)
                    setAllocationCreateRequestState((prevState) => ({
                      ...prevState,
                      diversification: 5,
                    }));
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="number"
                variant="outlined"
                label="Food Plan Duration (days)"
                name="allocationDays"
                fullWidth
                value={allocationCreateRequestState.allocationDays}
                disabled={pageState.status === Status.LOADING}
                onFocus={(event) => event.target.select()}
                error={allocationCreateRequestState.allocationDays < 1}
                onChange={(event) => {
                  const value = parseInt(event.target.value);
                  if (isNaN(value)) return;
                  setAllocationCreateRequestState((prevState) => ({
                    ...prevState,
                    allocationDays: value,
                  }));
                }}
                onBlur={(event) => {
                  const value = parseInt(event.target.value);
                  if (isNaN(value) || value <= 0)
                    setAllocationCreateRequestState((prevState) => ({
                      ...prevState,
                      allocationDays: 1,
                    }));
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Slide>
  );
};

export default CreateAllocationConstraintsSection;
