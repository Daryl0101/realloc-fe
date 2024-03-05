import {
  Action,
  DropdownItem,
  Gender,
  HalalStatus,
  Status,
  parseDateStringToFormattedDate,
} from "@/src/lib/utils";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { addNewFamilyAPICall } from "./addNewFamilyAPICall";
import { editFamilyAPICall } from "./editFamilyAPICall";
import { deleteFamilyAPICall } from "./deleteFamilyAPICall";
import { retrieveFamilyAPICall } from "./retrieveFamilyAPICall";
import { searchFoodCategoryAPICall } from "../product/searchFoodCategoryAPICall";
import { MuiTelInput } from "mui-tel-input";
import { retrieveActivityLevelDropdownAPICall } from "./retrieveActivityLevelDropdownAPICall";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

type PersonInfo = {
  id: string | null;
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  activityLevel: string;
};

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type Params = {
  familyNo: string;
  familyName: string;
  halalStatus: HalalStatus;
  householdIncome: string;
  phoneNumber: string;
  lastReceivedDate: string;
  address: string;
  totalMember: string;
  calorieDiscount: string;
  foodRestrictions: FoodCategory[];
  members: PersonInfo[];
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
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
  searchFamily: () => void;
  enqueueSnackbar: (message: string, options: any) => void;
};

var memberParamsDefaultState: PersonInfo = {
  id: null,
  firstName: "",
  lastName: "",
  gender: "",
  birthdate: "",
  height: "0.00",
  weight: "0.00",
  activityLevel: "1",
};

var familyParamsDefaultState: Params = {
  familyNo: "",
  familyName: "",
  halalStatus: HalalStatus["Non Halal"],
  householdIncome: "0.01",
  phoneNumber: "",
  lastReceivedDate: "",
  address: "",
  totalMember: "",
  calorieDiscount: "0.00",
  foodRestrictions: [],
  members: [memberParamsDefaultState],
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

const FamilyDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  searchFamily,
  enqueueSnackbar,
}: Props) => {
  const [familyParamsState, setFamilyParamsState] = React.useState<Params>(
    familyParamsDefaultState
  );
  const [foodCategories, setFoodCategories] = React.useState<FoodCategory[]>(
    []
  );
  const [autocompleteFieldStatus, setAutocompleteFieldStatus] =
    React.useState<Status>(Status.OPEN);
  const [activityLevelDropdownState, setActivityLevelDropdownState] =
    React.useState<DropdownItem[]>([]);

  const searchFoodCategories = async (searchString: string) => {
    setAutocompleteFieldStatus(Status.LOADING);

    const result = await searchFoodCategoryAPICall(searchString);
    if (Array.isArray(result)) {
      setFoodCategories(result);
    } else if (result.error) {
      if (typeof result.error === "string")
        enqueueSnackbar(result.error, { variant: "error" });
      else {
        result.error.forEach((error) => {
          enqueueSnackbar(error, { variant: "error" });
        });
      }
    }

    setAutocompleteFieldStatus(Status.OPEN);
  };

  const retrieveActivityLevelDropdown = async () => {
    const result = await retrieveActivityLevelDropdownAPICall();
    if (Array.isArray(result)) {
      setActivityLevelDropdownState(result);
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

  const retrieveFamily = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveFamilyAPICall(pageState.id);

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("familyNo" in result) {
      enqueueSnackbar(`Family ${result.familyNo} retrieved successfully`, {
        variant: "success",
      });
      familyParamsDefaultState = result;
      handleResetDialog();
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

  const familyAction = async (action: Action) => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = null;
    switch (action) {
      case Action.ADD:
        result = await addNewFamilyAPICall(familyParamsState);
        break;
      case Action.EDIT:
        result = await editFamilyAPICall({
          ...familyParamsState,
          id: pageState.id,
        });
        break;
      case Action.DELETE:
        result = await deleteFamilyAPICall(pageState.id);
        break;
    }

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result === null) {
      enqueueSnackbar("No action found in family action", {
        variant: "success",
      });
      return;
    }

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleDialogClose();
      handleResetDialog();
      searchFamily();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleDialogClose = () => {
    if ([Action.VIEW, Action.EDIT].includes(pageState.action)) {
      memberParamsDefaultState = {
        id: null,
        firstName: "",
        lastName: "",
        gender: "",
        birthdate: "",
        height: "0.00",
        weight: "0.00",
        activityLevel: "0",
      };

      familyParamsDefaultState = {
        familyNo: "",
        familyName: "",
        halalStatus: HalalStatus["Non Halal"],
        householdIncome: "0.01",
        phoneNumber: "",
        lastReceivedDate: "",
        address: "",
        totalMember: "",
        calorieDiscount: "0.00",
        foodRestrictions: [],
        members: [memberParamsDefaultState],
        modifiedAt: "",
        modifiedBy: "",
        createdAt: "",
        createdBy: "",
      };
      handleResetDialog();
    }

    setPageState({
      action: Action.NONE,
      status: Status.CLOSED,
      id: null,
    });
  };

  const handleResetDialog = () => {
    setFamilyParamsState(familyParamsDefaultState);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFamilyParamsState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleNumberFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    var value = parseFloat(e.target.value);
    if (
      !value ||
      value <
        numberFields.filter((field) => {
          return field.name === e.target.name;
        })[0].minVal ||
      value >
        numberFields.filter((field) => {
          return field.name === e.target.name;
        })[0].maxVal
    )
      value = parseFloat((familyParamsDefaultState as any)[e.target.name]);
    e.target.value = value.toFixed(2).toString();
    setFamilyParamsState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAutocompleteInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    searchString: string
  ) => {
    // event.preventDefault();
    searchFoodCategories(searchString);
  };

  const handleHalalToggleButtonFieldChange = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    newValue: any
  ) => {
    if (newValue === null) return;
    setFamilyParamsState((prevState) => ({
      ...prevState,
      halalStatus: newValue,
    }));
  };

  const handleNestedProductFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    setFamilyParamsState((prevState) => ({
      ...prevState,
      members: prevState.members.map((m, i) =>
        i === index ? { ...m, [e.target.name]: e.target.value } : m
      ),
    }));
  };

  const handleNestedNumberFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    index: number
  ) => {
    var value = parseFloat(e.target.value);
    if (
      !value ||
      value <
        nestedNumberFields.filter((field) => {
          return field.name === e.target.name;
        })[0].minVal ||
      value >
        nestedNumberFields.filter((field) => {
          return field.name === e.target.name;
        })[0].maxVal
    )
      value = parseFloat(
        (familyParamsDefaultState.members[index] as any)[e.target.name]
      );

    e.target.value = value.toFixed(2).toString();
    setFamilyParamsState((prevState) => ({
      ...prevState,
      members: prevState.members.map((m, i) =>
        i === index ? { ...m, [e.target.name]: e.target.value } : m
      ),
    }));
  };

  const handleMemberGenderToggleButtonFieldChange = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    newValue: any,
    index: number
  ) => {
    if (newValue === null) return;
    setFamilyParamsState((prevState) => ({
      ...prevState,
      members: prevState.members.map((m, i) =>
        i === index ? { ...m, gender: newValue } : m
      ),
    }));
  };

  const handleAddNewFamily = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await familyAction(Action.ADD);
  };

  const handleEditFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await familyAction(Action.EDIT);
  };

  const handleDeleteFamily = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await familyAction(Action.DELETE);
  };

  const numberFields = [
    {
      name: "householdIncome",
      label: "Monthly Household Income (RM)",
      value: familyParamsState.householdIncome,
      gridSize: 6,
      minVal: 0.01,
      maxVal: 999999999.99,
    },
    {
      name: "calorieDiscount",
      label: "Calorie Discount (%)",
      value: familyParamsState.calorieDiscount,
      gridSize: 6,
      minVal: 0.0,
      maxVal: 100.0,
    },
  ];

  const nestedNumberFields = [
    {
      name: "height",
      label: "Height (cm)",
      gridSize: 6,
      minVal: 0.0,
      maxVal: 300,
    },
    {
      name: "weight",
      label: "Weight (kg)",
      gridSize: 6,
      minVal: 0.0,
      maxVal: 300,
    },
  ];

  const marks = activityLevelDropdownState.map((item) => {
    return { value: parseInt(item.id), label: "", key: item.name };
  });

  useEffect(() => {
    if (
      [Action.VIEW, Action.EDIT].includes(pageState.action) &&
      pageState.status === Status.OPEN
    ) {
      handleResetDialog();
      retrieveFamily();
    }
  }, [pageState.id]);

  useEffect(() => {
    retrieveActivityLevelDropdown();
  }, []);

  var dialogTitle = "";
  var onSubmit = null;

  switch (pageState.action) {
    case Action.ADD:
      dialogTitle = "Add New Family";
      onSubmit = handleAddNewFamily;
      break;
    case Action.VIEW:
    case Action.EDIT:
      dialogTitle = familyParamsState.familyNo
        ? familyParamsState.familyNo
        : "Loading...";
      onSubmit = handleEditFamily;
      break;
  }

  return (
    <Dialog
      open={
        [Action.ADD, Action.VIEW, Action.EDIT].includes(pageState.action) &&
        [Status.OPEN, Status.LOADING].includes(pageState.status)
      }
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: onSubmit,
      }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          <Grid item xs={12}>
            <DialogContentText>Family Details</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="familyName"
              variant="outlined"
              label="Family Name"
              value={familyParamsState.familyName}
              fullWidth
              required
              autoComplete="off"
              autoFocus={true}
              onChange={handleFieldChange}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
              disabled={pageState.status === Status.LOADING}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiTelInput
              name="phoneNumber"
              variant="outlined"
              label="Phone Number"
              defaultCountry="MY"
              value={familyParamsState.phoneNumber}
              fullWidth
              required
              autoComplete="off"
              // onChange={handleFieldChange}
              onChange={(value) => {
                setFamilyParamsState((prevState) => ({
                  ...prevState,
                  phoneNumber: value,
                }));
              }}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.VIEW
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="address"
              variant="outlined"
              value={familyParamsState.address}
              multiline
              rows={4}
              label="Address"
              fullWidth
              required
              autoComplete="off"
              onChange={handleFieldChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
              disabled={pageState.status === Status.LOADING}
            />
          </Grid>
          {numberFields.map((field) => (
            <Grid key={`${field.label}-grid-item`} item xs={field.gridSize}>
              <TextField
                name={field.name}
                variant="outlined"
                label={field.label}
                value={field.value}
                error={
                  parseFloat(field.value) < field.minVal ||
                  parseFloat(field.value) > field.maxVal
                }
                type="number"
                inputProps={{ step: 0.01 }}
                fullWidth
                required
                autoComplete="off"
                onFocus={handleFieldFocus}
                onChange={handleFieldChange}
                onBlur={handleNumberFieldBlur}
                disabled={pageState.status === Status.LOADING}
                InputProps={{
                  readOnly: pageState.action === Action.VIEW,
                }}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Autocomplete
              readOnly={pageState.action === Action.VIEW}
              id="restrictions-select-field"
              multiple
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              //   filterOptions={(options) => options} // This is commented as it will cause the autocomplete to filter by descriptions as well
              options={foodCategories}
              //   autoComplete
              //   includeInputInList
              //   filterSelectedOptions
              onOpen={() => searchFoodCategories("")}
              value={familyParamsState.foodRestrictions}
              loading={autocompleteFieldStatus === Status.LOADING}
              onChange={(event, newValue) => {
                setFamilyParamsState((prevState) => ({
                  ...prevState,
                  foodRestrictions: newValue,
                }));
              }}
              onInputChange={handleAutocompleteInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Food Restrictions"
                  placeholder="Search"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {autocompleteFieldStatus === Status.LOADING ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                return (
                  <Tooltip
                    key={`${option.name}-tooltip`}
                    title={option.description}
                    placement="top-start"
                  >
                    <li {...props} key={option.name}>
                      {option.name}
                    </li>
                  </Tooltip>
                );
              }}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.name}
                    label={option.name}
                  />
                ));
              }}
              disabled={pageState.status === Status.LOADING}
            />
          </Grid>
          <Grid item xs={12}>
            <ToggleButtonGroup
              color="primary"
              exclusive
              aria-label="halalStatus"
              fullWidth
              onChange={handleHalalToggleButtonFieldChange}
              value={familyParamsState.halalStatus}
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.VIEW
              }
            >
              {[HalalStatus.Halal, HalalStatus["Non Halal"]].map((value) => {
                return (
                  <ToggleButton key={HalalStatus[value]} value={value}>
                    {HalalStatus[value]}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12}>
            <Divider></Divider>
          </Grid>
          <Grid item xs={12}>
            <DialogContentText>Family Members</DialogContentText>
          </Grid>
          {familyParamsState.members.map((member, index) => (
            <Grid key={`member-${index + 1}`} item xs={12}>
              <Box
                sx={{
                  border: 1,
                  borderColor: "grey.500",
                  borderStyle: "dashed",
                }}
                borderRadius={2}
                p={2}
              >
                <Grid container spacing={2} pt={1}>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body1" fontWeight="bold">
                      Member {index + 1}
                    </Typography>
                    {[Action.ADD, Action.EDIT].includes(pageState.action) &&
                    familyParamsState.members.length > 1 ? (
                      <Tooltip title="Delete member">
                        <IconButton
                          aria-label="delete-item"
                          color="error"
                          onClick={(e) => {
                            setFamilyParamsState((prevState) => ({
                              ...prevState,
                              members: prevState.members.filter(
                                (m, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="firstName"
                      variant="outlined"
                      label="First Name"
                      value={member.firstName}
                      fullWidth
                      required
                      autoComplete="nope"
                      onChange={(e) => handleNestedProductFieldChange(e, index)}
                      InputProps={{
                        readOnly: pageState.action === Action.VIEW,
                      }}
                      disabled={pageState.status === Status.LOADING}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="lastName"
                      variant="outlined"
                      label="Last Name"
                      value={member.lastName}
                      fullWidth
                      required
                      autoComplete="nope"
                      onChange={(e) => handleNestedProductFieldChange(e, index)}
                      InputProps={{
                        readOnly: pageState.action === Action.VIEW,
                      }}
                      disabled={pageState.status === Status.LOADING}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="birthdate"
                      variant="outlined"
                      label="Birthdate"
                      value={member.birthdate}
                      type="date"
                      fullWidth
                      required
                      autoComplete="nope"
                      onChange={(e) => handleNestedProductFieldChange(e, index)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        readOnly: pageState.action === Action.VIEW,
                      }}
                      disabled={pageState.status === Status.LOADING}
                    />
                  </Grid>
                  {nestedNumberFields.map((field) => (
                    <Grid
                      key={`${field.label}-member-grid-item`}
                      item
                      xs={field.gridSize}
                    >
                      <TextField
                        name={field.name}
                        variant="outlined"
                        label={field.label}
                        value={member[field.name as keyof PersonInfo]}
                        error={
                          parseFloat(
                            member[field.name as keyof PersonInfo] as string
                          ) < field.minVal ||
                          parseFloat(
                            member[field.name as keyof PersonInfo] as string
                          ) > field.maxVal
                        }
                        type="number"
                        inputProps={{ step: 0.01 }}
                        fullWidth
                        required
                        autoComplete="off"
                        onFocus={handleFieldFocus}
                        onChange={(e) =>
                          handleNestedProductFieldChange(e, index)
                        }
                        onBlur={(e) => handleNestedNumberFieldBlur(e, index)}
                        disabled={pageState.status === Status.LOADING}
                        InputProps={{
                          readOnly: pageState.action === Action.VIEW,
                        }}
                      />
                    </Grid>
                  ))}
                  {marks.length > 0 ? (
                    <Grid item xs={12}>
                      <Typography gutterBottom>Activity Level</Typography>
                      <Box display="flex" justifyContent="center">
                        <Slider
                          sx={{ width: "90%" }}
                          aria-label="Activity Level"
                          name="activityLevel"
                          step={null}
                          marks={marks}
                          value={parseInt(member.activityLevel)}
                          valueLabelFormat={(value) => {
                            return marks.find((x) => {
                              return x.value === value;
                            })?.key;
                          }}
                          valueLabelDisplay={
                            pageState.action === Action.VIEW ? "on" : "auto"
                          }
                          getAriaLabel={(value) => {
                            console.log(value);
                            return "";
                          }}
                          onChange={(e, newValue) => {
                            setFamilyParamsState((prevState) => ({
                              ...prevState,
                              members: prevState.members.map((m, i) =>
                                i === index
                                  ? { ...m, activityLevel: newValue.toString() }
                                  : m
                              ),
                            }));
                          }}
                          min={marks[0].value}
                          max={marks[marks.length - 1].value}
                          disabled={
                            pageState.status === Status.LOADING ||
                            pageState.action === Action.VIEW
                          }
                        />
                      </Box>
                    </Grid>
                  ) : null}
                  <Grid item xs={12}>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      aria-label="gender"
                      fullWidth
                      onChange={(e, newVal) =>
                        handleMemberGenderToggleButtonFieldChange(
                          e,
                          newVal,
                          index
                        )
                      }
                      value={member.gender}
                      disabled={
                        pageState.status === Status.LOADING ||
                        pageState.action === Action.VIEW
                      }
                    >
                      {[Gender.MALE, Gender.FEMALE].map((value) => {
                        return (
                          <ToggleButton
                            // key={Gender[value as keyof typeof Gender]}
                            // key={Object.values(Gender).find((x) => x === value)}
                            key={value}
                            value={value}
                          >
                            {Object.values(Gender).find((x) => x === value)}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}
          {[Action.ADD, Action.EDIT].includes(pageState.action) ? (
            <Grid item xs={12}>
              <Tooltip title="Add member" placement="top">
                <Button
                  fullWidth
                  sx={{
                    border: 1,
                    borderColor: "grey.500",
                    borderStyle: "dashed",
                  }}
                  onClick={(e) => {
                    setFamilyParamsState((prevState) => {
                      return {
                        ...prevState,
                        members: [
                          ...prevState.members,
                          memberParamsDefaultState,
                        ],
                      };
                    });
                  }}
                  disabled={pageState.status === Status.LOADING}
                >
                  <AddIcon />
                </Button>
              </Tooltip>
            </Grid>
          ) : null}
          {[Action.VIEW, Action.EDIT].includes(pageState.action) ? (
            <>
              <Grid item xs={12}>
                <Divider></Divider>
              </Grid>
              <Grid item xs={12}>
                <DialogContentText>Metadata Information</DialogContentText>
              </Grid>
              {[
                {
                  key: "modifiedAt",
                  label: "Modified At",
                  value: familyParamsState.modifiedAt,
                },
                {
                  key: "createdAt",
                  label: "Created At",
                  value: familyParamsState.createdAt,
                },
                {
                  key: "modifiedBy",
                  label: "Modified By",
                  value: familyParamsState.modifiedBy,
                },
                {
                  key: "createdBy",
                  label: "Created By",
                  value: familyParamsState.createdBy,
                },
              ].map((field) => {
                return (
                  <Grid key={field.key} item xs={6}>
                    <TextField
                      disabled
                      label={field.label}
                      value={
                        ["modifiedAt", "createdAt"].includes(field.key)
                          ? parseDateStringToFormattedDate(field.value)
                          : field.value
                      }
                      name={field.key}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                );
              })}
            </>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={pageState.status === Status.LOADING}
          variant="outlined"
          color="error"
          onClick={handleDialogClose}
          disabled={pageState.status === Status.LOADING}
        >
          <span>Cancel</span>
        </LoadingButton>
        {[Action.ADD, Action.EDIT].includes(pageState.action) ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="outlined"
            onClick={handleResetDialog}
            disabled={pageState.status === Status.LOADING}
          >
            <span>Reset</span>
          </LoadingButton>
        ) : null}
        {[Action.VIEW, Action.EDIT].includes(pageState.action) ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            color="error"
            onClick={handleDeleteFamily}
            disabled={pageState.status === Status.LOADING}
          >
            <span>Delete</span>
          </LoadingButton>
        ) : null}
        {pageState.action === Action.ADD ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            type="submit"
            disabled={pageState.status === Status.LOADING}
          >
            <span>Add</span>
          </LoadingButton>
        ) : null}
        {pageState.action === Action.EDIT ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            type="submit"
            disabled={pageState.status === Status.LOADING}
          >
            <span>Save</span>
          </LoadingButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default FamilyDialog;
