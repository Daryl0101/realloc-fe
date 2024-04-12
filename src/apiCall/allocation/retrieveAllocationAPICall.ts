"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  AllocationStatus,
  ApiResponse,
  getErrorMessage,
} from "../../lib/utils";

type AllocationResponse = {
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

export const retrieveAllocationAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | AllocationResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Allocation ID not found" };
    res = await fetch(`${process.env.BASE_API_PATH}/allocation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<AllocationResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        allocationNo: result.model.allocation_no,
        startTime: result.model.start_time,
        endTime: result.model.end_time,
        status: result.model.status,
        log: result.model.log,
        allocationDays: result.model.allocation_days,
        diversification: result.model.diversification,
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
