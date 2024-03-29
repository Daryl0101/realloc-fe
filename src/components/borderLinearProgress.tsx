// https://mui.com/material-ui/react-progress/#customization:~:text=)%3B%0A%7D-,Customization,-Here%20are%20some
import { LinearProgress, linearProgressClasses, styled } from "@mui/material";

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  // [`&.${linearProgressClasses.colorPrimary}`]: {
  //   backgroundColor:
  //     theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  // },
  // [`& .${linearProgressClasses.bar}`]: {
  //   borderRadius: 5,
  //   backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  // },
}));
