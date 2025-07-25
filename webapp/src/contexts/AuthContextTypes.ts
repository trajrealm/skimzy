import { createContext } from "react";

interface DecodedToken {
  sub: number;
  email?: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type { DecodedToken, AuthContextType };