import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function useAuth() {
  const context = useContext(AuthContext); // calling useAuth() is easier than useContext(AuthContext) everywhere

  if (context === undefined) {//Developer Safety Net: Forgetting to wrap <App /> with <AuthProvider>
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export default useAuth;
