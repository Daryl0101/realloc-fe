import {
  Badge,
  Box,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grow,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import InboxIcon from "@mui/icons-material/Inbox";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { onSnapshot } from "firebase/firestore";
import { retrieveUserNotificationFirestore } from "../lib/firebase";
import { NotificationReadStatus, Status } from "../lib/utils";
import theme from "../lib/theme";
import { LoadingButton } from "@mui/lab";
import { deleteNotificationAPICall } from "../apiCall/notification/deleteNotificationAPICall";
import { markNotificationAsReadAPICall } from "../apiCall/notification/markNotificationAsReadAPICall";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link: string | null;
  status: NotificationReadStatus;
};

const NotificationDropdown = (props: { user_id: string }) => {
  const [pageState, setPageState] = React.useState<Status>(Status.CLOSED);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationDialog, setNotificationDialog] =
    useState<Notification | null>(null);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const [notificationMenuOpen, setNotificationMenuOpen] = React.useState(false);
  React.useState(false);

  const handleNotificationMenuClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setNotificationMenuOpen(false);
  };

  const handleNotificationDialogClose = () => {
    setNotificationDialog(null);
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    var result = await markNotificationAsReadAPICall(id);

    if (result.success) {
      console.log("Notification marked as read");
    } else if (result.error) {
      console.log(result.error);
    }
  };

  const deleteNotification = async () => {
    if (!notificationDialog) return;
    setPageState(Status.LOADING);
    var result = await deleteNotificationAPICall(notificationDialog.id);

    if (result.success) {
      setNotificationDialog(null);
    } else if (result.error) {
      console.log(result.error);
    }

    setPageState(Status.OPEN);
  };

  const realTimeNotificationUpdate = () => {
    onSnapshot(retrieveUserNotificationFirestore(props.user_id), (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as Notification;
        })
      );
    });
  };

  const handleDeleteNotification = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    deleteNotification();
  };

  useEffect(() => {
    if (notificationDialog === null) return;
    const updatedNoti = notifications.find(
      (noti) => noti.id === notificationDialog.id
    );
    if (!!updatedNoti) setNotificationDialog(updatedNoti);
    else setNotificationDialog(null);
  }, [notifications]);

  useEffect(() => {
    realTimeNotificationUpdate();
  }, []);

  return (
    <>
      <Dialog
        fullWidth
        open={notificationDialog !== null}
        onClose={handleNotificationDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: handleDeleteNotification,
        }}
      >
        <DialogTitle>{notificationDialog?.title}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleNotificationDialogClose}
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
          <DialogContentText
            whiteSpace="pre-line"
            sx={{ wordBreak: "break-word" }}
          >
            {notificationDialog?.body}
          </DialogContentText>
          {notificationDialog?.link ? (
            <Link
              href={notificationDialog.link}
              display="flex"
              alignItems="center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography alignItems="center">Follow link</Typography>
              <OpenInNewIcon fontSize="small" />
            </Link>
          ) : null}
        </DialogContent>
        {notificationDialog?.status === NotificationReadStatus.READ ? (
          <DialogActions>
            <LoadingButton
              loading={pageState === Status.LOADING}
              type="submit"
              variant="contained"
              color="error"
              disabled={pageState === Status.LOADING}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        ) : null}
      </Dialog>
      <Tooltip title="Notifications" arrow>
        <IconButton
          color={
            notifications.filter(
              (notification) =>
                notification.status === NotificationReadStatus.UNREAD
            ).length > 0
              ? "warning"
              : "inherit"
          }
          onClick={() => setNotificationMenuOpen((prevOpen) => !prevOpen)}
          edge="end"
          ref={anchorRef}
        >
          <Badge
            color="error"
            badgeContent={
              notifications.filter(
                (notification) =>
                  notification.status === NotificationReadStatus.UNREAD
              ).length
            }
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        open={notificationMenuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper sx={{ width: 250, maxHeight: "50vh", overflow: "auto" }}>
              <ClickAwayListener onClickAway={handleNotificationMenuClose}>
                <List>
                  {notifications.length > 0 ? (
                    notifications
                      .toSorted((a, b) => (a.status < b.status ? 1 : -1))
                      .map((notification, index) => (
                        <Box key={notification.id}>
                          {index !== 0 ? <Divider></Divider> : null}
                          <ListItemButton
                            id={notification.id}
                            sx={{
                              display: "block",
                              backgroundColor:
                                notification.status ===
                                NotificationReadStatus.UNREAD
                                  ? theme.palette.success.light
                                  : null,
                              position: "relative",
                            }}
                            onClick={() => {
                              if (
                                notification.status ===
                                NotificationReadStatus.UNREAD
                              )
                                handleMarkNotificationAsRead(notification.id);
                              setNotificationMenuOpen(false);
                              setNotificationDialog(notification);
                            }}
                          >
                            <Typography noWrap component="div" display="block">
                              <Typography
                                variant="inherit"
                                noWrap
                                display="block"
                              >
                                {notification.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={theme.palette.text.disabled}
                              >
                                {notification.body}
                              </Typography>
                            </Typography>
                            {notification.status ===
                            NotificationReadStatus.READ ? (
                              <Box
                                position="absolute"
                                top={0}
                                right={0}
                                zIndex={1}
                              >
                                <IconButton
                                  size="small"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteNotificationAPICall(
                                      notification.id
                                    );
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : null}
                          </ListItemButton>
                        </Box>
                      ))
                  ) : (
                    <ListItem sx={{ display: "block" }}>
                      <Box display="flex" justifyContent="center" sx={{}}>
                        <InboxIcon
                          color="disabled"
                          sx={{
                            fontSize: 40,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        align="center"
                        color="textSecondary"
                        flex={1}
                      >
                        No notifications
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default NotificationDropdown;
