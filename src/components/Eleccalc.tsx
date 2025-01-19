"use client";
import React, { useState } from "react";
import { Plus, Trash2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

interface Equipment {
  id: string;
  name: string;
  watts: number;
}

interface Room {
  id: string;
  name: string;
  equipment: Equipment[];
  totalPower: number;
  totalCost: number;
}

const ElectricalCalculator = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [duration, setDuration] = useState(8);
  const [rate, setRate] = useState(5);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateRoomValues = (room: Room): Room => {
    const totalPower = room.equipment.reduce(
      (acc, eq) => acc + (eq.watts || 0),
      0
    );
    const powerInKW = totalPower / 1000;
    const totalCost = powerInKW * duration * rate;

    return {
      ...room,
      totalPower,
      totalCost,
    };
  };

  const getTotalHouseholdValues = () => {
    const totalPower = rooms.reduce((acc, room) => acc + room.totalPower, 0);
    const powerInKW = totalPower / 1000;
    const totalCost = powerInKW * duration * rate;
    const dailyCost = totalCost;
    const monthlyCost = dailyCost * 30;

    return {
      totalPower,
      powerInKW,
      dailyCost,
      monthlyCost,
    };
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: `Room ${rooms.length + 1}`,
      equipment: [],
      totalPower: 0,
      totalCost: 0,
    };
    setRooms([...rooms, newRoom]);
  };

  const addEquipment = (roomId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = {
            ...room,
            equipment: [
              ...room.equipment,
              {
                id: crypto.randomUUID(),
                name: "New Equipment",
                watts: 0,
              },
            ],
          };
          return calculateRoomValues(updatedRoom);
        }
        return room;
      })
    );
  };

  const updateEquipment = (
    roomId: string,
    equipmentId: string,
    updates: Partial<Equipment>
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = {
            ...room,
            equipment: room.equipment.map((eq) =>
              eq.id === equipmentId ? { ...eq, ...updates } : eq
            ),
          };
          return calculateRoomValues(updatedRoom);
        }
        return room;
      })
    );
  };

  const removeEquipment = (roomId: string, equipmentId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = {
            ...room,
            equipment: room.equipment.filter((eq) => eq.id !== equipmentId),
          };
          return calculateRoomValues(updatedRoom);
        }
        return room;
      })
    );
  };

  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter((room) => room.id !== roomId));
  };

  const getEnergySavingTips = async () => {
    const { powerInKW, dailyCost, monthlyCost } = getTotalHouseholdValues();

    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `House consuming ${powerInKW.toFixed(
            2
          )}kW for ${duration} hours per day, costing ₹${dailyCost.toFixed(
            2
          )} per day and ₹${monthlyCost.toFixed(
            2
          )} per month at ₹${rate}/kWh. Main power consumers are: ${rooms
            .map((room) => `${room.name} (${room.totalPower}W)`)
            .join(", ")}.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch tips");

      const tipsData = await response.json();
      setTips(Array.isArray(tipsData) ? tipsData : [tipsData]);
    } catch (error) {
      console.error("Error fetching tips:", error);
      setTips(["Unable to fetch tips. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  const householdValues = getTotalHouseholdValues();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            Household Energy Calculator
          </h1>
          <p className="text-gray-300">
            Calculate your home&apos;s energy consumption and get personalized
            saving tips
          </p>
        </div>

        <Card className="bg-gray-800/50 border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400">Usage Settings</CardTitle>
            <CardDescription>
              Set your daily usage and electricity rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label>Daily Usage (hours)</label>
                <span>{duration} hours</span>
              </div>
              <Slider
                min={1}
                max={24}
                step={1}
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label>Electricity Rate (₹/kWh)</label>
                <span>₹{rate}/kWh</span>
              </div>
              <Slider
                min={1}
                max={20}
                step={0.5}
                value={[rate]}
                onValueChange={([value]) => setRate(value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={addRoom}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="mr-2" /> Add Room
        </Button>

        <div className="grid gap-6">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input
                    value={room.name}
                    onChange={(e) =>
                      setRooms(
                        rooms.map((r) =>
                          r.id === room.id ? { ...r, name: e.target.value } : r
                        )
                      )
                    }
                    className="text-xl font-bold w-48"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeRoom(room.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {room.equipment.map((equipment) => (
                  <div key={equipment.id} className="flex gap-4 items-center">
                    <Input
                      placeholder="Equipment name"
                      value={equipment.name}
                      onChange={(e) =>
                        updateEquipment(room.id, equipment.id, {
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Watts"
                      value={equipment.watts || ""}
                      onChange={(e) =>
                        updateEquipment(room.id, equipment.id, {
                          watts: Number(e.target.value),
                        })
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeEquipment(room.id, equipment.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addEquipment(room.id)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="mr-2" /> Add Equipment
                </Button>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Room Power:</span>
                    <span className="font-semibold text-yellow-400">
                      {room.totalPower.toFixed(2)} W
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Daily Cost:</span>
                    <span className="font-semibold text-green-400">
                      ₹{room.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-800/50 border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400">Household Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Power Consumption:</span>
              <span className="font-semibold text-yellow-400">
                {householdValues.powerInKW.toFixed(2)} kW
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Daily Cost:</span>
              <span className="font-semibold text-green-400">
                ₹{householdValues.dailyCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Monthly Cost:</span>
              <span className="font-semibold text-green-400">
                ₹{householdValues.monthlyCost.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              Energy Saving Tips
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Get personalized tips based on your household energy
                      usage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={getEnergySavingTips}
              disabled={loading || rooms.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? "Fetching Tips..." : "Get Energy Saving Tips"}
            </Button>
            {tips.map((tip, index) => (
              <Alert
                key={index}
                className="bg-green-900/30 border-green-500/50"
              >
                <Sparkles className="text-green-400" />
                <AlertDescription>{tip}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ElectricalCalculator;
