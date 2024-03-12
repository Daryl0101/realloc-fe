"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, DropdownItem, getErrorMessage } from "../../../lib/utils";

const activityLevelDropdownAPI = `${GlobalConfig.baseAPIPath}/master-data/families/activity-level/dropdown`;

export const retrieveActivityLevelDropdownAPICall = async () => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(activityLevelDropdownAPI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<DropdownItem[]> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
