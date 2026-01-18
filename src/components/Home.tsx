"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PiggyBank, Lightbulb, LayoutGrid, Zap } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

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
      icon: Zap,
      title: "Instant Calculations",
      desc: "Get real-time energy estimates as you add appliances. No waiting, no guesswork.",
      gradient: "from-chart-4 to-chart-5",
    },
    {
      icon: PiggyBank,
      title: "Save Money",
      desc: "Identify energy-hungry devices and cut your monthly bills by up to 30%.",
      gradient: "from-chart-2 to-chart-3",
    },
    {
      icon: Lightbulb,
      title: "AI-Powered Tips",
      desc: "Personalized recommendations based on your usage patterns and local rates.",
      gradient: "from-primary to-chart-4",
    },
    {
      icon: LayoutGrid,
      title: "Room by Room",
      desc: "Organize by spaces. See which rooms consume the most and optimize accordingly.",
      gradient: "from-chart-5 to-chart-1",
    },
  ];

  return (
    <div className="min-h-screen pt-16 flex flex-col relative">
      {/* Dotted Glow Background */}
      <DottedGlowBackground
        className="-z-5"
        gap={20}
        radius={1.5}
        color="rgba(97, 68, 10, 0.3)"
        darkColor="rgba(233, 212, 179, 0.2)"
        glowColor="rgba(163, 168, 92, 0.7)"
        darkGlowColor="rgba(139, 144, 110, 0.8)"
        opacity={0.5}
        speedMin={0.3}
        speedMax={1.0}
        speedScale={0.8}
      />

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              {t("home", "badge")}
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">{t("home", "title")}</span>
              <br />
              <span className="gradient-text">{t("home", "titleHighlight")}</span>
              <br />
              <span className="relative inline-block text-foreground">
                {t("home", "titleEnd")}
                <svg
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] h-3 opacity-60"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 5.5C40 2 80 1.5 100 3C120 4.5 160 5 197 2.5"
                    stroke="url(#underlineGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="hsl(var(--chart-4))" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
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
              <HoverBorderGradient
                containerClassName="rounded-md shadow-md hover:shadow-lg transition-shadow"
                className="flex items-center gap-1.5 bg-background text-foreground px-6 py-3 text-base font-bold uppercase"
                duration={1.5}
              >
                {t("home", "startCalculating")}
                <ArrowRight className="h-5 w-5" />
              </HoverBorderGradient>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title + index}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                {/* Outer card */}
                <div className="group p-1 rounded-2xl bg-gradient-to-br from-border/80 via-border/40 to-border/80 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  {/* Inner card */}
                  <div className="p-6 rounded-xl bg-card h-full flex flex-col">
                    {/* Icon container with gradient background */}
                    <div className="mb-5">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                        <feature.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How to Use Section */}
      <section className="px-6 py-20">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple steps anyone can follow. No technical knowledge needed.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Horizontal line - hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-chart-4 to-chart-5"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
              {[
                {
                  step: 1,
                  title: "Open the App",
                  desc: "Click 'Start Calculating' button above. It's free!",
                  emoji: "👆",
                },
                {
                  step: 2,
                  title: "Add Your Items",
                  desc: "Select appliances like fan, TV, fridge from the list.",
                  emoji: "📺",
                },
                {
                  step: 3,
                  title: "Set Usage Hours",
                  desc: "Tell us how many hours you use each item daily.",
                  emoji: "⏰",
                },
                {
                  step: 4,
                  title: "See Your Bill",
                  desc: "Instantly see your estimated monthly electricity cost.",
                  emoji: "💡",
                },
                {
                  step: 5,
                  title: "Get Tips",
                  desc: "We'll show you easy ways to reduce your bill.",
                  emoji: "💰",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative flex flex-col items-center text-center group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Step number circle */}
                  <motion.div
                    className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mb-4 shadow-lg group-hover:border-primary group-hover:shadow-xl transition-all duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-2xl group-hover:hidden transition-all">{item.step}</span>
                    <span className="text-2xl hidden group-hover:block">{item.emoji}</span>
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom Gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Footer */}
      <footer className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
          <h2 className="text-6xl sm:text-8xl md:text-9xl font-bold text-foreground tracking-tight mb-6">
            Energy<span className="text-primary">Calc</span>
          </h2>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Made in India, for India 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
