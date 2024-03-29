"use server";

import GlobalConfig from "../../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../../api/auth/[...nextauth]/options";
import {
  AllocationStatus,
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
} from "../../../lib/utils";

type SearchParams = {
  allocation_no: string;
  family_no: string;
  inventory_no: string;
  status: AllocationStatus | null;
};

type AllocationItem = {
  id: string;
  sequence: number | null;
  allocation_no: string;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
};

const allocationSearchAPI = `${GlobalConfig.baseAPIPath}/allocation/search`;

export const searchAllocationAPICall = async (
  { allocation_no, family_no, inventory_no, status }: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      allocationSearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          allocation_no: allocation_no,
          family_no: family_no,
          inventory_no: inventory_no,
          status: !status ? "" : status.toUpperCase(),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
      }
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<PaginationResponse<AllocationItem>> =
    await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
