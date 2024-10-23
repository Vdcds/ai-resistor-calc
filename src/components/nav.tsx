"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Calculator, Home, Calendar, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "@/components/auth/authbuttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/lib/types/navtypes";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    { name: "Home", path: "/" },
    { name: "Calculator", path: "/calculator" },
    { name: "History", path: "/history" },
    { name: "About", path: "/about" },
  ];

  const iconMap = {
    Home: <Home className="w-4 h-4 mr-2" />,
    Calculator: <Calculator className="w-4 h-4 mr-2" />,
    History: <Calendar className="w-4 h-4 mr-2" />,
    About: <Users className="w-4 h-4 mr-2" />,
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-black/50 backdrop-blur-lg border-gray-800">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-white">
              <div className="relative w-10 h-10 mr-2">
                <Image
                  src="/images/logo.jpeg"
                  alt="Logo"
                  fill
                  className="rounded-full"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold md:text-xl">
                  Resistance Calculator
                </div>
                <div className="text-xs text-gray-400">
                  Calculate with Confidence
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 transition-colors rounded-md hover:text-white hover:bg-gray-800"
                >
                  {iconMap[item.name as keyof typeof iconMap]}
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="h-6 mx-4 border-l border-gray-700" />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative w-8 h-8 rounded-full"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {session && (
              <Avatar className="w-8 h-8 mr-4">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-800 md:hidden bg-black/50 backdrop-blur-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-800"
                >
                  {iconMap[item.name as keyof typeof iconMap]}
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                {session ? <SignOutButton /> : <SignInButton />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
