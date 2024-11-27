"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Battery,
  Lightbulb,
  Gauge,
  IndianRupee,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ElectricalCalculator = () => {
  const [power, setPower] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [voltage, setVoltage] = useState<number | null>(null);
  const [resistance, setResistance] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [rate, setRate] = useState(5);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateMissing = () => {
    if (power && voltage) {
      setCurrent(power / voltage);
      setResistance(voltage / power);
    } else if (power && current) {
      setVoltage(power / current);
      setResistance(voltage / current);
    } else if (voltage && current) {
      setPower(voltage * current);
      setResistance(voltage / current);
    } else if (voltage && resistance) {
      setPower((voltage * voltage) / resistance);
      setCurrent(voltage / resistance);
    }
  };

  const calculateCost = () => {
    if (power) {
      const powerInKW = power / 1000;
      const totalHours = duration;
      const energyKWh = powerInKW * totalHours;
      const cost = energyKWh * rate;
      return cost.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "0.00";
  };

  const getTips = async () => {
    if (!power) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Based on these electrical measurements:
            - Power Usage: ${power} watts
            - Duration: ${duration} hours
            - Estimated Cost: ₹${calculateCost()}
            - Rate: ₹${rate}/kWh

            Provide 3 specific, practical electricity saving tips for Indian households using this pattern.
            Consider Indian voltage standards (230V), local climate, and common Indian appliances.
            Focus on actionable tips to reduce consumption and cost.
            Format each tip in a clear, concise sentence.`,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      let tipsText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tipsText += new TextDecoder().decode(value);
      }

      const tipsList = tipsText
        .split("\n")
        .filter((tip) => tip.trim())
        .slice(0, 3);

      setTips(tipsList);
    } catch (error) {
      console.error("Error fetching tips:", error);
      setTips(["Unable to load tips at this time. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-4 md:p-8">
      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <Zap className="w-16 h-16 mx-auto text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Power Calculator
          </h1>
          <p className="text-xl text-gray-300">
            Calculate electrical factors and get smart saving tips
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">
                Electrical Values
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter known values to calculate the rest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="power" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="power">Power</TabsTrigger>
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="voltage">Voltage</TabsTrigger>
                  <TabsTrigger value="resistance">Resistance</TabsTrigger>
                </TabsList>
                <TabsContent value="power" className="space-y-4">
                  <Label htmlFor="power">Power (Watts)</Label>
                  <Input
                    id="power"
                    type="number"
                    placeholder="Enter power"
                    value={power || ""}
                    onChange={(e) => setPower(parseFloat(e.target.value))}
                  />
                </TabsContent>
                <TabsContent value="current" className="space-y-4">
                  <Label htmlFor="current">Current (Amperes)</Label>
                  <Input
                    id="current"
                    type="number"
                    placeholder="Enter current"
                    value={current || ""}
                    onChange={(e) => setCurrent(parseFloat(e.target.value))}
                  />
                </TabsContent>
                <TabsContent value="voltage" className="space-y-4">
                  <Label htmlFor="voltage">Voltage (Volts)</Label>
                  <Input
                    id="voltage"
                    type="number"
                    placeholder="Enter voltage"
                    value={voltage || ""}
                    onChange={(e) => setVoltage(parseFloat(e.target.value))}
                  />
                </TabsContent>
                <TabsContent value="resistance" className="space-y-4">
                  <Label htmlFor="resistance">Resistance (Ohms)</Label>
                  <Input
                    id="resistance"
                    type="number"
                    placeholder="Enter resistance"
                    value={resistance || ""}
                    onChange={(e) => setResistance(parseFloat(e.target.value))}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                onClick={calculateMissing}
                className="w-full bg-black text-white hover:bg-gray-900"
              >
                Calculate Values
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Results</CardTitle>
              <CardDescription className="text-gray-300">
                Calculated electrical measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ResultItem icon={Battery} label="Power" value={power} unit="W" />
              <ResultItem icon={Zap} label="Current" value={current} unit="A" />
              <ResultItem
                icon={Lightbulb}
                label="Voltage"
                value={voltage}
                unit="V"
              />
              <ResultItem
                icon={Gauge}
                label="Resistance"
                value={resistance}
                unit="Ω"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">
                Cost Calculation
              </CardTitle>
              <CardDescription className="text-gray-300">
                Estimate your electricity cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Slider
                  id="duration"
                  min={1}
                  max={24}
                  step={1}
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                />
                <div className="text-right text-sm text-gray-400">
                  {duration} hours
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Rate (₹/kWh)</Label>
                <Slider
                  id="rate"
                  min={1}
                  max={10}
                  step={0.1}
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                />
                <div className="text-right text-sm text-gray-400">
                  ₹{rate.toFixed(2)}/kWh
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-lg font-semibold">Estimated Cost:</div>
              <div className="text-2xl font-bold text-yellow-400 flex items-center">
                <IndianRupee className="w-6 h-6 mr-1" />
                {calculateCost()}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Smart Saving Tips
              </CardTitle>
              <CardDescription className="text-gray-300">
                Get AI-powered recommendations to reduce your electricity usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={getTips}
                className="w-full bg-black text-white hover:bg-gray-900"
                disabled={!power || loading}
              >
                {loading ? "Generating Tips..." : "Get Saving Tips"}
              </Button>

              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <Alert
                    key={index}
                    className="bg-gray-700 border-yellow-400/20"
                  >
                    <AlertDescription className="text-gray-100">
                      {tip}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

const ResultItem = ({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  unit: string;
}) => (
  <div className="flex items-center space-x-3 text-gray-300">
    <Icon className="h-5 w-5 text-yellow-400" />
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-lg font-semibold">
        {value ? `${value.toFixed(2)} ${unit}` : "-"}
      </div>
    </div>
  </div>
);

export default ElectricalCalculator;
