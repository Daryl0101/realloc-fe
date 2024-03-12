"use server";

import GlobalConfig from "../../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../../api/auth/[...nextauth]/options";
import {
  ApiResponse,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
  apiDateFormat,
} from "../../../lib/utils";
import dayjs from "dayjs";

type SearchParams = {
  inventoryNo: string;
  productNo: string;
  productName: string;
  storageNo: string;
  storageDescription: string;
  expirationDateStart: string | null;
  expirationDateEnd: string | null;
  receivedDateStart: string | null;
  receivedDateEnd: string | null;
  halalStatus: HalalStatus;
};

type ProductItem = {
  id: string;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

type StorageItem = {
  id: string;
  storage_no: string;
  description: string;
  is_halal: boolean;
};

type InventoryItem = {
  id: string;
  sequence: number | null;
  inventory_no: string;
  product: ProductItem;
  storage: StorageItem;
  expiration_date: string;
  received_date: string;
  total_qty: number;
  available_qty: number;
};

const inventorySearchAPI = `${GlobalConfig.baseAPIPath}/inventory-management/inventories/search`;

export const searchInventoryAPICall = async (
  params: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  let searchParams: any = {
    page_no: (pagination.page_no + 1).toString(),
    page_size: pagination.page_size.toString(),
    sort_column: pagination.sort_column,
    sort_order: pagination.sort_order.toString(),
    inventory_no: params.inventoryNo,
    product_no: params.productNo,
    product_name: params.productName,
    storage_no: params.storageNo,
    storage_description: params.storageDescription,
    halal_status: params.halalStatus.toString(),
  };

  if (params.expirationDateStart !== null)
    searchParams.expiration_date_start = dayjs(
      params.expirationDateStart
    ).format(apiDateFormat);
  if (params.expirationDateEnd !== null)
    searchParams.expiration_date_end = dayjs(params.expirationDateEnd).format(
      apiDateFormat
    );
  if (params.receivedDateStart !== null)
    searchParams.received_date_start = dayjs(params.receivedDateStart).format(
      apiDateFormat
    );
  if (params.receivedDateEnd !== null)
    searchParams.received_date_end = dayjs(params.receivedDateEnd).format(
      apiDateFormat
    );

  // if (
  //   params.expirationDateStart !== null &&
  //   params.expirationDateEnd !== null
  // ) {
  //   searchParams.expiration_date_start = dayjs(
  //     params.expirationDateStart
  //   ).format(apiDateFormat);
  //   searchParams.expiration_date_end = dayjs(params.expirationDateEnd).format(
  //     apiDateFormat
  //   );
  // }
  // if (params.receivedDateStart !== null && params.receivedDateEnd !== null) {
  //   searchParams.received_date_start = dayjs(params.receivedDateStart).format(
  //     apiDateFormat
  //   );
  //   searchParams.received_date_end = dayjs(params.receivedDateEnd).format(
  //     apiDateFormat
  //   );
  // }

  var res = null;
  try {
    res = await fetch(
      inventorySearchAPI + "?" + new URLSearchParams(searchParams),
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

  const result: ApiResponse<PaginationResponse<InventoryItem>> =
    await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
