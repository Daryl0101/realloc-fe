// React useEffect sends request twice is normal in development mode
// References https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react?noredirect=1&lq=1
"use client";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import generateSequentialNos, { Status } from "../../lib/utils";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CustomNoRowsOverlay from "../../components/dataGrid/noRowsOverlay";
import { LoadingButton } from "@mui/lab";
import { addNewUserAPICall } from "../../apiCall/authentication/addNewUserAPICall";
import { useSnackbar } from "notistack";
import { searchUserAPICall } from "../../apiCall/authentication/searchUserAPICall";
import { MuiTelInput } from "mui-tel-input";

type SearchParams = {
  wildcard: string;
  role: string;
  gender: string;
};

type UserItem = {
  id: string;
  sequence: number | null;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_ngo_manager: boolean;
};

const searchParamsDefaultState: SearchParams = {
  wildcard: "",
  role: "",
  gender: "",
};

const Organization = () => {
  // useState hook with TypeScript
  // References https://codedamn.com/news/reactjs/usestate-hook-typescript
  const [searchParamsState, setSearchParamsState] =
    React.useState<SearchParams>(searchParamsDefaultState);
  const [searchResultState, setSearchResultState] = React.useState<UserItem[]>(
    []
  );
  const [addNewUserDialogOpenState, setAddNewUserDialogOpenState] =
    React.useState(Status.CLOSED);
  const { enqueueSnackbar } = useSnackbar();
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setSearchParamsState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const searchUser = async () => {
    const result = await searchUserAPICall(searchParamsState);
    if (Array.isArray(result)) {
      setSearchResultState(result);
      enqueueSnackbar("Search successful", { variant: "success" });
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

  // const searchUser = async () => {
  //   const session = await getSession();
  //   var res = null;
  //   try {
  //     res = await fetch(
  //       userSearchAPI +
  //         "?" +
  //         new URLSearchParams({
  //           wildcard: searchParamsState.wildcard,
  //           is_ngo_manager: searchParamsState.role,
  //           gender: searchParamsState.gender,
  //         }),
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Token ${session?.user.token}`,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     enqueueSnackbar(getErrorMessage(error), { variant: "error" });
  //     return;
  //   }

  //   var data: ApiResponse<PaginationResponse<UserItem>> = {
  //     model: null,
  //     status_name: "",
  //     errors: [],
  //   };
  //   if (res.ok) {
  //     data = await res.json();
  //   }
  //   if (data.model && data.model.items) {
  //     setSearchResultState(data.model.items);
  //   }
  // };

  const handleUserSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchUser();
  };

  const handleReset = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setSearchParamsState(searchParamsDefaultState);
  };

  //#region Add New User
  const handleAddNewUserDialogOpen = () => {
    setAddNewUserDialogOpenState(Status.OPEN);
  };

  const handleAddNewUserDialogClose = () => {
    if (addNewUserDialogOpenState !== Status.LOADING)
      setAddNewUserDialogOpenState(Status.CLOSED);
  };

  const handleAddNewUser = async (event: React.FormEvent<HTMLFormElement>) => {
    setAddNewUserDialogOpenState(Status.LOADING);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addNewUserAPICall(formData);

    setAddNewUserDialogOpenState(Status.OPEN);
    if (result?.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleAddNewUserDialogClose();
      searchUser();
      setPhoneNumber("");
    } else if (result?.error) {
      enqueueSnackbar(result.error, { variant: "error" });
    }
  };
  //#endregion

  const columns: readonly GridColDef<UserItem>[] = [
    { field: "sequence", headerName: "No", width: 50 },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
      minWidth: 150,
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 250 },
    {
      field: "is_ngo_manager",
      headerName: "Role",
      minWidth: 150,
      renderCell: (params) => {
        return params.row.is_ngo_manager ? (
          <Chip
            icon={<ManageAccountsIcon />}
            label="NGO Manager"
            size="small"
            color="primary"
          />
        ) : (
          <Chip
            icon={<VolunteerActivismIcon />}
            label="Volunteer"
            size="small"
            color="secondary"
          />
        );
      },
    },
  ];

  useEffect(() => {
    searchUser();
  }, []);

  return (
    <>
      <Dialog
        open={[Status.OPEN, Status.LOADING].includes(addNewUserDialogOpenState)}
        onClose={handleAddNewUserDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: handleAddNewUser,
        }}
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                variant="outlined"
                label="Username"
                fullWidth
                required
                autoComplete="off"
                autoFocus={true}
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                variant="outlined"
                label="Password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                variant="outlined"
                label="First Name"
                fullWidth
                required
                autoComplete="off"
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                variant="outlined"
                label="Last Name"
                fullWidth
                required
                autoComplete="off"
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                variant="outlined"
                label="Email"
                type="email"
                fullWidth
                required
                autoComplete="off"
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <TextField
                name="phoneNumber"
                variant="outlined"
                label="Phone Number"
                type="tel"
                inputProps={{ pattern: "[0-9]{3}-[0-9]{7,8}" }}
                fullWidth
                required
                autoComplete="off"
                disabled={addNewUserDialogOpenState === Status.LOADING}
              /> */}
              <MuiTelInput
                name="phoneNumber"
                variant="outlined"
                label="Phone Number"
                fullWidth
                required
                autoComplete="off"
                defaultCountry="MY"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                disabled={addNewUserDialogOpenState === Status.LOADING}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="role"
                  name="role"
                  defaultValue="false"
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="NGO Manager"
                    disabled={addNewUserDialogOpenState === Status.LOADING}
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Volunteer"
                    disabled={addNewUserDialogOpenState === Status.LOADING}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="gender"
                  name="gender"
                  defaultValue="MALE"
                >
                  <FormControlLabel
                    value="MALE"
                    control={<Radio />}
                    label="Male"
                    disabled={addNewUserDialogOpenState === Status.LOADING}
                  />
                  <FormControlLabel
                    value="FEMALE"
                    control={<Radio />}
                    label="Female"
                    disabled={addNewUserDialogOpenState === Status.LOADING}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={addNewUserDialogOpenState === Status.LOADING}
            variant="outlined"
            color="error"
            onClick={handleAddNewUserDialogClose}
            disabled={addNewUserDialogOpenState === Status.LOADING}
          >
            <span>Cancel</span>
          </LoadingButton>
          <LoadingButton
            loading={addNewUserDialogOpenState === Status.LOADING}
            variant="contained"
            // color="primary"
            type="submit"
            disabled={addNewUserDialogOpenState === Status.LOADING}
          >
            <span>Add</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" mb={2}>
          Organization
        </Typography>
        <>
          <Button variant="contained" onClick={handleAddNewUserDialogOpen}>
            Add New User
          </Button>
        </>
      </Box>

      <form onSubmit={handleUserSearch}>
        <Paper elevation={3}>
          <Box
            sx={{
              display: "flex",
              p: 2,
              flexWrap: "wrap",
              rowGap: 2,
              columnGap: 10,
              justifyContent: "flex-start",
            }}
          >
            <TextField
              type="text"
              variant="outlined"
              label="Search"
              sx={{ width: { sm: 200, md: 300, lg: 400, xl: 500 } }}
              name="wildcard"
              onChange={handleChange}
              value={searchParamsState.wildcard}
            />
            <FormControl>
              <FormLabel id="role">Role</FormLabel>
              <RadioGroup
                row
                aria-labelledby="role"
                name="role"
                onChange={handleChange}
                value={searchParamsState.role}
              >
                <FormControlLabel value="" control={<Radio />} label="All" />
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="NGO Manager"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Volunteer"
                />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel id="gender">Gender</FormLabel>
              <RadioGroup
                row
                aria-labelledby="gender"
                name="gender"
                onChange={handleChange}
                value={searchParamsState.gender}
              >
                <FormControlLabel value="" control={<Radio />} label="All" />
                <FormControlLabel
                  value="MALE"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="FEMALE"
                  control={<Radio />}
                  label="Female"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "flex",
              px: 2,
              pb: 2,
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button type="submit" variant="outlined" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Box>
        </Paper>
      </form>
      <Paper sx={{ width: "100%", my: 5, overflow: "hidden" }}>
        <DataGrid
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            toolbar: GridToolbar,
          }}
          sx={{ p: 1 }}
          rows={generateSequentialNos(searchResultState)}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          autoHeight={true}
        />
      </Paper>
    </>
  );
};

export default Organization;
