import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { Role } from "@/src/lib/utils";
import AllocationInternal from "./page-internal";
import { redirect } from "next/navigation";

const Allocation = async () => {
  const session = await getServerSession(options);
  if (session?.user.role === Role.manager) {
    return <AllocationInternal />;
  } else redirect("/");
};

export default Allocation;
