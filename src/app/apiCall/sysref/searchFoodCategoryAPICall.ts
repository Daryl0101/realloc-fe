"use server";

import GlobalConfig from "../../../../app.config";
import { getServerSession } from "next-auth";

import { options } from "../../api/auth/[...nextauth]/options";
import {
  ApiResponse,
  HalalStatus,
  PaginationResponse,
  getErrorMessage,
} from "../../../lib/utils";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

const foodCategorySearchAPI = `${GlobalConfig.baseAPIPath}/system-reference/food-categories/search`;

export const searchFoodCategoryAPICall = async (searchString: string) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      foodCategorySearchAPI +
        "?" +
        new URLSearchParams({
          search_string: searchString,
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

  const result: ApiResponse<PaginationResponse<FoodCategory>> =
    await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model.items : { error: "Something went wrong" };
};
