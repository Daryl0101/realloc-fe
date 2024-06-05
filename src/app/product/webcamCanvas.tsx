import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Stack,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import { HalalStatus, ImageCaptureStatus } from "@/src/lib/utils";
import { NERProductAPICall } from "@/src/apiCall/product/NERProductAPICall";
import { useSnackbar } from "notistack";

const videoConstraints: MediaTrackConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
  //   facingMode: { exact: "environment" },
};

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
  const webcamRef = useRef<any>(null);
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

  //   const capture = useCallback(() => {
  //     const imageSrc = webcamRef.current.getScreenshot();
  //     setImgSrc(imageSrc);
  //   }, [webcamRef, setImgSrc]);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  const handleDialogClose = () => {
    setImgSrc(null);
    setProductNERCaptureStatus(ImageCaptureStatus.NONE);
  };

  useEffect(() => {
    if (!!imgSrc) {
      retrieveNERProduct(imgSrc);
    }
  }, [imgSrc]);

  return (
    <Dialog
      open={[ImageCaptureStatus.CAPTURING, ImageCaptureStatus.LOADING].includes(
        productNERCaptureStatus
      )}
      onClose={handleDialogClose}
    >
      <DialogTitle>Capture Nutritional Label</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleDialogClose}
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
        <Stack spacing={2}>
          {!imgSrc ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              height={"300vh"}
              //   minScreenshotWidth={30}
              //   minScreenshotHeight={30}
            />
          ) : (
            <img src={imgSrc} alt="captured" />
          )}
          <Box alignItems="center" justifyContent="center" display="flex">
            <Fab
              color="primary"
              onClick={handleCapture}
              disabled={productNERCaptureStatus === ImageCaptureStatus.LOADING}
            >
              <CenterFocusStrongIcon />
            </Fab>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default WebcamCanvas;
