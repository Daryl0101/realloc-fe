"use server";

import GlobalConfig from "../../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../../api/auth/[...nextauth]/options";
import {
  AllocationFamilyStatus,
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

type AllocationFamilyItem = {
  id: number;
  sequence: number | null;
  family: {
    id: number;
    family_no: string;
    name: string;
    last_received_date: string;
    is_halal: boolean;
  };
  allocation_family_inventories: AllocationFamilyInventoryItem[];
  status: AllocationFamilyStatus;
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  calorie_needed: string;
  carbohydrate_needed: string;
  protein_needed: string;
  fat_needed: string;
  fiber_needed: string;
  sugar_needed: string;
  saturated_fat_needed: string;
  cholesterol_needed: string;
  sodium_needed: string;
  calorie_allocated: string;
  carbohydrate_allocated: string;
  protein_allocated: string;
  fat_allocated: string;
  fiber_allocated: string;
  sugar_allocated: string;
  saturated_fat_allocated: string;
  cholesterol_allocated: string;
  sodium_allocated: string;
};

const allocationFamilySearchAPI = `${GlobalConfig.baseAPIPath}/allocation/family/search`;

export const searchAllocationFamilyAPICall = async (
  allocation_id: string | null,
  pagination: PaginationRequest
) => {
  if (!allocation_id) return { error: "Allocation ID not found" };
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      allocationFamilySearchAPI +
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

  const result: ApiResponse<PaginationResponse<AllocationFamilyItem>> =
    await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
