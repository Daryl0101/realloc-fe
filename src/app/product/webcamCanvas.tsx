import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import { HalalStatus, ImageCaptureStatus } from "@/src/lib/utils";
import { NERProductAPICall } from "@/src/apiCall/product/NERProductAPICall";
import { useSnackbar } from "notistack";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type ProductParams = {
  productNo: string;
  productName: string;
  description: string;
  categories: FoodCategory[];
  halalStatus: HalalStatus;
  servingSize: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  sugar: string;
  fiber: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type Props = {
  productNERCaptureStatus: ImageCaptureStatus;
  setProductNERCaptureStatus: React.Dispatch<
    React.SetStateAction<ImageCaptureStatus>
  >;
  setProductParamsState: React.Dispatch<React.SetStateAction<ProductParams>>;
};

const WebcamCanvas = ({
  productNERCaptureStatus,
  setProductNERCaptureStatus,
  setProductParamsState,
}: Props) => {
  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({});
  const [webcamState, setWebcamState] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const retrieveNERProduct = async (imgSrc: string) => {
    setProductNERCaptureStatus(ImageCaptureStatus.LOADING);
    const result = await NERProductAPICall(imgSrc);

    if (result === null) {
      enqueueSnackbar("No action found in family action", {
        variant: "success",
      });
      return;
    }

    if (result.servingSize) {
      enqueueSnackbar("Nutritions Extracted", { variant: "success" });
      setProductParamsState((prevState) => {
        return {
          ...prevState,
          servingSize: result.servingSize,
          calorie: result.calorie,
          carbohydrate: result.carbohydrate,
          protein: result.protein,
          fat: result.fat,
          sugar: result.sugar,
          fiber: result.fiber,
          saturatedFat: result.saturatedFat,
          cholesterol: result.cholesterol,
          sodium: result.sodium,
        };
      });
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }

    handleDialogClose();
  };

  const handleCapture = () => {
    if (!webcamRef.current) {
      enqueueSnackbar("Webcam not found", { variant: "error" });
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  const handleDialogClose = () => {
    setImgSrc(null);
    setWebcamState(false);
    setProductNERCaptureStatus(ImageCaptureStatus.NONE);
  };

  const handleCameraPermission = async () => {
    const permission = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });

    if (permission.state === "granted") {
      return;
    }

    if (permission.state === "denied") {
      navigator.mediaDevices.getUserMedia({ video: true });
    } else if (permission.state === "prompt") {
      enqueueSnackbar("Camera permission prompt", { variant: "info" });
    } else {
      enqueueSnackbar("Webcam not found", { variant: "error" });
    }
  };

  useEffect(() => {
    if (!!imgSrc) {
      retrieveNERProduct(imgSrc);
    }
  }, [imgSrc]);

  useEffect(() => {
    setVideoConstraints({
      width:
        window.screen.width > window.screen.height
          ? window.screen.height * 0.5
          : window.screen.width * 0.5,
      height:
        window.screen.width > window.screen.height
          ? window.screen.height * 0.5
          : window.screen.width * 0.5,
      facingMode: "environment",
    });
  }, []);

  return (
    <Dialog
      open={[ImageCaptureStatus.CAPTURING, ImageCaptureStatus.LOADING].includes(
        productNERCaptureStatus
      )}
      onClose={() => {
        if (productNERCaptureStatus === ImageCaptureStatus.LOADING) return;
        handleDialogClose();
      }}
      style={{
        minWidth: "50%",
      }}
      fullWidth
      scroll="body"
    >
      <DialogTitle>Scan</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          if (productNERCaptureStatus === ImageCaptureStatus.LOADING) return;
          handleDialogClose();
        }}
        disabled={productNERCaptureStatus === ImageCaptureStatus.LOADING}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Stack
          spacing={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {!webcamState &&
          productNERCaptureStatus === ImageCaptureStatus.CAPTURING ? (
            // <Stack
            //   spacing={2}
            //   height={window.screen.height * 0.5}
            //   display="flex"
            //   alignItems="center"
            //   justifyContent="center"
            // >
            //   <CircularProgress size={100} />
            //   <Typography variant="h5">Starting Camera</Typography>
            // </Stack>
            <Skeleton
              width={
                window.screen.width > window.screen.height
                  ? window.screen.height * 0.5
                  : window.screen.width * 0.5
              }
              height={
                window.screen.width > window.screen.height
                  ? window.screen.height * 0.5
                  : window.screen.width * 0.5
              }
              variant="rounded"
              animation="wave"
            />
          ) : null}
          {!imgSrc ? (
            <Box display={webcamState ? "block" : "none"}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                // height={"300rem"}
                onUserMedia={() => {
                  setWebcamState(true);
                }}
                onUserMediaError={handleCameraPermission}
              />
            </Box>
          ) : (
            <Box>
              <LinearProgress
                sx={{
                  width:
                    window.screen.width > window.screen.height
                      ? window.screen.height * 0.5
                      : window.screen.width * 0.5,
                }}
              />
              <img
                src={imgSrc}
                alt="captured"
                width={
                  window.screen.width > window.screen.height
                    ? window.screen.height * 0.5
                    : window.screen.width * 0.5
                }
                height={
                  window.screen.width > window.screen.height
                    ? window.screen.height * 0.5
                    : window.screen.width * 0.5
                }
              />
            </Box>
          )}
          <Box alignItems="center" justifyContent="center" display="flex">
            <Fab
              color="primary"
              onClick={handleCapture}
              disabled={
                productNERCaptureStatus === ImageCaptureStatus.LOADING ||
                webcamState === false
              }
              sx={{
                position: "relative",
              }}
            >
              <CenterFocusStrongIcon />
            </Fab>
            {productNERCaptureStatus === ImageCaptureStatus.LOADING ||
            webcamState === false ? (
              <CircularProgress
                size={68}
                style={{
                  position: "absolute",
                }}
              />
            ) : null}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default WebcamCanvas;
