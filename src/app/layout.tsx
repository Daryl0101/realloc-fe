// import "./globals.css";
import Providers from "../lib/providers";
import * as React from "react";
import Box from "@mui/material/Box";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Navigation from "../components/navigation";
import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { CssBaseline } from "@mui/material";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(options);
  return (
    <html lang="en">
      <body>
        <Providers>
          <CssBaseline />
          <Box sx={{ display: "flex" }}>
            {session ? (
              <Navigation
                user={{
                  id: session.user.id,
                  email: session.user.email,
                  role: session.user.role,
                }}
              />
            ) : null}
            <Box
              component="main"
              sx={{
                overflow: "hidden",
                // height: "100vh",
                flexGrow: 1,
                p: 3,
                marginTop: 8,
              }}
            >
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
