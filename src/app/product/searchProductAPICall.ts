"use server";

import GlobalConfig from "../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../api/auth/[...nextauth]/options";
import {
  ApiResponse,
  HalalStatus,
  PaginationRequest,
  PaginationResponse,
  getErrorMessage,
} from "../../lib/utils";

type SearchParams = {
  productNo: string;
  productNameOrDescription: string;
  halalStatus: HalalStatus;
};

type ProductItem = {
  id: string;
  sequence: number | null;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

const productSearchAPI = `${GlobalConfig.baseAPIPath}/master-data/products/search`;

export const searchProductAPICall = async (
  { productNo, productNameOrDescription, halalStatus }: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      productSearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          product_no: productNo,
          product_name_or_description: productNameOrDescription,
          halal_status: halalStatus.toString(),
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

  const result: ApiResponse<PaginationResponse<ProductItem>> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
