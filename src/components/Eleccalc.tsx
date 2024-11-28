/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TabsContent } from "@radix-ui/react-tabs";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const ElectricalCalculator = () => {
  const [power, setPower] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [voltage, setVoltage] = useState<number | null>(null);
  const [resistance, setResistance] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [rate, setRate] = useState(2);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMissingValues = () => {
    try {
      let newPower = power;
      let newCurrent = current;
      let newVoltage = voltage;
      let newResistance = resistance;

      // Validate input values first
      if (
        [power, current, voltage, resistance].some(
          (val) => val !== null && val <= 0
        )
      ) {
        throw new Error("Values must be greater than 0");
      }

      const knownValues = [power, current, voltage, resistance].filter(
        (val) => val !== null
      ).length;

      if (knownValues < 2) {
        throw new Error(
          "Please enter at least two values to calculate the others"
        );
      }

      // Calculate missing values using Ohm's Law and Power equations
      if (voltage && current) {
        // V and I known
        newResistance = voltage / current; // R = V/I
        newPower = voltage * current; // P = V*I
      } else if (voltage && resistance) {
        // V and R known
        newCurrent = voltage / resistance; // I = V/R
        newPower = (voltage * voltage) / resistance; // P = V²/R
      } else if (current && resistance) {
        // I and R known
        newVoltage = current * resistance; // V = I*R
        newPower = current * current * resistance; // P = I²*R
      } else if (power && current) {
        // P and I known
        newVoltage = power / current; // V = P/I
        newResistance = power / (current * current); // R = P/I²
      } else if (power && voltage) {
        // P and V known
        newCurrent = power / voltage; // I = P/V
        newResistance = (voltage * voltage) / power; // R = V²/P
      }

      // Round to 3 decimal places for more precision
      setPower(Number(newPower?.toFixed(3)));
      setCurrent(Number(newCurrent?.toFixed(3)));
      setVoltage(Number(newVoltage?.toFixed(3)));
      setResistance(Number(newResistance?.toFixed(3)));

      setError(null); // Clear any previous errors
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const calculateCost = () => {
    if (!power) return "0.000";
    const powerInKW = power / 1000;
    const energyKWh = powerInKW * duration;
    const cost = energyKWh * rate;
    return cost.toFixed(3); // More precise cost calculation
  };

  const getEnergySavingTips = async () => {
    if (!power) {
      setTips(["Please calculate power consumption first"]);
      return;
    }

    setLoading(true);
    try {
      const powerKW = power / 1000;
      const costPerDay = (powerKW * duration * rate).toFixed(2);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Device consuming ${powerKW}kW for ${duration} hours per day, costing ₹${costPerDay} per day at ₹${rate}/kWh.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch tips");

      const tipsData = await response.json();
      setTips(Array.isArray(tipsData) ? tipsData : [tipsData]);
    } catch (error: unknown) {
      setTips(["Unable to fetch tips. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6">
      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.2 }}
      >
        {/* Header */}
        <motion.div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Zap className="w-16 h-16 mx-auto text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            Electrical Calculator
          </h1>
          <p className="text-gray-300">
            Effortlessly calculate electrical parameters and estimate costs.
          </p>
        </motion.div>

        {/* Input Section */}
        <Card className="bg-gray-800/50 border border-yellow-400/20 rounded-xl shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400">Input Values</CardTitle>
            <CardDescription>
              Enter known values to calculate missing parameters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="power" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-lg bg-gray-700/50">
                <TabsTrigger value="power">Power (W)</TabsTrigger>
                <TabsTrigger value="current">Current (A)</TabsTrigger>
                <TabsTrigger value="voltage">Voltage (V)</TabsTrigger>
                <TabsTrigger value="resistance">Resistance (Ω)</TabsTrigger>
              </TabsList>
              <TabsContent value="power">
                <Label htmlFor="power">Power (Watts)</Label>
                <Input
                  id="power"
                  type="number"
                  value={power || ""}
                  onChange={(e) => setPower(Number(e.target.value))}
                  className="bg-gray-700/50 border-gray-600"
                />
              </TabsContent>
              <TabsContent value="current">
                <Label htmlFor="current">Current (Amps)</Label>
                <Input
                  id="current"
                  type="number"
                  value={current || ""}
                  onChange={(e) => setCurrent(Number(e.target.value))}
                  className="bg-gray-700/50 border-gray-600"
                />
              </TabsContent>
              <TabsContent value="voltage">
                <Label htmlFor="voltage">Voltage (Volts)</Label>
                <Input
                  id="voltage"
                  type="number"
                  value={voltage || ""}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="bg-gray-700/50 border-gray-600"
                />
              </TabsContent>
              <TabsContent value="resistance">
                <Label htmlFor="resistance">Resistance (Ohms)</Label>
                <Input
                  id="resistance"
                  type="number"
                  value={resistance || ""}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="bg-gray-700/50 border-gray-600"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button
              onClick={calculateMissingValues}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all duration-300"
            >
              Calculate Missing Values
            </Button>
          </CardFooter>
        </Card>

        {/* Results Section */}
        <Card className="bg-gray-800/50 border border-yellow-400/20 rounded-xl shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400">Results</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ResultItem label="Power" value={power} unit="W" />
            <ResultItem label="Current" value={current} unit="A" />
            <ResultItem label="Voltage" value={voltage} unit="V" />
            <ResultItem label="Resistance" value={resistance} unit="Ω" />
          </CardContent>
        </Card>

        {/* Cost Estimation Section */}
        <Card className="bg-gray-800/50 border border-yellow-400/20 rounded-xl shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400">Cost Estimation</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Slider
              id="duration"
              min={2}
              max={24}
              step={1}
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              className="my-4"
            />
            <div className="text-right">{duration} hours</div>
            <Label htmlFor="rate">Rate (₹/kWh)</Label>
            <Slider
              id="rate"
              min={2}
              max={10}
              step={0.1}
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              className="my-4"
            />
            <div className="text-right">₹{rate.toFixed(2)}/kWh</div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span>Estimated Cost:</span>
            <span className="text-2xl text-yellow-400 font-bold">
              ₹{calculateCost()}
            </span>
          </CardFooter>
        </Card>

        {/* Tips Section */}
        <Card className="bg-gray-800/50 border border-yellow-400/20 rounded-xl shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              Energy Saving Tips
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get personalized tips based on your energy usage.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={getEnergySavingTips}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300"
            >
              {loading ? "Fetching Tips..." : "Get Energy Saving Tips"}
            </Button>
          </CardFooter>
          <CardContent className="space-y-2">
            {tips.length === 0 ? (
              <p className="text-gray-400 text-center">
                No tips available yet. Click the button above to get
                personalized tips.
              </p>
            ) : (
              tips.map((tip, index) => (
                <Alert
                  key={index}
                  className="bg-green-900/30 border-green-500/50"
                >
                  <Sparkles className="text-green-400" />
                  <AlertDescription>{tip}</AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const ResultItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) => (
  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
    <span className="text-gray-300">{label}:</span>
    <span className="font-semibold text-yellow-400">
      {value !== null ? value.toFixed(2) : "—"} {unit}
    </span>
  </div>
);

export default ElectricalCalculator;
