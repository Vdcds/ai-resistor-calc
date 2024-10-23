import React from "react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export function SignInButton() {
  return (
    <Button onClick={() => signIn()} className="w-full sm:w-auto" size="lg">
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button
      onClick={() => signOut()}
      variant="outline"
      className="w-full sm:w-auto"
      size="lg"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
