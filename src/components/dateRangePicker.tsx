import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import { inputDateFormat } from "../lib/utils";
import dayjs, { Dayjs } from "dayjs";

const CustomDateRangePicker = ({
  formLabel,
  formName,
  dateStart,
  dateEnd,
  onSetDate,
  variant = "flexbox",
  disabled = false,
}: {
  formLabel: string;
  formName: string;
  dateStart: string | null;
  dateEnd: string | null;
  onSetDate: (dateStart: string | null, dateEnd: string | null) => void;
  variant?: "flexbox" | "grid";
  disabled?: boolean;
}) => {
  const [dateState, setDateState] = useState<{
    dateStart: string | null;
    dateEnd: string | null;
  }>({ dateStart: null, dateEnd: null });

  useEffect(() => {
    onSetDate(dateState.dateStart, dateState.dateEnd);
  }, [dateState]);

  useEffect(() => {
    setDateState({ dateStart, dateEnd });
  }, [dateStart, dateEnd]);

  return (
    // variant === "flexbox" ? (
    <Box display="flex">
      <DatePicker
        name={`${formName}Start`}
        label={`${formLabel} Start`}
        format={inputDateFormat}
        value={dateState.dateStart !== null ? dayjs(dateState.dateStart) : null}
        disabled={disabled}
        slotProps={{
          textField: { fullWidth: true },
          field: {
            clearable: true,
            onClear: (event) => {
              setDateState({ dateStart: null, dateEnd: null });
            },
            onBlur: (event) => {
              if (
                dateState.dateStart === null ||
                (dateState.dateStart !== null &&
                  !dayjs(dateState.dateStart).isValid())
              ) {
                setDateState({ dateStart: null, dateEnd: null });
              } else if (
                dateState.dateStart !== null &&
                dayjs(dateState.dateStart).isValid()
              )
                setDateState({
                  dateStart: dateState.dateStart,
                  dateEnd: dateState.dateStart,
                });
            },
            onChange: (value) => {
              value !== null
                ? setDateState({
                    ...dateState,
                    dateStart: value.format(),
                  })
                : setDateState({ dateStart: null, dateEnd: null });
              //   setDateState({
              //     ...dateState,
              //     dateStart:
              //       value !== null && value.isValid() ? value.format() : null,
              //   });
              //   if (value === null) {
              //     setDateState({ dateStart: null, dateEnd: null });
              //   } else if (value !== null && value.isValid()) {
              //     setDateState({
              //       ...dateState,
              //       dateEnd: value.format(),
              //     });
              //   }
            },
          },
        }}
        onChange={(value) => {
          setDateState({
            dateStart: value !== null ? value.format() : null,
            dateEnd: value !== null ? value.format() : null,
          });
        }}
      />
      <Box p={1} display="flex" justifyContent="center" alignItems="center">
        <Typography align="center">to</Typography>
      </Box>
      <DatePicker
        name={`${formName}End`}
        label={`${formLabel} End`}
        format={inputDateFormat}
        value={dateState.dateEnd !== null ? dayjs(dateState.dateEnd) : null}
        slotProps={{
          textField: { fullWidth: true },
          field: {
            clearable: true,
            onClear: (event) => {
              setDateState({ dateStart: null, dateEnd: null });
            },
            onBlur: (event) => {
              if (dateState.dateEnd === null) {
                setDateState({ dateStart: null, dateEnd: null });
              } else if (
                (dateState.dateStart !== null &&
                  dayjs(dateState.dateEnd) < dayjs(dateState.dateStart)) ||
                !dayjs(dateState.dateEnd).isValid()
              )
                setDateState({ ...dateState, dateEnd: dateState.dateStart });
            },
            onChange: (value) => {
              setDateState({
                ...dateState,
                dateEnd: value !== null ? value.format() : null,
              });
            },
          },
        }}
        disabled={dateState.dateStart === null || disabled}
        minDate={
          dateState.dateStart !== null ? dayjs(dateState.dateStart) : null
        }
        onChange={(value) => {
          if (value !== null) {
            setDateState({
              ...dateState,
              dateEnd: value !== null ? value.format() : null,
            });
          }
        }}
      />
    </Box>
    //   )
    //   : (
    //     <Grid container columns={50}>
    //       <Grid item xs={50} sm={23} lg={24}>
    //         <DatePicker slotProps={{ textField: { fullWidth: true } }} />
    //       </Grid>
    //       <Grid
    //         item
    //         xs={50}
    //         sm={4}
    //         lg={2}
    //         justifyContent="center"
    //         alignItems="center"
    //         display="flex"
    //       >
    //         <Typography align="center">to</Typography>
    //       </Grid>
    //       <Grid item xs={50} sm={23} lg={24}>
    //         <DatePicker slotProps={{ textField: { fullWidth: true } }} />
    //       </Grid>
    //     </Grid>
    //   );
  );
};

export default CustomDateRangePicker;
