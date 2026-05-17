import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NavBar } from "../components/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <NavBar />
        {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
