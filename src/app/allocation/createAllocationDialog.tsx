import { Action, Status } from "@/src/lib/utils";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import React, { useEffect } from "react";
import CreateAllocationInventoriesSection from "./createAllocationDialogSection-Inventories";
import QontoConnector, { QontoStepIcon } from "@/src/components/stepper/qonto";
import { LoadingButton } from "@mui/lab";
import CreateAllocationFamilySection from "./createAllocationDialogSection-Families";
import { addNewAllocationAPICall } from "../../apiCall/allocation/addNewAllocationAPICall";
import CreateAllocationConstraintsSection from "./createAllocationDialogSection-Constraints";

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

const defaultAllocationCreateRequest: AllocationCreateRequest = {
  inventories: [],
  familyIds: [],
  allocationDays: 1,
  diversification: 5,
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

const steps = [
  "Select beneficiary families",
  "Select inventories",
  "Adjust parameters and constraints",
];

const CreateAllocationDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  enqueueSnackbar,
}: Props) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [allocationCreateRequestState, setAllocationCreateRequestState] =
    React.useState(defaultAllocationCreateRequest);
  const [isAbleToProceed, setIsAbleToProceed] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState<"left" | "right">(
    "left"
  );
  const slideRef = React.useRef<HTMLElement>(null);

  const createAllocation = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = await addNewAllocationAPICall({
      inventories: allocationCreateRequestState.inventories,
      familyIds: allocationCreateRequestState.familyIds,
      allocationDays: allocationCreateRequestState.allocationDays,
      diversification: allocationCreateRequestState.diversification,
    });

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleDialogClose();
      handleResetDialog();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleDialogClose = () => {
    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
    // setActiveStep(0);
  };

  const handleResetDialog = () => {
    setAllocationCreateRequestState(defaultAllocationCreateRequest);
    setActiveStep(0);
  };

  const handleCreateAllocation = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await createAllocation();
  };

  const sections = [
    <CreateAllocationFamilySection
      key={0}
      enqueueSnackbar={enqueueSnackbar}
      pageState={pageState}
      setPageState={setPageState}
      allocationCreateRequestState={allocationCreateRequestState}
      setAllocationCreateRequestState={setAllocationCreateRequestState}
      isAbleToProceed={isAbleToProceed}
      setIsAbleToProceed={setIsAbleToProceed}
      direction={slideDirection}
      slideIn={activeStep === 0}
      container={slideRef.current}
    />,

    <CreateAllocationInventoriesSection
      key={1}
      enqueueSnackbar={enqueueSnackbar}
      pageState={pageState}
      setPageState={setPageState}
      allocationCreateRequestState={allocationCreateRequestState}
      setAllocationCreateRequestState={setAllocationCreateRequestState}
      isAbleToProceed={isAbleToProceed}
      setIsAbleToProceed={setIsAbleToProceed}
      direction={slideDirection}
      slideIn={activeStep === 1}
      container={slideRef.current}
    />,
    <CreateAllocationConstraintsSection
      key={2}
      enqueueSnackbar={enqueueSnackbar}
      pageState={pageState}
      setPageState={setPageState}
      allocationCreateRequestState={allocationCreateRequestState}
      setAllocationCreateRequestState={setAllocationCreateRequestState}
      direction={slideDirection}
      slideIn={activeStep === 2}
      container={slideRef.current}
    />,
  ];

  return (
    <Dialog
      open={
        pageState.action === Action.ADD &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: handleCreateAllocation,
      }}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>Create New Allocation</DialogTitle>
      <DialogContent sx={{ overflow: "hidden" }}>
        <Box sx={{ width: "100%", mb: 3 }}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<QontoConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogContent>
        <Box ref={slideRef}>{sections[activeStep]}</Box>
      </DialogContent>
      <DialogActions>
        {activeStep !== 0 ? (
          <LoadingButton
            sx={{ alignSelf: "flex-start" }}
            loading={pageState.status === Status.LOADING}
            variant="contained"
            disabled={pageState.status === Status.LOADING}
            onClick={() => {
              setActiveStep((prevActiveStep) => prevActiveStep - 1);
              setSlideDirection("right");
            }}
          >
            <span>Back</span>
          </LoadingButton>
        ) : null}
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="outlined"
          color="error"
          onClick={handleDialogClose}
          disabled={pageState.status === Status.LOADING}
        >
          <span>Cancel</span>
        </LoadingButton>
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="outlined"
          color="primary"
          onClick={handleResetDialog}
          disabled={pageState.status === Status.LOADING}
        >
          <span>Reset</span>
        </LoadingButton>
        {activeStep !== sections.length - 1 ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            disabled={pageState.status === Status.LOADING || !isAbleToProceed}
            onClick={(event) => {
              event.preventDefault();
              setActiveStep((prevActiveStep) => prevActiveStep + 1);
              setSlideDirection("left");
            }}
          >
            <span>Proceed</span>
          </LoadingButton>
        ) : (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            disabled={pageState.status === Status.LOADING}
            type="submit"
          >
            <span>Create</span>
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateAllocationDialog;
