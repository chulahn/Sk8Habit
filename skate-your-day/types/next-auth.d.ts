import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    authDatabase?: "primary" | "local";
  }

  interface Session {
    authDatabase?: "primary" | "local";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    authDatabase?: "primary" | "local";
  }
}
