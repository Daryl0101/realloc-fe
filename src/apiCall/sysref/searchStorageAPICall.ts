"use server";

import { getServerSession } from "next-auth";

import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  ApiResponse,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
} from "../../lib/utils";

type SearchParams = {
  storageNo: string;
  description: string;
  halalStatus: HalalStatus;
  excludeProductId: string;
};

type StorageItem = {
  id: string;
  sequence: number | null;
  storage_no: string;
  description: string;
  is_halal: boolean;
};

const storageSearchAPI = `${process.env.BASE_API_PATH}/system-reference/storages/search`;

export const searchStorageAPICall = async (
  { storageNo, description, halalStatus, excludeProductId }: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      storageSearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          storage_no: storageNo,
          description: description,
          halal_status: halalStatus.toString(),
          exclude_product_id: excludeProductId,
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

  const result: ApiResponse<PaginationResponse<StorageItem>> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
