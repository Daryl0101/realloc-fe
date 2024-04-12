"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../lib/utils";

type StorageResponse = {
  storage_no: string;
  description: string;
  is_halal: boolean;
  // is_active: boolean;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type StorageResponseCamel = {
  storageNo: string;
  description: string;
  halalStatus: HalalStatus;
  // isActive: boolean;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

export const retrieveStorageAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | StorageResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Storage ID not found" };
    res = await fetch(
      `${process.env.BASE_API_PATH}/system-reference/storages/${id}`,
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

  const result: ApiResponse<StorageResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        storageNo: result.model.storage_no,
        description: result.model.description,
        halalStatus: result.model.is_halal
          ? HalalStatus.Halal
          : HalalStatus["Non Halal"],
        // isActive: result.model.is_active,
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
