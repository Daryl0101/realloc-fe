"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../../lib/utils";

const productCreateAPI = `${GlobalConfig.baseAPIPath}/master-data/products/create`;

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type Props = {
  productName: string;
  description: string;
  categories: FoodCategory[];
  halalStatus: HalalStatus;
  servingSize: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  sugar: string;
  fiber: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
};

export const addNewProductAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(productCreateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        name: props.productName,
        description: props.description,
        serving_size: parseFloat(props.servingSize),
        calorie: parseFloat(props.calorie),
        carbohydrate: parseFloat(props.carbohydrate),
        protein: parseFloat(props.protein),
        fat: parseFloat(props.fat),
        fiber: parseFloat(props.fiber),
        sugar: parseFloat(props.sugar),
        saturated_fat: parseFloat(props.saturatedFat),
        cholesterol: parseFloat(props.cholesterol),
        sodium: parseFloat(props.sodium),
        is_halal: props.halalStatus === HalalStatus.Halal,
        food_categories: props.categories.map((category) => category.id),
      }),
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<boolean> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? { success: "Product created successfully" }
    : { error: "Something went wrong" };
};
