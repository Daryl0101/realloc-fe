"use client";
import { signOut, useSession } from "next-auth/react";

import React from "react";

const Food = () => {
  const { data: session } = useSession();
  console.log(session);
  const handleLogout = () => {
    signOut();
  };
  if (session?.user) {
    return (
      <button type="submit" onClick={handleLogout}>
        Logout
      </button>
    );
  }
  return <div>Food</div>;
};

export default Food;
