import {
  Action,
  HalalStatus,
  Status,
  parseDateTimeStringToFormattedDateTime,
} from "@/src/lib/utils";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormGroup,
  Grid,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import React, { useEffect } from "react";
import { searchFoodCategoryAPICall } from "../../apiCall/sysref/searchFoodCategoryAPICall";
import { addNewProductAPICall } from "../../apiCall/product/addNewProductAPICall";
import { editProductAPICall } from "../../apiCall/product/editProductAPICall";
import { deleteProductAPICall } from "../../apiCall/product/deleteProductAPICall";
import { retrieveProductAPICall } from "../../apiCall/product/retrieveProductAPICall";
import { editProductNutritionAPICall } from "../../apiCall/product/editProductNutritionAPICall";
import { useSnackbar } from "notistack";
import CachedIcon from "@mui/icons-material/Cached";
import InfoIcon from "@mui/icons-material/Info";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type Params = {
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
  pageState: { status: Status; action: Action | "INBOUND"; id: string | null };
  setPageState: React.Dispatch<
    React.SetStateAction<{
      action: Action | "INBOUND";
      status: Status;
      id: string | null;
    }>
  >;
  searchProduct: () => void;
};

var productParamsDefaultState: Params = {
  productNo: "",
  productName: "",
  description: "",
  categories: [],
  halalStatus: HalalStatus["Non Halal"],
  servingSize: "0.01",
  calorie: "0.01",
  carbohydrate: "0.00",
  protein: "0.00",
  fat: "0.00",
  sugar: "0.00",
  fiber: "0.00",
  saturatedFat: "0.00",
  cholesterol: "0.00",
  sodium: "0.00",
  modifiedAt: "",
  modifiedBy: "",
  createdAt: "",
  createdBy: "",
};

const ProductDialog = ({
  pageState: pageState,
  setPageState: setPageState,
  searchProduct,
}: Props) => {
  const [productParamsState, setProductParamsState] = React.useState<Params>(
    productParamsDefaultState
  );
  const [foodCategories, setFoodCategories] = React.useState<FoodCategory[]>(
    []
  );
  const [autocompleteFieldStatus, setAutocompleteFieldStatus] =
    React.useState<Status>(Status.OPEN);
  const [convertionValue, setConvertionValue] = React.useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

  const searchFoodCategories = async (searchString: string) => {
    setAutocompleteFieldStatus(Status.LOADING);

    const result = await searchFoodCategoryAPICall(searchString);
    if (Array.isArray(result)) {
      // setFoodCategories(
      //   result.filter(
      //     (r) =>
      //       !addNewProductParamsState.categories
      //         .map((category) => category.id)
      //         .includes(r.id)
      //   )
      // );
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

  // const addNewProduct = async () => {
  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.LOADING,
  //   }));
  //   const result = await addNewProductAPICall(productParamsState);

  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.OPEN,
  //   }));

  //   if (result.success) {
  //     enqueueSnackbar(result.success, { variant: "success" });
  //     handleDialogClose();
  //     handleResetDialog();
  //     searchProduct();
  //   } else if (result.error) {
  //     if (Array.isArray(result.error)) {
  //       result.error.forEach((error) =>
  //         enqueueSnackbar(error, { variant: "error" })
  //       );
  //     } else enqueueSnackbar(result.error, { variant: "error" });
  //   }
  // };

  // const editProduct = async () => {
  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.LOADING,
  //   }));
  //   const result = await editProductAPICall({
  //     ...productParamsState,
  //     id: pageState.id,
  //   });

  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.OPEN,
  //   }));

  //   if (result.success) {
  //     enqueueSnackbar(result.success, { variant: "success" });
  //     handleDialogClose();
  //     handleResetDialog();
  //     searchProduct();
  //   } else if (result.error) {
  //     if (Array.isArray(result.error)) {
  //       result.error.forEach((error) =>
  //         enqueueSnackbar(error, { variant: "error" })
  //       );
  //     } else enqueueSnackbar(result.error, { variant: "error" });
  //   }
  // };

  // const deleteProduct = async () => {
  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.LOADING,
  //   }));

  //   const result = await deleteProductAPICall(pageState.id);

  //   setPageState((prevState) => ({
  //     ...prevState,
  //     status: Status.OPEN,
  //   }));

  //   if (result.success) {
  //     enqueueSnackbar(result.success, { variant: "success" });
  //     handleDialogClose();
  //     handleResetDialog();
  //   searchProduct();
  //   } else if (result.error) {
  //     if (typeof result.error === "string")
  //       enqueueSnackbar(result.error, { variant: "error" });
  //     else {
  //       result.error.forEach((error) => {
  //         enqueueSnackbar(error, { variant: "error" });
  //       });
  //     }
  //   }
  // };

  const retrieveProduct = async () => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    const result = await retrieveProductAPICall(pageState.id);

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if ("productNo" in result) {
      enqueueSnackbar(`Product ${result.productNo} retrieved successfully`, {
        variant: "success",
      });
      productParamsDefaultState = result;
      // productParamsDefaultState = {
      //   ...result,
      //   productName: result.name,
      //   servingSize: result.serving_size,
      //   saturatedFat: result.saturated_fat,
      //   categories: result.food_categories,
      //   halalStatus: result.is_halal
      //     ? HalalStatus.Halal
      //     : HalalStatus["Non Halal"],
      // };
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

  const productAction = async (action: Action) => {
    setPageState((prevState) => ({
      ...prevState,
      status: Status.LOADING,
    }));
    var result = null;
    switch (action) {
      case Action.ADD:
        result = await addNewProductAPICall(productParamsState);
        break;
      case Action.EDIT:
        // result = await editProductAPICall({
        //   ...productParamsState,
        //   id: pageState.id,
        // });
        result = await editProductNutritionAPICall({
          id: pageState.id,
          servingSize: productParamsState.servingSize,
          calorie: productParamsState.calorie,
          carbohydrate: productParamsState.carbohydrate,
          protein: productParamsState.protein,
          fat: productParamsState.fat,
          sugar: productParamsState.sugar,
          fiber: productParamsState.fiber,
          saturatedFat: productParamsState.saturatedFat,
          cholesterol: productParamsState.cholesterol,
          sodium: productParamsState.sodium,
        });
        break;
      case Action.DELETE:
        result = await deleteProductAPICall(pageState.id);
        break;
    }

    setPageState((prevState) => ({
      ...prevState,
      status: Status.OPEN,
    }));

    if (result === null) {
      enqueueSnackbar("No action found in product action", {
        variant: "success",
      });
      return;
    }

    if (result.success) {
      enqueueSnackbar(result.success, { variant: "success" });
      handleDialogClose();
      handleResetDialog();
      searchProduct();
    } else if (result.error) {
      if (Array.isArray(result.error)) {
        result.error.forEach((error) =>
          enqueueSnackbar(error, { variant: "error" })
        );
      } else enqueueSnackbar(result.error, { variant: "error" });
    }
  };

  const handleDialogClose = () => {
    // setPageState((prevState) => ({
    //   ...prevState,
    //   action: Action.NONE,
    //   status: Status.CLOSED,
    // }));
    if (
      Array<Action | string>(Action.VIEW, Action.EDIT).includes(
        pageState.action
      )
    ) {
      productParamsDefaultState = {
        productNo: "",
        productName: "",
        description: "",
        categories: [],
        halalStatus: HalalStatus["Non Halal"],
        servingSize: "0.01",
        calorie: "0.01",
        carbohydrate: "0.00",
        protein: "0.00",
        fat: "0.00",
        sugar: "0.00",
        fiber: "0.00",
        saturatedFat: "0.00",
        cholesterol: "0.00",
        sodium: "0.00",
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
    setProductParamsState(productParamsDefaultState);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductParamsState((prevState) => ({
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
        })[0].minVal
    )
      value = parseFloat((productParamsDefaultState as any)[e.target.name]);
    e.target.value = value.toFixed(2).toString();
    setProductParamsState((prevState) => ({
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
    setProductParamsState((prevState) => ({
      ...prevState,
      halalStatus: newValue as HalalStatus,
    }));
  };

  const handleAddNewProduct = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await productAction(Action.ADD);
  };

  const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await productAction(Action.EDIT);
  };

  const handleDeleteProduct = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    await productAction(Action.DELETE);
  };

  const numberFields = [
    {
      name: "servingSize",
      label: "Serving Size (g)",
      value: productParamsState.servingSize,
      gridSize: 6,
      minVal: 0.01,
    },
    {
      name: "calorie",
      label: "Calorie (kcal)",
      value: productParamsState.calorie,
      gridSize: 6,
      minVal: 0.01,
    },
    {
      name: "carbohydrate",
      label: "Carbohydrate (g)",
      value: productParamsState.carbohydrate,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "protein",
      label: "Protein (g)",
      value: productParamsState.protein,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "fat",
      label: "Fat (g)",
      value: productParamsState.fat,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "sugar",
      label: "Sugar (g)",
      value: productParamsState.sugar,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "fiber",
      label: "Fiber (g)",
      value: productParamsState.fiber,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "saturatedFat",
      label: "Saturated Fat (g)",
      value: productParamsState.saturatedFat,
      gridSize: 4,
      minVal: 0,
    },
    {
      name: "cholesterol",
      label: "Cholesterol (mg)",
      value: productParamsState.cholesterol,
      gridSize: 6,
      minVal: 0,
    },
    {
      name: "sodium",
      label: "Sodium (mg)",
      value: productParamsState.sodium,
      gridSize: 6,
      minVal: 0,
    },
  ];

  useEffect(() => {
    if (
      Array<Action | string>(Action.VIEW, Action.EDIT).includes(
        pageState.action
      ) &&
      pageState.status === Status.OPEN
    ) {
      handleResetDialog();
      retrieveProduct();
    }
  }, [pageState.id]);

  useEffect(() => {
    setConvertionValue(parseFloat(productParamsState.servingSize));
  }, [productParamsState.servingSize]);

  // useEffect(() => {
  //   productParamsDefaultState = {
  //     productName: "",
  //     description: "",
  //     categories: [],
  //     halalStatus: HalalStatus["Non Halal"],
  //     servingSize: "0.01",
  //     calorie: "0.01",
  //     carbohydrate: "0.00",
  //     protein: "0.00",
  //     fat: "0.00",
  //     sugar: "0.00",
  //     fiber: "0.00",
  //     saturatedFat: "0.00",
  //     cholesterol: "0.00",
  //     sodium: "0.00",
  //   };
  //   setProductParamsState(productParamsDefaultState);
  // }, [[Action.ADD].includes(pageState.action)]);

  var dialogTitle = "";
  var onSubmit = null;

  switch (pageState.action) {
    case Action.ADD:
      dialogTitle = "Add New Product";
      onSubmit = handleAddNewProduct;
      break;
    case Action.VIEW:
    case Action.EDIT:
      dialogTitle = productParamsState.productNo
        ? productParamsState.productNo
        : "Loading...";
      onSubmit = handleEditProduct;
      break;
  }

  return (
    <Dialog
      open={
        Array<Action | string>(Action.ADD, Action.VIEW, Action.EDIT).includes(
          pageState.action
        ) && [Status.OPEN, Status.LOADING].includes(pageState.status)
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
            <DialogContentText>Product Details</DialogContentText>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="productName"
              variant="outlined"
              label="Product Name"
              value={productParamsState.productName}
              fullWidth
              required
              autoComplete="off"
              autoFocus={true}
              onChange={handleFieldChange}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.EDIT
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              variant="outlined"
              value={productParamsState.description}
              multiline
              rows={4}
              label="Description"
              fullWidth
              autoComplete="off"
              onChange={handleFieldChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              InputProps={{
                readOnly: pageState.action === Action.VIEW,
              }}
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.EDIT
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              readOnly={pageState.action === Action.VIEW}
              id="categories-select-field"
              multiple
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              //   filterOptions={(options) => options} // This is commented as it will cause the autocomplete to filter by descriptions as well
              options={foodCategories}
              //   autoComplete
              //   includeInputInList
              //   filterSelectedOptions
              onOpen={() => searchFoodCategories("")}
              value={productParamsState.categories}
              loading={autocompleteFieldStatus === Status.LOADING}
              onChange={(event, newValue) => {
                setProductParamsState((prevState) => ({
                  ...prevState,
                  categories: newValue,
                }));
              }}
              onInputChange={handleAutocompleteInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categories"
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
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.EDIT
              }
            />
            {/* <FormControl fullWidth>
                <InputLabel id="categories-select-field-label">
                  Categories
                </InputLabel>
                <Select
                  labelId="categories-select-field-label"
                  multiple
                  input={
                    <OutlinedInput
                      id="select-multiple-categories"
                      label="Categories"
                    />
                  }
                  // MenuProps={{
                  //   PaperProps: {
                  //     style: {
                  //       maxHeight: 48 * 4.5 + 8,
                  //       width: 250,
                  //     },
                  //   },
                  // }}
                ></Select>
              </FormControl> */}
          </Grid>
          <Grid item xs={12}>
            <ToggleButtonGroup
              color="primary"
              exclusive
              aria-label="halalStatus"
              fullWidth
              onChange={handleHalalToggleButtonFieldChange}
              value={productParamsState.halalStatus}
              disabled={
                pageState.status === Status.LOADING ||
                pageState.action === Action.VIEW ||
                pageState.action === Action.EDIT
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
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <DialogContentText>Product Nutritions</DialogContentText>
              {[Action.ADD, Action.EDIT].includes(
                pageState.action as Action
              ) ? (
                <Tooltip title="Scan product nutrition label">
                  <IconButton>
                    <DocumentScannerIcon color="action" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
            {[Action.ADD, Action.EDIT].includes(pageState.action as Action) ? (
              <Box display="flex" alignItems="center">
                <FormGroup row>
                  <TextField
                    variant="filled"
                    placeholder="Convert"
                    type="number"
                    size="small"
                    value={convertionValue}
                    className="mui-number-field"
                    error={!convertionValue}
                    inputProps={{ step: 0.01 }}
                    InputProps={{
                      sx: {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      },
                      endAdornment: (
                        <Tooltip title="Convert serving size">
                          <InfoIcon
                            sx={{
                              fontSize: 15,
                            }}
                          />
                        </Tooltip>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        // fontSize: 15,
                        height: 14,
                        padding: 1,
                        width: 60,
                      },
                    }}
                    onChange={(e) =>
                      setConvertionValue(parseFloat(e.target.value))
                    }
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) < 0.01 || !e.target.value)
                        setConvertionValue(
                          parseFloat(productParamsState.servingSize)
                        );
                    }}
                  />
                  <LoadingButton
                    variant="contained"
                    disableElevation
                    size="small"
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      height: 30,
                    }}
                    disabled={
                      pageState.status === Status.LOADING ||
                      convertionValue < 0.01 ||
                      !convertionValue
                    }
                    loading={pageState.status === Status.LOADING}
                    onClick={(e) => {
                      e.preventDefault();
                      setProductParamsState((prevState) => ({
                        ...prevState,
                        servingSize: convertionValue.toFixed(2),
                        calorie: (
                          parseFloat(prevState.calorie) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        carbohydrate: (
                          parseFloat(prevState.carbohydrate) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        protein: (
                          parseFloat(prevState.protein) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        fat: (
                          parseFloat(prevState.fat) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        sugar: (
                          parseFloat(prevState.sugar) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        fiber: (
                          parseFloat(prevState.fiber) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        saturatedFat: (
                          parseFloat(prevState.saturatedFat) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        cholesterol: (
                          parseFloat(prevState.cholesterol) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                        sodium: (
                          parseFloat(prevState.sodium) *
                          (convertionValue / parseFloat(prevState.servingSize))
                        ).toFixed(2),
                      }));
                    }}
                  >
                    <CachedIcon />
                  </LoadingButton>
                </FormGroup>
              </Box>
            ) : null}
          </Grid>
          {numberFields.map((field) => (
            <Grid key={`${field.label}-grid-item`} item xs={field.gridSize}>
              <TextField
                name={field.name}
                variant="outlined"
                label={field.label}
                value={field.value}
                error={parseFloat(field.value) < field.minVal}
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
          {Array<Action | string>(Action.VIEW, Action.EDIT).includes(
            pageState.action
          ) ? (
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
                  value: productParamsState.modifiedAt,
                },
                {
                  key: "createdAt",
                  label: "Created At",
                  value: productParamsState.createdAt,
                },
                {
                  key: "modifiedBy",
                  label: "Modified By",
                  value: productParamsState.modifiedBy,
                },
                {
                  key: "createdBy",
                  label: "Created By",
                  value: productParamsState.createdBy,
                },
              ].map((field) => {
                return (
                  <Grid key={field.key} item xs={6}>
                    <TextField
                      disabled
                      label={field.label}
                      value={
                        ["modifiedAt", "createdAt"].includes(field.key)
                          ? parseDateTimeStringToFormattedDateTime(field.value)
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
        {Array<Action | string>(Action.ADD, Action.EDIT).includes(
          pageState.action
        ) ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="outlined"
            onClick={handleResetDialog}
            disabled={pageState.status === Status.LOADING}
          >
            <span>Reset</span>
          </LoadingButton>
        ) : null}
        {Array<Action | string>(Action.VIEW, Action.EDIT).includes(
          pageState.action
        ) ? (
          <LoadingButton
            loading={pageState.status === Status.LOADING}
            variant="contained"
            color="error"
            onClick={handleDeleteProduct}
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

export default ProductDialog;
