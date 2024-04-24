"use server";

import { getErrorMessage, OFFPaginatedResponse } from "../../lib/utils";

type OFFNutrimentsResult = {
  "energy-kcal": number;
  carbohydrates: number;
  carbohydrates_unit: string;
  proteins: number;
  proteins_unit: string;
  fat: number;
  fat_unit: string;
  sugars: number;
  sugars_unit: string;
  fiber: number;
  fiber_unit: string;
  "saturated-fat": number;
  "saturated-fat_unit": string;
  sodium: number;
  sodium_unit: string;
};

type OFFResult = {
  code: string;
  nutriments: OFFNutrimentsResult;
  product_name: string;
  serving_quantity: string;
};

const OFFSearchAPI = "https://world.openfoodfacts.net/cgi/search.pl";

export const searchOFFAPICall = async (searchString: string) => {
  var res = null;
  try {
    res = await fetch(
      OFFSearchAPI +
        "?" +
        new URLSearchParams({
          search_terms: searchString,
          fields: [
            "code",
            "product_name",
            "nutriments",
            "serving_quantity",
            "serving_quantity_unit",
            "serving_size",
            // "brands",
            // "categories",
          ].join(","),
          json: "true",
          page_size: "100",
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: OFFPaginatedResponse<OFFResult> = await res.json();

  if (!res.ok) {
    return {
      error: "Failed to fetch data from Open Food Facts API",
    };
  }

  return {
    ...result,
    products: result.products
      .filter((product) => product.product_name)
      .map((product) => {
        return {
          code: product.code,
          product_name: product.product_name,
          serving_quantity: product.serving_quantity ?? "1",
          nutriments: {
            "energy-kcal": product.nutriments["energy-kcal"] ?? 0,
            carbohydrates: product.nutriments.carbohydrates ?? 0,
            carbohydrates_unit: product.nutriments.carbohydrates_unit ?? 0,
            proteins: product.nutriments.proteins ?? 0,
            proteins_unit: product.nutriments.proteins_unit ?? 0,
            fat: product.nutriments.fat ?? 0,
            fat_unit: product.nutriments.fat_unit ?? 0,
            sugars: product.nutriments.sugars ?? 0,
            sugars_unit: product.nutriments.sugars_unit ?? 0,
            fiber: product.nutriments.fiber ?? 0,
            fiber_unit: product.nutriments.fiber_unit ?? 0,
            "saturated-fat": product.nutriments["saturated-fat"] ?? 0,
            "saturated-fat_unit": product.nutriments["saturated-fat_unit"] ?? 0,
            sodium: product.nutriments.sodium ?? 0,
            sodium_unit: product.nutriments.sodium_unit ?? 0,
          },
        };
      }),
  };
};
