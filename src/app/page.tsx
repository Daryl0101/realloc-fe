import { getServerSession } from "next-auth";
import React from "react";
import { options } from "./api/auth/[...nextauth]/options";
import { Role } from "../lib/utils";
import HomeInternal from "./page-internal";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await getServerSession(options);
  if (session?.user.role === Role.manager) {
    return <HomeInternal />;
  } else redirect("/family");
};

export default Home;
