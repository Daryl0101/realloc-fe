export interface ApiResponse<T> {
  model: T | null;
  status_name: string;
  errors: string[] | null;
}

export interface PaginationResponse<T> {
  total_page: number;
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_record: number;
  current_record: number;
  items: T[];
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
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

// Function to generate sequential IDs for rows
// The object needs to have a `sequence` property
export default function generateSequentialNos<T>(rows: T[]): T[] {
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
