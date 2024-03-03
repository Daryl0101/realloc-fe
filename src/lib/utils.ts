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

export const parseDateStringToFormattedDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// User defined type guard (incomplete)
// export function isType<T>(value: any): value is T {
//   return value !== null && typeof value === 'object';

// };
