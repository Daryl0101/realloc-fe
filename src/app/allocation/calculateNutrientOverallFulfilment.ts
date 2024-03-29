import { AllocationFamilyStatus, NutrientWeight } from "@/src/lib/utils";

type AllocationFamilyInventoryItem = {
  sequence: number | null;
  inventory: {
    id: number;
    inventory_no: string;
    total_qty: number;
    available_qty: number;
    expiration_date: string;
    received_date: string;
    is_active: boolean;
  };
  quantity: number;
};

type AllocationFamilyItem = {
  id: number;
  sequence: number | null;
  family: {
    id: number;
    family_no: string;
    name: string;
    last_received_date: string;
    is_halal: boolean;
  };
  allocation_family_inventories: AllocationFamilyInventoryItem[];
  status: AllocationFamilyStatus;
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  calorie_needed: string;
  carbohydrate_needed: string;
  protein_needed: string;
  fat_needed: string;
  fiber_needed: string;
  sugar_needed: string;
  saturated_fat_needed: string;
  cholesterol_needed: string;
  sodium_needed: string;
  calorie_allocated: string;
  carbohydrate_allocated: string;
  protein_allocated: string;
  fat_allocated: string;
  fiber_allocated: string;
  sugar_allocated: string;
  saturated_fat_allocated: string;
  cholesterol_allocated: string;
  sodium_allocated: string;
};

export const calculateNutrientOverallFulfilment = (
  props: AllocationFamilyItem
) => {
  return parseFloat(props.calorie_needed) > 0
    ? (parseFloat(props.calorie_allocated) / parseFloat(props.calorie_needed)) *
        ((NutrientWeight.CALORIE * 100) /
          Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.carbohydrate_allocated) /
          parseFloat(props.carbohydrate_needed)) *
          ((NutrientWeight.CARBOHYDRATE * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.protein_allocated) /
          parseFloat(props.protein_needed)) *
          ((NutrientWeight.PROTEIN * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.fat_allocated) / parseFloat(props.fat_needed)) *
          ((NutrientWeight.FAT * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.fiber_allocated) / parseFloat(props.fiber_needed)) *
          ((NutrientWeight.FIBER * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.sugar_allocated) / parseFloat(props.sugar_needed)) *
          ((NutrientWeight.SUGAR * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.saturated_fat_allocated) /
          parseFloat(props.saturated_fat_needed)) *
          ((NutrientWeight.SATURATED_FAT * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.cholesterol_allocated) /
          parseFloat(props.cholesterol_needed)) *
          ((NutrientWeight.CHOLESTEROL * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b)) +
        (parseFloat(props.sodium_allocated) / parseFloat(props.sodium_needed)) *
          ((NutrientWeight.SODIUM * 100) /
            Object.values(NutrientWeight).reduce((a, b) => a + b))
    : 0;
};
