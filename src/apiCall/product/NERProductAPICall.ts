"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  ApiResponse,
  DataURIToBlob,
  HalalStatus,
  getErrorMessage,
} from "../../lib/utils";

type ProductNERResponse = {
  serving_size: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  saturated_fat: string;
  cholesterol: string;
  sodium: string;
};

const productNERAPI = `${process.env.BASE_API_PATH}/master-data/products/ner`;

export const NERProductAPICall = async (image: string | null) => {
  const session = await getServerSession(options);
  var res = null;
  if (!image) {
    return { error: "No image found" };
  }
  try {
    const formData = new FormData();
    formData.append("image", DataURIToBlob(image), "new-image.jpg");
    res = await fetch(productNERAPI, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Token ${session?.user.token}`,
      },
      body: formData,
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<ProductNERResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        servingSize: result.model.serving_size,
        calorie: result.model.calorie,
        carbohydrate: result.model.carbohydrate,
        protein: result.model.protein,
        fat: result.model.fat,
        sugar: result.model.sugar,
        fiber: result.model.fiber,
        saturatedFat: result.model.saturated_fat,
        cholesterol: result.model.cholesterol,
        sodium: result.model.sodium,
      }
    : { error: "Something went wrong" };
};
