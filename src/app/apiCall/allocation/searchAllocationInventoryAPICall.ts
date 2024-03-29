"use server";

import GlobalConfig from "../../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../../api/auth/[...nextauth]/options";
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
} from "../../../lib/utils";

type AllocationFamilyInventoryItem = {
  sequence: number | null;
  inventory: {
    id: number;
    inventory_no: string;
    total_qty: number;
    available_qty: number;
    expiration_date: string;
    received_date: string;
    is_active: boolean;
  };
  quantity: number;
};

type AllocationInventoryItem = {
  id: number;
  sequence: number | null;
  inventory: {
    id: number;
    inventory_no: string;
    total_qty: number;
    available_qty: number;
    expiration_date: string;
    received_date: string;
    is_active: boolean;
  };
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  quantity: number;
  max_quantity_per_family: number;
};

const allocationInventorySearchAPI = `${GlobalConfig.baseAPIPath}/allocation/inventory/search`;

export const searchAllocationInventoryAPICall = async (
  allocation_id: string | null,
  pagination: PaginationRequest
) => {
  if (!allocation_id) return { error: "Allocation ID not found" };
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      allocationInventorySearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          allocation_id: allocation_id.toString(),
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

  const result: ApiResponse<PaginationResponse<AllocationInventoryItem>> =
    await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
