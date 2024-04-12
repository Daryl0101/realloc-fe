"use server";

import { getServerSession } from "next-auth";

import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  AllocationStatus,
  ApiResponse,
  getErrorMessage,
} from "../../lib/utils";

type AllocationResponse = {
  id: number;
  allocation_no: string;
  start_time: string | null;
  end_time: string | null;
  status: AllocationStatus;
  log: string;
  allocation_days: number;
  diversification: number;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type AllocationResponseCamel = {
  id: number;
  allocationNo: string;
  startTime: string | null;
  endTime: string | null;
  status: AllocationStatus;
  log: string;
  allocationDays: number;
  diversification: number;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type AllocationValidateResponse = {
  is_allowed: boolean;
  current_allocation: AllocationResponse | null;
};

type AllocationValidateResponseCamel = {
  isAllowed: boolean;
  currentAllocation: AllocationResponseCamel | null;
};

const allocationValidateAPI = `${process.env.BASE_API_PATH}/allocation/creatable`;

export const validateAllocationCreatableAPICall = async (): Promise<
  { error: string | string[] } | AllocationValidateResponseCamel
> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(allocationValidateAPI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<AllocationValidateResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        isAllowed: result.model.is_allowed,
        currentAllocation: result.model.current_allocation
          ? {
              id: result.model.current_allocation.id,
              allocationNo: result.model.current_allocation.allocation_no,
              startTime: result.model.current_allocation.start_time,
              endTime: result.model.current_allocation.end_time,
              status: result.model.current_allocation.status,
              log: result.model.current_allocation.log,
              allocationDays: result.model.current_allocation.allocation_days,
              diversification: result.model.current_allocation.diversification,
              modifiedAt: result.model.current_allocation.modified_at,
              modifiedBy: result.model.current_allocation.modified_by,
              createdAt: result.model.current_allocation.created_at,
              createdBy: result.model.current_allocation.created_by,
            }
          : null,
      }
    : { error: "Something went wrong" };
};
