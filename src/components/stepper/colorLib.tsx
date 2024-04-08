import { PackageStatus } from "@/src/lib/utils";
import {
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  styled,
} from "@mui/material";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CancelIcon from "@mui/icons-material/Cancel";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import theme from "@/src/lib/theme";

// const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 22,
//   },
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage:
//         "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage:
//         "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 3,
//     border: 0,
//     backgroundColor:
//       theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
//     borderRadius: 1,
//   },
// }));

// const ColorlibStepIconRoot = styled("div")<{
//   ownerState: { completed?: boolean; active?: boolean };
// }>(({ theme, ownerState }) => ({
//   backgroundColor:
//     theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
//   zIndex: 1,
//   color: "#fff",
//   //   width: 50,
//   //   height: 50,
//   display: "flex",
//   borderRadius: "50%",
//   justifyContent: "center",
//   alignItems: "center",
//   ...(ownerState.active && {
//     backgroundImage:
//       "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
//     boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
//   }),
//   ...(ownerState.completed && {
//     backgroundImage:
//       "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
//   }),
// }));

export function ColorlibStepIcon({
  packageStatus,
  props,
}: {
  packageStatus: PackageStatus;
  props: StepIconProps;
}) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    NEW: (
      <NewReleasesIcon
        htmlColor={
          active ? theme.palette.success.main : theme.palette.success.dark
        }
        fontSize={active ? "large" : "medium"}
      />
    ),
    CANCELLED: (
      <CancelIcon
        htmlColor={active ? theme.palette.error.main : theme.palette.error.dark}
        fontSize={active ? "large" : "medium"}
      />
    ),
    PACKED: (
      <ShoppingBagIcon
        htmlColor={active ? theme.palette.info.main : theme.palette.info.dark}
        fontSize={active ? "large" : "medium"}
      />
    ),
    DELIVERED: (
      <LocalShippingIcon
        htmlColor={
          active ? theme.palette.primary.main : theme.palette.primary.dark
        }
        fontSize={active ? "large" : "medium"}
      />
    ),
  };

  return (
    <div
      //   ownerState={{ completed, active }}
      className={className}
    >
      {icons[packageStatus]}
    </div>
  );
}

// export default ColorlibConnector;
