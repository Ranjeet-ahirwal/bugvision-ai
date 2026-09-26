import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(
      "bugvision_user"
    );

    const token = localStorage.getItem(
      "bugvision_token"
    );

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("bugvision_user");
        localStorage.removeItem("bugvision_token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password
      }
    );

    const { token, user } = response.data;

    localStorage.setItem(
      "bugvision_token",
      token
    );

    localStorage.setItem(
      "bugvision_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password
      }
    );

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(
      "bugvision_token"
    );

    localStorage.removeItem(
      "bugvision_user"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};