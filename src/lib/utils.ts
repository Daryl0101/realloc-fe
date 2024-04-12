export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export enum SortOrder {
  ASC = 0,
  DESC = 1,
}

export enum Action {
  NONE = "None",
  SEARCH = "Search",
  ADD = "Add",
  EDIT = "Edit",
  DELETE = "Delete",
  VIEW = "View",
}

export enum Status {
  OPEN = "Open",
  CLOSED = "Closed",
  LOADING = "Loading",
}

export enum Role {
  manager = "manager",
  volunteer = "volunteer",
}

export enum HalalStatus {
  All,
  Halal,
  "Non Halal",
}

export enum AllocationStatus {
  CREATED = "CREATED",
  ONGOING = "ONGOING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum AllocationFamilyStatus {
  SERVED = "SERVED",
  NOT_SERVED = "NOT_SERVED",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum PackageStatus {
  NEW = "NEW",
  CANCELLED = "CANCELLED",
  PACKED = "PACKED",
  DELIVERED = "DELIVERED",
}

export enum NotificationReadStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export const NutrientWeight = {
  CALORIE: 3,
  CARBOHYDRATE: 2,
  PROTEIN: 2,
  FAT: 2,
  FIBER: 1,
  SUGAR: 1,
  SATURATED_FAT: 1,
  CHOLESTEROL: 1,
  SODIUM: 1,
};

export type ApiResponse<T> = {
  model: T | null;
  status_name: string;
  errors: string[] | null;
};

export type PaginationResponse<T> = {
  total_page: number;
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_record: number;
  current_record: number;
  items: T extends null ? null : T[];
};

export type PaginationRequest = {
  page_no: number;
  page_size: number;
  sort_column: string;
  sort_order: SortOrder;
};

export type DropdownItem = {
  id: string;
  name: string;
};

export const inputDateFormat = "DD/MM/YYYY";

export const apiDateFormat = "YYYY-MM-DD";

export const paginationResponseDefaultState: PaginationResponse<null> = {
  total_page: 1,
  current_page: 1,
  next_page: null,
  previous_page: null,
  total_record: 0,
  current_record: 0,
  items: null,
};

export const paginationRequestDefaultState: PaginationRequest = {
  page_no: 0,
  page_size: 10,
  sort_column: "",
  sort_order: SortOrder.DESC,
};

// Function to generate sequential IDs for rows
// The object needs to have a `sequence` property
export default function generateSequentialNos<T>(
  rows: T[],
  startFrom?: number
): T[] {
  if (startFrom)
    return rows.map((row, index) => ({ ...row, sequence: startFrom + index }));
  return rows.map((row, index) => ({ ...row, sequence: index + 1 }));
}

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }

  return message;
};

// Return Format: "dd Mon yyyy, hh:mm AM/PM"
export const parseDateTimeStringToFormattedDateTime = (
  dateTimeString: string
) => {
  // return new Date(dateTimeString).toLocaleString("en-GB", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  //   hour: "numeric",
  //   minute: "numeric",
  // });
  return new Date(dateTimeString).toLocaleString("en-GB", {
    hour12: true,
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Return Format: "Weekday, dd Month yyyy"
export const parseDateStringToFormattedDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    dateStyle: "full",
  });
};

// Return Format: "dd/mm/yyyy"
export const getCurrentDateString = () => {
  const today = new Date().toLocaleDateString("en-GB");
  return today;
};

// Return Format: "dd/mm/yyyy, hh:mm:ss"
export const getCurrentDateTimeString = () => {
  const now = new Date().toLocaleString("en-GB");
  return now;
};

// User defined type guard (incomplete)
// export function isType<T>(value: any): value is T {
//   return value !== null && typeof value === 'object';

// };
