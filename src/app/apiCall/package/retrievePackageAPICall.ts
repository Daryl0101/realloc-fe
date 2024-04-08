"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import {
  AllocationStatus,
  ApiResponse,
  getErrorMessage,
  PackageStatus,
} from "../../../lib/utils";

// received format
type PackageHistoryItemResponseField = {
  id: string;
  action: PackageStatus;
  cancel_reason: string;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type ProductResponseField = {
  id: string;
  product_no: string;
  name: string;
  description: string;
  is_halal: boolean;
};

type StorageResponseField = {
  id: string;
  storage_no: string;
  description: string;
  is_halal: boolean;
};

type InventoryResponseField = {
  id: string;
  inventory_no: string;
  product: ProductResponseField;
  storage: StorageResponseField;
  expiration_date: string;
  received_date: string;
  total_qty: number;
  available_qty: number;
};

type PackageItemResponseField = {
  id: string;
  inventory: InventoryResponseField;
  quantity: number;
};

type PackageResponse = {
  id: string;
  package_no: string;
  package_items: PackageItemResponseField[];
  package_histories: PackageHistoryItemResponseField[];
  allocation_no: string;
  family_no: string;
  status: PackageStatus;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

// converted format
type PackageHistoryItemResponseFieldCamel = {
  id: string;
  action: PackageStatus;
  cancelReason: string;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type ProductResponseFieldCamel = {
  id: string;
  productNo: string;
  name: string;
  description: string;
  isHalal: boolean;
};

type StorageResponseFieldCamel = {
  id: string;
  storageNo: string;
  description: string;
  isHalal: boolean;
};

type InventoryResponseFieldCamel = {
  id: string;
  inventoryNo: string;
  product: ProductResponseFieldCamel;
  storage: StorageResponseFieldCamel;
  expirationDate: string;
  receivedDate: string;
  totalQty: number;
  availableQty: number;
};

type PackageItemResponseFieldCamel = {
  id: string;
  inventory: InventoryResponseFieldCamel;
  quantity: number;
};

type PackageResponseCamel = {
  id: string;
  packageNo: string;
  packageItems: PackageItemResponseFieldCamel[];
  packageHistories: PackageHistoryItemResponseFieldCamel[];
  allocationNo: string;
  familyNo: string;
  status: PackageStatus;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

export const retrievePackageAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | PackageResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Package ID not found" };
    res = await fetch(`${GlobalConfig.baseAPIPath}/package/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<PackageResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        id: result.model.id,
        packageNo: result.model.package_no,
        packageItems: result.model.package_items.map((item) => ({
          id: item.id,
          inventory: {
            id: item.inventory.id,
            inventoryNo: item.inventory.inventory_no,
            product: {
              id: item.inventory.product.id,
              productNo: item.inventory.product.product_no,
              name: item.inventory.product.name,
              description: item.inventory.product.description,
              isHalal: item.inventory.product.is_halal,
            },
            storage: {
              id: item.inventory.storage.id,
              storageNo: item.inventory.storage.storage_no,
              description: item.inventory.storage.description,
              isHalal: item.inventory.storage.is_halal,
            },
            expirationDate: item.inventory.expiration_date,
            receivedDate: item.inventory.received_date,
            totalQty: item.inventory.total_qty,
            availableQty: item.inventory.available_qty,
          },
          quantity: item.quantity,
        })),
        packageHistories: result.model.package_histories.map((item) => ({
          id: item.id,
          action: item.action,
          cancelReason: item.cancel_reason,
          modifiedAt: item.modified_at,
          modifiedBy: item.modified_by,
          createdAt: item.created_at,
          createdBy: item.created_by,
        })),
        allocationNo: result.model.allocation_no,
        familyNo: result.model.family_no,
        status: result.model.status,
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
