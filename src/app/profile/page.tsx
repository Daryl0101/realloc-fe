import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { getServerSession } from "next-auth";
import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import { ApiResponse, Gender } from "../../lib/utils";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

const profileGetAPI = `${process.env.BACKEND_API_URL}/authentication/profile`;

interface Model {
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  is_ngo_manager: boolean;
  date_joined: string;
  gender: Gender;
}

async function getProfileData() {
  try {
    const session = await getServerSession(options);
    const res = await fetch(profileGetAPI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile data");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching profile data:", error);
    // throw error; // Re-throw the error to propagate it to the caller
  }
}

const Profile = async () => {
  const res: ApiResponse<Model> = await getProfileData();
  if (!res.model) {
    return <div>Error fetching profile data</div>;
  }
  const {
    username = "",
    email = "",
    phone_number: phoneNumber = "",
    first_name: firstName = "",
    last_name: lastName = "",
    is_ngo_manager: isNGOManager = "",
    date_joined: dateJoined,
    gender = "",
  } = res.model;
  return (
    <>
      <Box display="flex" width="100%" justifyContent="space-between" my={2}>
        <Typography variant="h6" align="left" mb={2}>
          Profile
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={5}
          sx={{
            p: 2,
            maxWidth: "60rem",
          }}
        >
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                alignSelf={"center"}
                component="img"
                sx={{
                  margin: 2,
                  height: 200,
                  width: 200,
                  borderRadius: 50,
                }}
                alt={username[0]}
                src="https://clipground.com/images/profile-png-5.png"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                {username}
              </Typography>
              <Container
                sx={{ width: "max", display: "flex", justifyContent: "center" }}
              >
                {isNGOManager ? (
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
                )}
              </Container>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} my={2}>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="First Name"
                    variant="outlined"
                    defaultValue={firstName}
                    sx={{ width: "70%" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="Last Name"
                    variant="outlined"
                    defaultValue={lastName}
                    sx={{ width: "70%" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="Phone Number"
                    variant="outlined"
                    defaultValue={phoneNumber}
                    sx={{ width: "70%" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="Gender"
                    variant="outlined"
                    defaultValue={gender}
                    sx={{ width: "70%" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="Email"
                    variant="outlined"
                    defaultValue={email}
                    sx={{ width: "70%" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    disabled
                    label="Joined Date"
                    variant="outlined"
                    defaultValue={new Date(dateJoined).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    sx={{ width: "70%" }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default Profile;
