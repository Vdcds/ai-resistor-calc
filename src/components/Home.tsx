"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Calculator, ArrowRight, Sparkles, TrendingDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

const HomePage = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const features = [
    {
      icon: Calculator,
      titleKey: "featureCalculateTitle",
      descKey: "featureCalculateDesc",
    },
    {
      icon: TrendingDown,
      titleKey: "featureCostsTitle",
      descKey: "featureCostsDesc",
    },
    {
      icon: Sparkles,
      titleKey: "featureTipsTitle",
      descKey: "featureTipsDesc",
    },
    {
      icon: Shield,
      titleKey: "featureRoomsTitle",
      descKey: "featureRoomsDesc",
    },
  ];

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <motion.div
          className="max-w-5xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              {t("home", "badge")}
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">{t("home", "title")}</span>
              <br />
              <span className="gradient-text">{t("home", "titleHighlight")}</span>
              <br />
              <span className="text-foreground">{t("home", "titleEnd")}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("home", "description")}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            variants={itemVariants}
          >
            <Link href="/calculate">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0"
                >
                  {t("home", "startCalculating")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium border-border/50 hover:bg-secondary/80"
              >
                {t("home", "learnMore")}
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey + index}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-amber-500/30 hover:bg-card/80 transition-all duration-300 h-full">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t("home", feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("home", feature.descKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Bottom Gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Footer */}
      <footer className="py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Energy Calculator</span>
          </div>
          <span>Built with precision</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
