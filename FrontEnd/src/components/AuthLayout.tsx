import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import AppHeader from "./AppHeader";
import NavTab from "./NavTab";

export default function AuthLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f5f9ff 0%, #f7fbff 100%)",
      }}
    >
      <AppHeader />
      <main
        style={{ maxWidth: 1200, margin: "16px auto 88px", padding: "0 16px" }}
      >
        <Outlet />
      </main>
      <NavTab />
    </div>
  );
}
