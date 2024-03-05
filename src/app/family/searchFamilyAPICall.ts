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
  familyNo: string;
  familyOrPersonName: string;
  halalStatus: HalalStatus;
};

type FamilyItem = {
  id: string;
  sequence: number | null;
  family_no: string;
  name: string;
  last_received_date: string;
  is_halal: boolean;
};

const familySearchAPI = `${GlobalConfig.baseAPIPath}/master-data/families/search`;

export const searchFamilyAPICall = async (
  {
    familyNo,
    familyOrPersonName: familyOrPersonName,
    halalStatus,
  }: SearchParams,
  pagination: PaginationRequest
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      familySearchAPI +
        "?" +
        new URLSearchParams({
          page_no: (pagination.page_no + 1).toString(),
          page_size: pagination.page_size.toString(),
          sort_column: pagination.sort_column,
          sort_order: pagination.sort_order.toString(),
          family_no: familyNo,
          family_or_person_name: familyOrPersonName,
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

  const result: ApiResponse<PaginationResponse<FamilyItem>> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
