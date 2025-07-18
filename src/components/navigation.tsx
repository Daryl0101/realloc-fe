"use client";
import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { AiOutlineTrademark } from "react-icons/ai";
import { Role } from "../lib/utils";
import { Box, colors, Link } from "@mui/material";
import { signOut } from "next-auth/react";
import NotificationDropdown from "./notificationDropdown";
import { registerFCMTokenAPICall } from "../apiCall/notification/registerFCMTokenAPICall";
import { app } from "../lib/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { vapidKey } from "@/app.config";
import { unregisterFCMTokenAPICall } from "../apiCall/notification/unregisterFCMTokenAPICall";
import { logoutAPICall } from "../apiCall/authentication/logoutAPICall";
import { useSnackbar } from "notistack";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navigation(props: {
  user: {
    id: string;
    email: string | null | undefined;
    role: Role;
  };
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    const notificationPermission = await Notification.requestPermission();
    if (notificationPermission === "granted") {
      const token = await getToken(getMessaging(app), {
        vapidKey: vapidKey,
      });
      if (token) {
        await unregisterFCMTokenAPICall(token);
      }
    }
    const result = await logoutAPICall();
    if (result.error) {
      console.log(result.error);
    }
    signOut();
  };

  const generateFCMToken = async () => {
    console.log("Notification permission granted.");

    const token = await getToken(getMessaging(app), {
      vapidKey: vapidKey,
    });

    if (token) {
      const registerResult = await registerFCMTokenAPICall(token);
      console.log(registerResult);
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
      // ...
    }
    // catch{(err) => {
    //   console.log("An error occurred while retrieving token. ", err);
    //   // ...
    // }};
  };

  const requestNotificationPermission = async () => {
    console.log("Requesting permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      await generateFCMToken();
      onMessage(getMessaging(app), (payload) => {
        if (payload.notification && payload.notification.title)
          // setNotificationTitle(payload.notification.title);
          enqueueSnackbar(payload.notification.title, { variant: "info" });
      });
    } else console.log("Unable to get permission to notify.");
  };

  React.useEffect(() => {
    requestNotificationPermission();
  }, []);

  const pages = [
    { name: "Dashboard", path: "/", icon: <HomeIcon />, managerOnly: true },
    {
      name: "Family",
      path: "/family",
      icon: <FamilyRestroomIcon />,
      managerOnly: false,
    },
    {
      name: "Product",
      path: "/product",
      icon: <RestaurantIcon />,
      managerOnly: false,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <InventoryIcon />,
      managerOnly: false,
    },
    {
      name: "Allocation",
      path: "/allocation",
      icon: <AccountTreeIcon />,
      managerOnly: true,
    },
    {
      name: "Package",
      path: "/package",
      icon: <LocalShippingIcon />,
      managerOnly: false,
    },
  ];

  const availablePages = pages.map((page) => {
    if (page.managerOnly && props.user.role !== Role.manager) {
      return null;
    }
    return (
      <ListItem key={page.name} disablePadding sx={{ display: "block" }}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
          href={page.path}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            {page.icon}
          </ListItemIcon>
          <ListItemText primary={page.name} sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>
    );
  });

  return (
    <>
      {/* <Snackbar
        open={!!notificationTitle}
        // message={notificationTitle}
        onClose={() => {
          setNotificationTitle("");
        }}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setNotificationTitle("");
          }}
          severity="info"
          variant="standard"
          sx={{ width: "100%" }}
        >
          {notificationTitle}
        </Alert>
      </Snackbar> */}
      <AppBar position="fixed" enableColorOnDark={true} open={open}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" columnGap={3}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                // marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box display="flex" height="fit-content">
              <Typography variant="h6" noWrap component="div">
                <Link
                  href={props.user.role === Role.manager ? "/" : "/family"}
                  underline="none"
                  color={colors.common.white}
                  fontFamily="cursive"
                >
                  ReAlloc
                </Link>
              </Typography>
              <AiOutlineTrademark
                style={{
                  alignSelf: "start",
                  marginTop: 4,
                  marginLeft: 2,
                  fontSize: 12,
                }}
              />
              {/* <PiTrademarkLight style={{ alignSelf: "start" }} /> */}
            </Box>
          </Box>
          <NotificationDropdown user_id={props.user.id} />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {/* { 
          pages.map((page) => (
            <ListItem key={page.name} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
                href={page.path}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {page.icon}
                </ListItemIcon>
                <ListItemText
                  primary={page.name}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))} */}
          {availablePages}
        </List>
        <Divider />
        <List>
          {props.user.role === Role.manager ? (
            <ListItem
              key="Organization"
              disablePadding
              sx={{ display: "block" }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
                href="/organization"
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Organization"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ) : null}
          <ListItem key="Profile" disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              href="/profile"
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
          <ListItem key="Logout" disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              onClick={handleLogout}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
