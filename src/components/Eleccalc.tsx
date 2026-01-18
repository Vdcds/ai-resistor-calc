"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Zap,
  Home,
  ChevronDown,
  Loader2,
  Minus,
  Search,
  Check,
  Download,
  FileText,
  User,
} from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import { useLanguage } from "@/lib/language-context";
import { translations, Language } from "@/lib/translations";

// Predefined equipment list with typical wattage
const EQUIPMENT_PRESETS = [
  { nameKey: "LED Bulb (9W)", watts: 10, icon: "💡" },
  { nameKey: "CFL Bulb (15W)", watts: 15, icon: "💡" },
  { nameKey: "Tube Light (36W)", watts: 40, icon: "💡" },
  { nameKey: "Ceiling Fan", watts: 75, icon: "🌀" },
  { nameKey: "Table Fan", watts: 50, icon: "🌀" },
  { nameKey: "Split AC (1 Ton)", watts: 1000, icon: "❄️" },
  { nameKey: "Split AC (1.5 Ton)", watts: 1500, icon: "❄️" },
  { nameKey: "Window AC (1.5 Ton)", watts: 2000, icon: "❄️" },
  { nameKey: "Refrigerator (Single Door)", watts: 150, icon: "🧊" },
  { nameKey: "Refrigerator (Double Door)", watts: 250, icon: "🧊" },
  { nameKey: "Washing Machine", watts: 500, icon: "🧺" },
  { nameKey: "Microwave Oven", watts: 1200, icon: "📻" },
  { nameKey: "Electric Kettle", watts: 1500, icon: "☕" },
  { nameKey: "Television (LED 32\")", watts: 100, icon: "📺" },
  { nameKey: "Television (LED 55\")", watts: 150, icon: "📺" },
  { nameKey: "Computer/PC", watts: 200, icon: "🖥️" },
  { nameKey: "Laptop", watts: 50, icon: "💻" },
  { nameKey: "WiFi Router", watts: 10, icon: "📶" },
  { nameKey: "Mobile Charger", watts: 5, icon: "🔌" },
  { nameKey: "Water Heater (Geyser)", watts: 2000, icon: "🚿" },
  { nameKey: "Iron", watts: 1000, icon: "👔" },
  { nameKey: "Exhaust Fan", watts: 30, icon: "🌬️" },
  { nameKey: "Water Pump (0.5 HP)", watts: 750, icon: "💧" },
  { nameKey: "Mixer Grinder", watts: 500, icon: "🥤" },
  { nameKey: "Induction Cooktop", watts: 1800, icon: "🍳" },
  { nameKey: "Room Heater", watts: 1500, icon: "🔥" },
  { nameKey: "Air Cooler", watts: 200, icon: "🌊" },
];

// Helper function to get equipment name in current language
const getEquipmentName = (nameKey: string, language: Language): string => {
  const eq = translations.equipment[nameKey as keyof typeof translations.equipment];
  if (eq) {
    return eq[language] || nameKey;
  }
  return nameKey;
};

interface Equipment {
  id: string;
  name: string;
  nameKey?: string;
  watts: number;
  quantity: number;
}

interface Room {
  id: string;
  name: string;
  equipment: Equipment[];
  totalPower: number;
  totalCost: number;
  isExpanded: boolean;
}

// Equipment Selector Component
const EquipmentSelector = ({
  equipment,
  onUpdate,
  onRemove,
  language,
  t,
}: {
  equipment: Equipment;
  onUpdate: (updates: Partial<Equipment>) => void;
  onRemove: () => void;
  language: Language;
  t: (section: string, key: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const wattsInputRef = useRef<HTMLInputElement>(null);

  // Get translated equipment names for filtering
  const getPresetDisplayName = (nameKey: string) => getEquipmentName(nameKey, language);

  const filteredPresets = EQUIPMENT_PRESETS.filter((preset) => {
    const displayName = getPresetDisplayName(preset.nameKey);
    return displayName.toLowerCase().includes(search.toLowerCase()) ||
           preset.nameKey.toLowerCase().includes(search.toLowerCase());
  });

  const selectedPreset = EQUIPMENT_PRESETS.find(
    (p) => p.nameKey === equipment.nameKey || p.nameKey === equipment.name
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (preset: (typeof EQUIPMENT_PRESETS)[0]) => {
    onUpdate({ name: getPresetDisplayName(preset.nameKey), nameKey: preset.nameKey, watts: preset.watts });
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(0);
  };

  const handleCustomInput = () => {
    if (search.trim()) {
      onUpdate({ name: search.trim(), nameKey: undefined });
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(0);
    }
  };

  // Get display name for current equipment
  const getEquipmentDisplayName = () => {
    if (equipment.nameKey) {
      return getPresetDisplayName(equipment.nameKey);
    }
    return equipment.name;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredPresets.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredPresets.length > 0) {
          handleSelect(filteredPresets[highlightedIndex]);
        } else if (search.trim()) {
          handleCustomInput();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 p-4 rounded-2xl bg-gradient-to-br from-background/80 to-primary/5 border border-primary/10 hover:border-primary/20 transition-colors"
    >
      {/* Top Row: Equipment Selector */}
      <div className="relative sm:col-span-2" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={t("calculator", "selectEquipment")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background/70 border border-primary/20 text-left hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-chart-4/10 flex items-center justify-center shrink-0 border border-primary/20">
            {selectedPreset ? (
              <span className="text-lg">{selectedPreset.icon}</span>
            ) : (
              <Zap className="w-4 h-4 text-primary" />
            )}
          </div>
          <span className="flex-1 truncate font-semibold">
            {getEquipmentDisplayName() || t("calculator", "selectEquipment")}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden"
              role="listbox"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-primary/10 bg-primary/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("calculator", "searchEquipment")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-10 bg-background border-primary/20 focus:border-primary rounded-xl"
                    autoFocus
                    aria-label={t("calculator", "searchEquipment")}
                  />
                </div>
              </div>

              {/* Options List */}
              <div ref={listRef} className="max-h-56 overflow-y-auto py-2">
                {filteredPresets.length > 0 ? (
                  filteredPresets.map((preset, index) => {
                    const displayName = getPresetDisplayName(preset.nameKey);
                    const isSelected = equipment.nameKey === preset.nameKey || equipment.name === displayName;
                    return (
                      <button
                        key={preset.nameKey}
                        onClick={() => handleSelect(preset)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={isSelected}
                        className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all text-left ${
                          highlightedIndex === index
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-secondary/50"
                        } ${isSelected ? "bg-primary/5" : ""}`}
                        style={{ width: 'calc(100% - 1rem)' }}
                      >
                        <span className="text-xl w-8 text-center">{preset.icon}</span>
                        <span className="flex-1 font-medium">{displayName}</span>
                        <span className="text-sm text-muted-foreground tabular-nums bg-secondary/50 px-2 py-0.5 rounded-md">
                          {preset.watts}W
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })
                ) : search.trim() ? (
                  <button
                    onClick={handleCustomInput}
                    className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-primary/10 transition-colors text-left"
                    style={{ width: 'calc(100% - 1rem)' }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">
                      {language === "en" ? `Add "${search}" as custom equipment` :
                       language === "hi" ? `"${search}" को कस्टम उपकरण के रूप में जोड़ें` :
                       `"${search}" कस्टम उपकरण म्हणून जोडा`}
                    </span>
                  </button>
                ) : (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    {language === "en" ? "No equipment found. Type to add custom." :
                     language === "hi" ? "कोई उपकरण नहीं मिला। कस्टम जोड़ने के लिए टाइप करें।" :
                     "उपकरण सापडले नाही. कस्टम जोडण्यासाठी टाइप करा।"}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Row: Controls */}
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{t("calculator", "quantity")}</label>
          <div className="flex items-center bg-background/70 rounded-xl border border-primary/20 overflow-hidden">
            <button
              onClick={() => onUpdate({ quantity: Math.max(1, equipment.quantity - 1) })}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors focus:outline-none focus:bg-primary/10"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-primary" />
            </button>
            <input
              ref={quantityInputRef}
              type="number"
              min="1"
              value={equipment.quantity}
              onChange={(e) => onUpdate({ quantity: Math.max(1, Number(e.target.value) || 1) })}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  onUpdate({ quantity: equipment.quantity + 1 });
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  onUpdate({ quantity: Math.max(1, equipment.quantity - 1) });
                }
              }}
              className="w-12 h-10 text-center text-sm font-bold bg-transparent border-x border-primary/20 focus:outline-none focus:bg-primary/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              onClick={() => onUpdate({ quantity: equipment.quantity + 1 })}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors focus:outline-none focus:bg-primary/10"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Watts Input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{t("calculator", "watts")}</label>
          <div className="relative">
            <input
              ref={wattsInputRef}
              type="number"
              min="0"
              placeholder="0"
              value={equipment.watts || ""}
              onChange={(e) => onUpdate({ watts: Math.max(0, Number(e.target.value) || 0) })}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  onUpdate({ watts: equipment.watts + 10 });
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  onUpdate({ watts: Math.max(0, equipment.watts - 10) });
                }
              }}
              className="w-24 h-10 px-3 pr-8 text-sm font-bold rounded-xl bg-background/70 border border-primary/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={t("calculator", "watts")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
              W
            </span>
          </div>
        </div>

        {/* Total Display */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-right px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20">
            <p className="text-xs text-primary/70 uppercase tracking-wider font-medium">
              {language === "en" ? "Total" : language === "hi" ? "कुल" : "एकूण"}
            </p>
            <p className="text-lg font-bold text-primary tabular-nums">
              {(equipment.watts * equipment.quantity).toLocaleString()}W
            </p>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            aria-label="Remove equipment"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const ElectricalCalculator = () => {
  const { language, t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [duration, setDuration] = useState(8);
  const [rate, setRate] = useState(5);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

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
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const calculateRoomValues = (room: Room): Room => {
    const totalPower = room.equipment.reduce(
      (acc, eq) => acc + (eq.watts || 0) * (eq.quantity || 1),
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
      isExpanded: true,
    };
    setRooms([...rooms, newRoom]);
  };

  const toggleRoom = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, isExpanded: !room.isExpanded } : room
      )
    );
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
                name: "",
                watts: 0,
                quantity: 1,
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

    // Build detailed equipment list
    const equipmentDetails = rooms
      .flatMap((room) =>
        room.equipment.map(
          (eq) =>
            `${eq.name}${eq.quantity > 1 ? ` x${eq.quantity}` : ""} (${eq.watts * eq.quantity}W) in ${room.name}`
        )
      )
      .join(", ");

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
          )} per month at ₹${rate}/kWh. Equipment breakdown: ${equipmentDetails || "No equipment added"}.`,
          language: language,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch tips");

      const tipsData = await response.json();
      setTips(Array.isArray(tipsData) ? tipsData : [tipsData]);
    } catch (error) {
      console.error("Error fetching tips:", error);
      const errorMessage = language === "en"
        ? "Unable to fetch tips. Please try again later."
        : language === "hi"
        ? "सुझाव प्राप्त करने में असमर्थ। कृपया बाद में पुनः प्रयास करें।"
        : "सल्ले मिळवण्यात अक्षम. कृपया नंतर पुन्हा प्रयत्न करा.";
      setTips([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateBillPDF = () => {
    if (!customerName.trim()) return;

    setGeneratingPdf(true);
    const householdValues = getTotalHouseholdValues();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // Professional warm color palette
    const colors = {
      primary: [139, 119, 42] as [number, number, number],
      primaryLight: [180, 165, 100] as [number, number, number],
      accent: [200, 162, 100] as [number, number, number],
      green: [76, 115, 55] as [number, number, number],
      greenLight: [200, 215, 180] as [number, number, number],
      dark: [35, 35, 35] as [number, number, number],
      gray: [90, 90, 90] as [number, number, number],
      lightGray: [140, 140, 140] as [number, number, number],
      cream: [250, 247, 240] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      tableHeader: [245, 242, 235] as [number, number, number],
      tableAlt: [252, 250, 247] as [number, number, number],
    };

    // Currency symbol (using INR text for compatibility)
    const currency = "Rs.";

    // Labels
    const labels = {
      en: {
        title: "ENERGY CONSUMPTION REPORT",
        subtitle: "Household Energy Calculator",
        preparedFor: "Prepared For",
        date: "Date",
        reportId: "Report ID",
        usage: "USAGE PARAMETERS",
        dailyHours: "Daily Usage Hours",
        electricityRate: "Electricity Rate",
        breakdown: "CONSUMPTION BREAKDOWN",
        appliance: "Appliance",
        qty: "Qty",
        watts: "Watts",
        total: "Total",
        roomTotal: "Subtotal",
        perDay: "/day",
        summary: "COST SUMMARY",
        totalPower: "Total Power",
        dailyCost: "Daily Cost",
        monthlyCost: "Monthly Cost",
        yearlyCost: "Yearly Cost",
        tips: "ENERGY SAVING TIPS",
        footer1: "This is an estimate for reference purposes only.",
        footer2: "Actual consumption may vary based on usage patterns.",
        footer3: "Generated by Energy Calculator",
        hours: "hrs/day",
        perKwh: "/kWh",
      },
      hi: {
        title: "ENERGY CONSUMPTION REPORT",
        subtitle: "Household Energy Calculator",
        preparedFor: "Prepared For",
        date: "Date",
        reportId: "Report ID",
        usage: "USAGE PARAMETERS",
        dailyHours: "Daily Usage Hours",
        electricityRate: "Electricity Rate",
        breakdown: "CONSUMPTION BREAKDOWN",
        appliance: "Appliance",
        qty: "Qty",
        watts: "Watts",
        total: "Total",
        roomTotal: "Subtotal",
        perDay: "/day",
        summary: "COST SUMMARY",
        totalPower: "Total Power",
        dailyCost: "Daily Cost",
        monthlyCost: "Monthly Cost",
        yearlyCost: "Yearly Cost",
        tips: "ENERGY SAVING TIPS",
        footer1: "This is an estimate for reference purposes only.",
        footer2: "Actual consumption may vary based on usage patterns.",
        footer3: "Generated by Energy Calculator",
        hours: "hrs/day",
        perKwh: "/kWh",
      },
      mr: {
        title: "ENERGY CONSUMPTION REPORT",
        subtitle: "Household Energy Calculator",
        preparedFor: "Prepared For",
        date: "Date",
        reportId: "Report ID",
        usage: "USAGE PARAMETERS",
        dailyHours: "Daily Usage Hours",
        electricityRate: "Electricity Rate",
        breakdown: "CONSUMPTION BREAKDOWN",
        appliance: "Appliance",
        qty: "Qty",
        watts: "Watts",
        total: "Total",
        roomTotal: "Subtotal",
        perDay: "/day",
        summary: "COST SUMMARY",
        totalPower: "Total Power",
        dailyCost: "Daily Cost",
        monthlyCost: "Monthly Cost",
        yearlyCost: "Yearly Cost",
        tips: "ENERGY SAVING TIPS",
        footer1: "This is an estimate for reference purposes only.",
        footer2: "Actual consumption may vary based on usage patterns.",
        footer3: "Generated by Energy Calculator",
        hours: "hrs/day",
        perKwh: "/kWh",
      },
    };

    const l = labels[language as keyof typeof labels] || labels.en;
    const today = new Date();
    const reportId = `EC-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

    // ========== HEADER ==========
    // Top bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 12, "F");

    // Logo box
    y = 25;
    doc.setFillColor(...colors.cream);
    doc.roundedRect(margin, y - 6, 45, 20, 3, 3, "F");
    doc.setDrawColor(...colors.primaryLight);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 6, 45, 20, 3, 3, "S");

    // Logo text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text("ENERGY", margin + 8, y + 2);
    doc.setFontSize(7);
    doc.setTextColor(...colors.gray);
    doc.text("CALCULATOR", margin + 8, y + 8);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...colors.dark);
    doc.text(l.title, pageWidth - margin, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    doc.text(l.subtitle, pageWidth - margin, y + 7, { align: "right" });

    y += 25;

    // Separator
    doc.setDrawColor(...colors.primaryLight);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;

    // ========== CLIENT & REPORT INFO ==========
    const infoBoxHeight = 28;
    const leftBoxWidth = contentWidth * 0.58;
    const rightBoxWidth = contentWidth * 0.38;
    const gap = contentWidth * 0.04;

    // Left box - Client
    doc.setFillColor(...colors.cream);
    doc.roundedRect(margin, y, leftBoxWidth, infoBoxHeight, 3, 3, "F");
    doc.setDrawColor(...colors.primaryLight);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, leftBoxWidth, infoBoxHeight, 3, 3, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.preparedFor, margin + 10, y + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.dark);
    doc.text(customerName.trim().toUpperCase(), margin + 10, y + 21);

    // Right box - Report details
    const rightBoxX = margin + leftBoxWidth + gap;
    doc.setFillColor(...colors.cream);
    doc.roundedRect(rightBoxX, y, rightBoxWidth, infoBoxHeight, 3, 3, "F");
    doc.setDrawColor(...colors.primaryLight);
    doc.roundedRect(rightBoxX, y, rightBoxWidth, infoBoxHeight, 3, 3, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.date + ":", rightBoxX + 8, y + 10);
    doc.text(l.reportId + ":", rightBoxX + 8, y + 21);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.text(today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), rightBoxX + 45, y + 10);
    doc.setFontSize(8);
    doc.text(reportId, rightBoxX + 45, y + 21);

    y += infoBoxHeight + 15;

    // ========== USAGE PARAMETERS ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text(l.usage, margin, y);
    y += 8;

    const paramBoxWidth = (contentWidth - 10) / 2;
    const paramBoxHeight = 22;

    // Hours box
    doc.setFillColor(...colors.tableHeader);
    doc.roundedRect(margin, y, paramBoxWidth, paramBoxHeight, 3, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.dailyHours, margin + 10, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text(`${duration} ${l.hours}`, margin + 10, y + 17);

    // Rate box
    doc.setFillColor(...colors.tableHeader);
    doc.roundedRect(margin + paramBoxWidth + 10, y, paramBoxWidth, paramBoxHeight, 3, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.electricityRate, margin + paramBoxWidth + 20, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.green);
    doc.text(`${currency}${rate}${l.perKwh}`, margin + paramBoxWidth + 20, y + 17);

    y += paramBoxHeight + 15;

    // ========== CONSUMPTION TABLE ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text(l.breakdown, margin, y);
    y += 8;

    // Table header
    doc.setFillColor(...colors.primary);
    doc.rect(margin, y, contentWidth, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text(l.appliance, margin + 5, y + 6);
    doc.text(l.qty, margin + 100, y + 6);
    doc.text(l.watts, margin + 120, y + 6);
    doc.text(l.total, margin + 150, y + 6);
    y += 11;

    let rowIndex = 0;
    rooms.forEach((room) => {
      // Page break check
      if (y > pageHeight - 80) {
        doc.addPage();
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 8, "F");
        y = 20;
      }

      // Room header
      doc.setFillColor(...colors.tableHeader);
      doc.rect(margin, y, contentWidth, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(room.name.toUpperCase(), margin + 5, y + 5.5);
      y += 10;

      // Equipment rows
      room.equipment.forEach((eq) => {
        if (eq.name && eq.watts > 0) {
          if (rowIndex % 2 === 0) {
            doc.setFillColor(...colors.tableAlt);
            doc.rect(margin, y - 1, contentWidth, 7, "F");
          }

          const totalWatts = eq.watts * eq.quantity;
          const displayName = eq.name.length > 35 ? eq.name.substring(0, 32) + "..." : eq.name;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...colors.dark);
          doc.text("  " + displayName, margin + 5, y + 4);
          doc.text(String(eq.quantity), margin + 102, y + 4);
          doc.text(`${eq.watts}W`, margin + 120, y + 4);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.primary);
          doc.text(`${totalWatts.toLocaleString()}W`, margin + 150, y + 4);

          y += 7;
          rowIndex++;
        }
      });

      // Room subtotal
      doc.setFillColor(...colors.greenLight);
      doc.rect(margin + 80, y, contentWidth - 80, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.green);
      doc.text(`${l.roomTotal}: ${room.totalPower.toLocaleString()}W | ${currency}${room.totalCost.toFixed(2)}${l.perDay}`, margin + 85, y + 5);
      y += 12;
    });

    y += 8;

    // ========== SUMMARY ==========
    if (y > pageHeight - 75) {
      doc.addPage();
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 8, "F");
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text(l.summary, margin, y);
    y += 10;

    // Summary box
    const summaryHeight = 50;
    doc.setFillColor(...colors.cream);
    doc.roundedRect(margin, y, contentWidth, summaryHeight, 4, 4, "F");
    doc.setDrawColor(...colors.primaryLight);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, summaryHeight, 4, 4, "S");

    const col1X = margin + 15;
    const col2X = margin + contentWidth / 2 + 10;
    const row1Y = y + 14;
    const row2Y = y + 36;

    // Total Power
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.totalPower, col1X, row1Y - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.dark);
    doc.text(`${householdValues.powerInKW.toFixed(2)} kW`, col1X, row1Y + 4);

    // Daily Cost
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.dailyCost, col2X, row1Y - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.green);
    doc.text(`${currency}${householdValues.dailyCost.toFixed(2)}`, col2X, row1Y + 4);

    // Monthly Cost
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.monthlyCost, col1X, row2Y - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    doc.text(`${currency}${householdValues.monthlyCost.toFixed(2)}`, col1X, row2Y + 5);

    // Yearly Cost
    const yearlyCost = householdValues.monthlyCost * 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.yearlyCost, col2X, row2Y - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...colors.green);
    doc.text(`${currency}${yearlyCost.toFixed(2)}`, col2X, row2Y + 5);

    y += summaryHeight + 15;

    // ========== TIPS ==========
    if (tips.length > 0 && tips[0] !== "") {
      if (y > pageHeight - 50) {
        doc.addPage();
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 8, "F");
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.green);
      doc.text(l.tips, margin, y);
      y += 8;

      doc.setFillColor(...colors.greenLight);
      const tipsHeight = Math.min(tips.length * 10 + 8, 50);
      doc.roundedRect(margin, y, contentWidth, tipsHeight, 3, 3, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);

      let tipY = y + 8;
      tips.forEach((tip, index) => {
        if (tip && tip.trim() && tipY < y + tipsHeight - 5) {
          const shortTip = tip.length > 80 ? tip.substring(0, 77) + "..." : tip;
          doc.text(`${index + 1}. ${shortTip}`, margin + 8, tipY);
          tipY += 10;
        }
      });
    }

    // ========== FOOTER ==========
    y = pageHeight - 25;

    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.lightGray);
    doc.text(l.footer1, pageWidth / 2, y, { align: "center" });
    doc.text(l.footer2, pageWidth / 2, y + 4, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colors.primary);
    doc.text(l.footer3, pageWidth / 2, y + 9, { align: "center" });

    // Bottom bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, pageHeight - 6, pageWidth, 6, "F");

    // Save
    const fileName = `${customerName.trim().replace(/\s+/g, "-").toLowerCase()}-energy-report.pdf`;
    doc.save(fileName);

    setGeneratingPdf(false);
    setShowBillDialog(false);
    setCustomerName("");
  };

  const householdValues = getTotalHouseholdValues();

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      {/* Bill Download Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center border border-primary/30">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              {t("bill", "title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("bill", "description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                {t("bill", "yourName")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={t("bill", "enterName")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customerName.trim()) {
                      generateBillPDF();
                    }
                  }}
                  className="pl-10 h-11 rounded-xl border-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-chart-4/5 border border-primary/10 p-4 space-y-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">{t("bill", "billIncludes")}</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">🏠</span>
                  {rooms.length} {t("bill", "roomsWithDetails")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-chart-4/10 flex items-center justify-center text-xs">⚡</span>
                  {t("bill", "totalPowerLabel")}: <span className="font-semibold text-primary">{householdValues.powerInKW.toFixed(2)} kW</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-chart-2/10 flex items-center justify-center text-xs">💰</span>
                  {t("bill", "monthlyEstimate")}: <span className="font-semibold text-chart-2">₹{householdValues.monthlyCost.toFixed(2)}</span>
                </li>
                {tips.length > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-chart-3/10 flex items-center justify-center text-xs">💡</span>
                    {tips.length} {t("bill", "aiTipsCount")}
                  </li>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBillDialog(false)} className="rounded-xl">
              {t("bill", "cancel")}
            </Button>
            <Button
              onClick={generateBillPDF}
              disabled={!customerName.trim() || generatingPdf}
              className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-primary-foreground rounded-xl"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("bill", "generating")}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t("bill", "downloadPdf")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 via-chart-4/20 to-chart-5/20 border border-primary/30 mb-6 relative overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <Zap className="w-10 h-10 text-primary relative z-10" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-chart-4 to-chart-5 bg-clip-text text-transparent">
              {t("calculator", "title")}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            {t("calculator", "subtitle")}
          </p>
        </motion.div>

        {/* Quick Stats Banner (shows when rooms exist) */}
        <AnimatePresence>
          {rooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-chart-4/5 to-chart-5/5 border border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{rooms.length}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Rooms" : language === "hi" ? "कमरे" : "खोल्या"}</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <p className="text-2xl font-bold text-chart-4">{householdValues.powerInKW.toFixed(1)} kW</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Total Power" : language === "hi" ? "कुल शक्ति" : "एकूण शक्ती"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-2">₹{householdValues.monthlyCost.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Monthly" : language === "hi" ? "मासिक" : "मासिक"}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Usage Settings Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5 pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center border border-primary/30">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                {t("calculator", "usageSettings")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {language === "en" ? "Configure your daily usage hours and electricity rate" :
                 language === "hi" ? "अपने दैनिक उपयोग घंटे और बिजली दर कॉन्फ़िगर करें" :
                 "तुमचे दैनिक वापर तास आणि वीज दर कॉन्फिगर करा"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("calculator", "hoursPerDay")}
                  </label>
                  <motion.span
                    key={duration}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"
                  >
                    {duration} {t("calculator", "hours")}
                  </motion.span>
                </div>
                <Slider
                  min={1}
                  max={24}
                  step={1}
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-primary [&_[role=slider]]:to-chart-4 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/30 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1h</span>
                  <span>12h</span>
                  <span>24h</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-chart-2" />
                    {t("calculator", "electricityRate")}
                  </label>
                  <motion.span
                    key={rate}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-bold text-chart-2 bg-chart-2/10 px-4 py-1.5 rounded-full border border-chart-2/20"
                  >
                    ₹{rate}/{t("calculator", "perKwh")}
                  </motion.span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={0.5}
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-chart-2 [&_[role=slider]]:to-chart-3 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-chart-2/30 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1</span>
                  <span>₹10</span>
                  <span>₹20</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Room Button */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-4/20 to-chart-5/20 rounded-2xl blur-xl" />
            <Button
              onClick={addRoom}
              className="relative w-full h-14 bg-gradient-to-r from-primary via-chart-4 to-chart-5 hover:from-primary/90 hover:via-chart-4/90 hover:to-chart-5/90 text-primary-foreground font-bold text-base shadow-2xl shadow-primary/20 border-0 rounded-2xl"
            >
              <Plus className="mr-2 h-5 w-5" /> {t("calculator", "addRoom")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Rooms List */}
        <AnimatePresence mode="popLayout">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              layout
            >
              <Card className="border-chart-5/30 bg-gradient-to-br from-card/90 via-card/70 to-chart-5/5 backdrop-blur-xl shadow-xl shadow-chart-5/5 overflow-hidden">
                <CardHeader className="pb-3 relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-chart-5/10 rounded-full blur-3xl" />
                  <div className="flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.button
                        onClick={() => toggleRoom(room.id)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-5/20 to-primary/20 flex items-center justify-center shrink-0 border border-chart-5/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={{ rotate: room.isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-chart-5" />
                        </motion.div>
                      </motion.button>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center shrink-0 border border-primary/30">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={room.name}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id ? { ...r, name: e.target.value } : r
                              )
                            )
                          }
                          className="text-lg font-bold border-0 bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <p className="text-xs text-muted-foreground">
                          {room.equipment.length} {language === "en" ? "items" : language === "hi" ? "उपकरण" : "वस्तू"} • {room.totalPower.toLocaleString()}W
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right px-3 py-1 rounded-lg bg-chart-2/10 border border-chart-2/20 hidden sm:block">
                        <p className="text-xs text-chart-2/70">{language === "en" ? "Daily" : language === "hi" ? "दैनिक" : "दैनिक"}</p>
                        <p className="text-sm font-bold text-chart-2">₹{room.totalCost.toFixed(2)}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRoom(room.id)}
                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {room.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="space-y-3 pt-0">
                        {room.equipment.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3">
                              <Zap className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm">{language === "en" ? "No equipment added yet" : language === "hi" ? "अभी तक कोई उपकरण नहीं जोड़ा गया" : "अद्याप कोणतेही उपकरण जोडलेले नाही"}</p>
                            <p className="text-xs text-muted-foreground/70">{language === "en" ? "Click below to add your first appliance" : language === "hi" ? "अपना पहला उपकरण जोड़ने के लिए नीचे क्लिक करें" : "तुमचे पहिले उपकरण जोडण्यासाठी खाली क्लिक करा"}</p>
                          </div>
                        )}
                        <AnimatePresence mode="popLayout">
                          {room.equipment.map((equipment) => (
                            <EquipmentSelector
                              key={equipment.id}
                              equipment={equipment}
                              onUpdate={(updates) =>
                                updateEquipment(room.id, equipment.id, updates)
                              }
                              onRemove={() =>
                                removeEquipment(room.id, equipment.id)
                              }
                              language={language}
                              t={t}
                            />
                          ))}
                        </AnimatePresence>
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={() => addEquipment(room.id)}
                            className="w-full h-11 border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                            variant="outline"
                          >
                            <Plus className="mr-2 h-4 w-4 text-primary" /> {t("calculator", "addEquipment")}
                          </Button>
                        </motion.div>
                      </CardContent>
                      <CardFooter className="border-t border-chart-5/20 bg-gradient-to-r from-primary/5 via-chart-4/5 to-chart-5/5">
                        <div className="w-full grid grid-cols-2 gap-4 py-3">
                          <div className="text-center p-3 rounded-xl bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{t("calculator", "power")}</p>
                            <p className="text-xl font-bold text-primary">
                              {room.totalPower.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">W</span>
                            </p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{t("calculator", "dailyCost")}</p>
                            <p className="text-xl font-bold text-chart-2">
                              ₹{room.totalCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardFooter>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {rooms.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 px-6 rounded-3xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-chart-4/10 flex items-center justify-center mx-auto mb-6 border border-primary/20"
            >
              <Home className="w-12 h-12 text-primary/60" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{language === "en" ? "No rooms added yet" : language === "hi" ? "अभी तक कोई कमरा नहीं जोड़ा गया" : "अद्याप कोणतीही खोली जोडलेली नाही"}</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {language === "en" ? "Start by adding a room to calculate your household energy consumption" : language === "hi" ? "अपने घर की ऊर्जा खपत की गणना करने के लिए एक कमरा जोड़कर शुरू करें" : "तुमच्या घराच्या ऊर्जा वापराची गणना करण्यासाठी एक खोली जोडून सुरू करा"}
            </p>
            <Button
              onClick={addRoom}
              className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-primary-foreground font-semibold px-8"
            >
              <Plus className="mr-2 h-5 w-5" /> {t("calculator", "addRoom")}
            </Button>
          </motion.div>
        )}

        {/* Household Summary Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-chart-2/30 bg-gradient-to-br from-card/90 via-card/70 to-chart-2/5 backdrop-blur-xl shadow-xl shadow-chart-2/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-chart-3/5 pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-3/20 flex items-center justify-center border border-chart-2/30">
                    <Home className="w-5 h-5 text-chart-2" />
                  </div>
                  {t("calculator", "householdSummary")}
                </CardTitle>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBillDialog(true)}
                    disabled={rooms.length === 0 || householdValues.totalPower === 0}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    {t("calculator", "downloadBill")}
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="text-center p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {householdValues.powerInKW.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">kW {t("calculator", "totalPower")}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="text-center p-5 rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-3/10 border border-chart-2/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">📅</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-2">
                    ₹{householdValues.dailyCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{t("calculator", "perDay")}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="text-center p-5 rounded-2xl bg-gradient-to-br from-chart-5/10 to-chart-1/10 border border-chart-5/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-chart-5/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">📆</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-5">
                    ₹{householdValues.monthlyCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{t("calculator", "perMonth")}</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Saving Tips Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-chart-3/30 bg-gradient-to-br from-card/90 via-card/70 to-chart-3/5 backdrop-blur-xl shadow-xl shadow-chart-3/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 via-transparent to-chart-2/5 pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-2/20 flex items-center justify-center border border-chart-3/30 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-chart-3/20 to-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  <Zap className="w-5 h-5 text-chart-3 relative z-10" />
                </div>
                <div className="flex-1">
                  <span>{t("calculator", "smartTips")}</span>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">
                    {t("calculator", "aiRecommendations")}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <motion.div whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-chart-3/20 to-chart-2/20 rounded-2xl blur-xl" />
                  <Button
                    onClick={getEnergySavingTips}
                    disabled={loading || rooms.length === 0}
                    className="relative w-full h-14 bg-gradient-to-r from-chart-3 to-chart-2 hover:from-chart-3/90 hover:to-chart-2/90 text-white font-bold text-base shadow-2xl shadow-chart-3/20 border-0 rounded-2xl disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("calculator", "analyzing")}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        {t("calculator", "generateTips")}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              {tips.length > 0 && (
                <div className="space-y-3 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-gradient-to-r from-chart-3 to-chart-2 rounded-full" />
                    {language === "en" ? "Recommendations" : language === "hi" ? "सुझाव" : "शिफारसी"}
                  </p>
                  <AnimatePresence mode="popLayout">
                    {tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-background/80 to-chart-3/5 border border-chart-3/20 hover:border-chart-3/40 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-2/20 flex items-center justify-center shrink-0 border border-chart-3/30">
                          <span className="text-sm font-bold text-chart-3">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pt-1">
                          {tip}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ElectricalCalculator;
