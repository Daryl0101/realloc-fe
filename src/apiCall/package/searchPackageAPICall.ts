"use server";

import { getServerSession } from "next-auth";

import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  AllocationStatus,
  ApiResponse,
  PackageStatus,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
} from "../../lib/utils";

type SearchParams = {
  package_no: string;
  allocation_no: string;
  family_no: string;
  inventory_no: string;
  product_name: string;
  product_no: string;
  status: PackageStatus | null;
};

type PackageFamilyField = {
  id: string;
  family_no: string;
  name: string;
  last_received_date: string;
  is_halal: boolean;
};

type PackageAllocationField = {
  id: string;
  allocation_no: string;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
};

type PackageItem = {
  id: string;
  sequence: number | null;
  package_no: string;
  allocation: PackageAllocationField;
  family: PackageFamilyField;
  created_by: string;
  modified_by: string;
  created_at: string;
  modified_at: string;
  status: PackageStatus;
};

const packageSearchAPI = `${process.env.BASE_API_PATH}/package/search`;

export const searchPackageAPICall = async (
  {
    package_no,
    allocation_no,
    family_no,
    inventory_no,
    product_name,
    product_no,
    status,
  }: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      packageSearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          package_no: package_no,
          allocation_no: allocation_no,
          family_no: family_no,
          inventory_no: inventory_no,
          product_name: product_name,
          product_no: product_no,
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

  const result: ApiResponse<PaginationResponse<PackageItem>> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
