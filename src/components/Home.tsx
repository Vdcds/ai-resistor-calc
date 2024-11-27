"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
// ts-ignore
import Link from "next/link";

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-yellow-300 flex flex-col items-center justify-center p-4">
      <motion.div
        className="max-w-4xl w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-16 h-16 mx-auto text-yellow-300" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Resistance Calculator
          </h1>
          <p className="text-xl text-yellow-100">Fast. Efficient. Simple.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-slate-800 border-yellow-300/20">
            <CardHeader>
              <CardTitle className="text-yellow-300">Why Choose Us?</CardTitle>
              <CardDescription className="text-yellow-100">
                Streamline your electrical calculations with precision and ease.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem icon={Calculator} text="Accurate Calculations" />
              <FeatureItem icon={Zap} text="Intuitive Interface" />
              <FeatureItem icon={ArrowRight} text="Instant Results" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="flex justify-center" variants={itemVariants}>
          <Link href={"/calculate"}>
            <Button
              size="lg"
              className="bg-yellow-300 text-slate-900 hover:bg-yellow-400 "
            >
              Start Calculating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeatureItem = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-center space-x-3 text-yellow-100">
    <Icon className="h-5 w-5 text-yellow-300" />
    <span>{text}</span>
  </div>
);

export default HomePage;
