"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X, Home, Calculator, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Calculator", path: "/calculate", icon: Calculator },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-white group"
          >
            <div className="relative size-15">
              <Lightbulb></Lightbulb>
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-30"
                initial={false}
                animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold md:text-xl text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
                Resistance Calculator
              </div>
              <div className="text-xs text-yellow-300">
                Electrify Your Calculations
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <Button
                  variant="ghost"
                  className="relative overflow-hidden text-gray-500 hover:text-yellow-400 hover:bg-blue-950/30"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-yellow-300 hover:text-yellow-100 hover:bg-blue-950/30"
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
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden md:hidden bg-blue-950/90 backdrop-blur-lg"
      >
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsOpen(false)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-yellow-300 hover:text-blue-100 hover:bg-blue-900/50"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
};

export default NavBar;
