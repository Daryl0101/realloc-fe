// "use client";
// import { getMessaging, onMessage } from "firebase/messaging";
// import { useSnackbar } from "notistack";
// import React from "react";
// import { app } from "../lib/firebase";

// const MainWrapper = ({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) => {
//   const { enqueueSnackbar } = useSnackbar();
//   onMessage(getMessaging(app), (payload) => {
//     if (payload.notification && payload.notification.title)
//       // setNotificationTitle(payload.notification.title);
//       enqueueSnackbar(payload.notification.title, { variant: "info" });
//   });
//   return children;
// };

// export default MainWrapper;
