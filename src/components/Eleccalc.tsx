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
      className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50"
    >
      {/* Top Row: Equipment Selector */}
      <div className="relative sm:col-span-2" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={t("calculator", "selectEquipment")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-left hover:border-amber-500/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            {selectedPreset ? (
              <span className="text-lg">{selectedPreset.icon}</span>
            ) : (
              <Zap className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <span className="flex-1 truncate font-medium">
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
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
              role="listbox"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-border/50 bg-secondary/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("calculator", "searchEquipment")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-10 bg-background border-border/50 focus:border-amber-500"
                    autoFocus
                    aria-label={t("calculator", "searchEquipment")}
                  />
                </div>
              </div>

              {/* Options List */}
              <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
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
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                          highlightedIndex === index
                            ? "bg-amber-500/10"
                            : "hover:bg-secondary/50"
                        } ${isSelected ? "bg-amber-500/5" : ""}`}
                      >
                        <span className="text-xl w-8 text-center">{preset.icon}</span>
                        <span className="flex-1 font-medium">{displayName}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {preset.watts}W
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-500" />
                        )}
                      </button>
                    );
                  })
                ) : search.trim() ? (
                  <button
                    onClick={handleCustomInput}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-amber-500" />
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
          <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("calculator", "quantity")}</label>
          <div className="flex items-center bg-background/50 rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => onUpdate({ quantity: Math.max(1, equipment.quantity - 1) })}
              className="w-9 h-9 flex items-center justify-center hover:bg-secondary/80 transition-colors focus:outline-none focus:bg-secondary"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
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
              className="w-12 h-9 text-center text-sm font-semibold bg-transparent border-x border-border/50 focus:outline-none focus:bg-secondary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              onClick={() => onUpdate({ quantity: equipment.quantity + 1 })}
              className="w-9 h-9 flex items-center justify-center hover:bg-secondary/80 transition-colors focus:outline-none focus:bg-secondary"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Watts Input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("calculator", "watts")}</label>
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
              className="w-24 h-9 px-3 pr-8 text-sm font-semibold rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={t("calculator", "watts")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              W
            </span>
          </div>
        </div>

        {/* Total Display */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-right px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-500/70 uppercase tracking-wide">
              {language === "en" ? "Total" : language === "hi" ? "कुल" : "एकूण"}
            </p>
            <p className="text-base font-bold text-amber-500 tabular-nums">
              {(equipment.watts * equipment.quantity).toLocaleString()}W
            </p>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            aria-label="Remove equipment"
          >
            <Trash2 size={16} />
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
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    // Color palette
    const colors = {
      primary: [245, 158, 11] as [number, number, number],      // Amber
      primaryDark: [217, 119, 6] as [number, number, number],   // Darker amber
      secondary: [16, 185, 129] as [number, number, number],    // Emerald
      dark: [30, 30, 30] as [number, number, number],
      gray: [100, 100, 100] as [number, number, number],
      lightGray: [150, 150, 150] as [number, number, number],
      bgLight: [254, 252, 232] as [number, number, number],     // Amber-50
      bgGray: [249, 250, 251] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
    };

    // Language-specific labels
    const labels = {
      en: {
        title: "ENERGY CONSUMPTION BILL",
        subtitle: "Household Energy Calculator",
        billTo: "BILL TO",
        date: "Date",
        billNo: "Bill No",
        usageParams: "USAGE PARAMETERS",
        dailyHours: "Daily Usage Hours",
        electricityRate: "Electricity Rate",
        itemizedConsumption: "ITEMIZED CONSUMPTION",
        item: "ITEM",
        qty: "QTY",
        power: "POWER",
        total: "TOTAL",
        subtotal: "Subtotal",
        perDay: "/day",
        summary: "BILL SUMMARY",
        totalPower: "Total Power Consumption",
        dailyCost: "Estimated Daily Cost",
        monthlyCost: "Estimated Monthly Cost",
        energyTips: "ENERGY SAVING TIPS",
        footer1: "This is a computer-generated estimate for reference purposes only.",
        footer2: "Actual consumption may vary based on usage patterns.",
        footer3: "Thank you for using Energy Calculator",
        rooms: "rooms",
        equipment: "equipment items",
      },
      hi: {
        title: "ऊर्जा खपत बिल",
        subtitle: "घरेलू ऊर्जा कैलकुलेटर",
        billTo: "बिल प्राप्तकर्ता",
        date: "दिनांक",
        billNo: "बिल नंबर",
        usageParams: "उपयोग पैरामीटर",
        dailyHours: "दैनिक उपयोग घंटे",
        electricityRate: "बिजली दर",
        itemizedConsumption: "विस्तृत खपत",
        item: "उपकरण",
        qty: "मात्रा",
        power: "वॉट",
        total: "कुल",
        subtotal: "उप-योग",
        perDay: "/दिन",
        summary: "बिल सारांश",
        totalPower: "कुल बिजली खपत",
        dailyCost: "अनुमानित दैनिक लागत",
        monthlyCost: "अनुमानित मासिक लागत",
        energyTips: "ऊर्जा बचत सुझाव",
        footer1: "यह केवल संदर्भ के लिए कंप्यूटर-जनित अनुमान है।",
        footer2: "वास्तविक खपत उपयोग पैटर्न के आधार पर भिन्न हो सकती है।",
        footer3: "एनर्जी कैलकुलेटर का उपयोग करने के लिए धन्यवाद",
        rooms: "कमरे",
        equipment: "उपकरण",
      },
      mr: {
        title: "ऊर्जा वापर बिल",
        subtitle: "घरगुती ऊर्जा कॅल्क्युलेटर",
        billTo: "बिल प्राप्तकर्ता",
        date: "दिनांक",
        billNo: "बिल क्रमांक",
        usageParams: "वापर पॅरामीटर्स",
        dailyHours: "दैनिक वापर तास",
        electricityRate: "वीज दर",
        itemizedConsumption: "तपशीलवार वापर",
        item: "उपकरण",
        qty: "संख्या",
        power: "वॉट",
        total: "एकूण",
        subtotal: "उप-एकूण",
        perDay: "/दिवस",
        summary: "बिल सारांश",
        totalPower: "एकूण वीज वापर",
        dailyCost: "अंदाजे दैनिक खर्च",
        monthlyCost: "अंदाजे मासिक खर्च",
        energyTips: "ऊर्जा बचत सल्ले",
        footer1: "हे केवळ संदर्भासाठी संगणक-व्युत्पन्न अंदाज आहे.",
        footer2: "वास्तविक वापर वापर पद्धतींवर आधारित बदलू शकतो.",
        footer3: "एनर्जी कॅल्क्युलेटर वापरल्याबद्दल धन्यवाद",
        rooms: "खोल्या",
        equipment: "उपकरणे",
      },
    };

    const l = labels[language as keyof typeof labels] || labels.en;

    // Helper functions
    const drawLine = (yPos: number, color: [number, number, number] = colors.lightGray, width: number = 0.3) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    const drawDashedLine = (yPos: number) => {
      doc.setDrawColor(...colors.lightGray);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      doc.setLineDashPattern([], 0);
    };

    // ========== HEADER SECTION ==========
    // Top accent bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 4, "F");

    y = 20;

    // Logo/Icon area
    doc.setFillColor(...colors.bgLight);
    doc.roundedRect(margin, y - 5, 40, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colors.primaryDark);
    doc.text("⚡", margin + 4, y + 7);
    doc.setFontSize(10);
    doc.text("ENERGY", margin + 14, y + 3);
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text("CALCULATOR", margin + 14, y + 9);

    // Title on right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...colors.dark);
    const titleWidth = doc.getTextWidth(l.title);
    doc.text(l.title, pageWidth - margin - titleWidth, y + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    const subtitleWidth = doc.getTextWidth(l.subtitle);
    doc.text(l.subtitle, pageWidth - margin - subtitleWidth, y + 9);

    y += 22;
    drawLine(y, colors.primary, 0.5);
    y += 12;

    // ========== CUSTOMER & BILL INFO ==========
    // Left: Customer info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.billTo, margin, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.dark);
    doc.text(customerName.trim().toUpperCase(), margin, y + 7);

    // Right: Bill details box
    const today = new Date();
    const billNo = `EC${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    const infoBoxWidth = 60;
    const infoBoxX = pageWidth - margin - infoBoxWidth;
    doc.setFillColor(...colors.bgGray);
    doc.roundedRect(infoBoxX, y - 4, infoBoxWidth, 20, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(l.date + ":", infoBoxX + 4, y + 2);
    doc.text(l.billNo + ":", infoBoxX + 4, y + 10);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text(today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), infoBoxX + 25, y + 2);
    doc.text(billNo, infoBoxX + 25, y + 10);

    y += 25;
    drawDashedLine(y);
    y += 10;

    // ========== USAGE PARAMETERS ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primaryDark);
    doc.text(l.usageParams, margin, y);
    y += 8;

    // Parameters in a nice box
    doc.setFillColor(...colors.bgGray);
    doc.roundedRect(margin, y - 2, contentWidth, 16, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.text(l.dailyHours + ":", margin + 5, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`${duration} ${language === "en" ? "hours" : language === "hi" ? "घंटे" : "तास"}`, margin + 55, y + 6);

    doc.setFont("helvetica", "normal");
    doc.text(l.electricityRate + ":", margin + 95, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.secondary);
    doc.text(`₹${rate}/kWh`, margin + 140, y + 6);

    y += 22;

    // ========== ITEMIZED CONSUMPTION TABLE ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primaryDark);
    doc.text(l.itemizedConsumption, margin, y);
    y += 6;

    // Table header
    doc.setFillColor(...colors.primary);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text(l.item, margin + 4, y + 5.5);
    doc.text(l.qty, margin + 100, y + 5.5);
    doc.text(l.power, margin + 120, y + 5.5);
    doc.text(l.total, margin + 150, y + 5.5);
    y += 10;

    let rowIndex = 0;
    rooms.forEach((room) => {
      // Check for page break
      if (y > pageHeight - 60) {
        doc.addPage();
        // Re-add top accent
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 4, "F");
        y = 20;
      }

      // Room header
      doc.setFillColor(...colors.bgLight);
      doc.rect(margin, y - 1, contentWidth, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primaryDark);
      doc.text(`📍 ${room.name}`, margin + 4, y + 4);
      y += 9;

      // Equipment items
      room.equipment.forEach((eq) => {
        if (eq.name && eq.watts > 0) {
          // Alternating row colors
          if (rowIndex % 2 === 0) {
            doc.setFillColor(252, 252, 252);
            doc.rect(margin, y - 2, contentWidth, 6, "F");
          }

          const totalWatts = eq.watts * eq.quantity;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...colors.dark);

          // Truncate long names
          const displayName = eq.name.length > 35 ? eq.name.substring(0, 32) + "..." : eq.name;
          doc.text(`  ${displayName}`, margin + 4, y + 2);
          doc.text(`${eq.quantity}`, margin + 102, y + 2);
          doc.text(`${eq.watts}W`, margin + 120, y + 2);
          doc.setFont("helvetica", "bold");
          doc.text(`${totalWatts.toLocaleString()}W`, margin + 150, y + 2);
          y += 6;
          rowIndex++;
        }
      });

      // Room subtotal
      doc.setFillColor(...colors.bgGray);
      doc.rect(margin + 80, y - 1, contentWidth - 80, 6, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text(`${l.subtotal}: ${room.totalPower.toLocaleString()}W | ₹${room.totalCost.toFixed(2)}${l.perDay}`, margin + 82, y + 3);
      y += 10;
    });

    y += 5;
    drawLine(y);
    y += 12;

    // ========== SUMMARY SECTION ==========
    // Check for page break
    if (y > pageHeight - 80) {
      doc.addPage();
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 4, "F");
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.primaryDark);
    doc.text(l.summary, margin, y);
    y += 8;

    // Summary box with gradient-like effect
    doc.setFillColor(...colors.bgLight);
    doc.roundedRect(margin, y - 2, contentWidth, 42, 3, 3, "F");
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 2, contentWidth, 42, 3, 3, "S");

    // Summary rows
    const summaryStartY = y + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text(l.totalPower, margin + 8, summaryStartY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryDark);
    doc.text(`${householdValues.powerInKW.toFixed(2)} kW`, pageWidth - margin - 8 - doc.getTextWidth(`${householdValues.powerInKW.toFixed(2)} kW`), summaryStartY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.dark);
    doc.text(l.dailyCost, margin + 8, summaryStartY + 10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.secondary);
    doc.text(`₹${householdValues.dailyCost.toFixed(2)}`, pageWidth - margin - 8 - doc.getTextWidth(`₹${householdValues.dailyCost.toFixed(2)}`), summaryStartY + 10);

    // Monthly cost - highlighted
    drawDashedLine(summaryStartY + 17);
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin + 4, summaryStartY + 20, contentWidth - 8, 12, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colors.white);
    doc.text(l.monthlyCost, margin + 10, summaryStartY + 28);
    doc.setFontSize(13);
    doc.text(`₹${householdValues.monthlyCost.toFixed(2)}`, pageWidth - margin - 12 - doc.getTextWidth(`₹${householdValues.monthlyCost.toFixed(2)}`), summaryStartY + 28);

    y += 50;

    // ========== ENERGY TIPS SECTION ==========
    if (tips.length > 0 && tips[0] !== "") {
      if (y > pageHeight - 60) {
        doc.addPage();
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 4, "F");
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.secondary);
      doc.text(`💡 ${l.energyTips}`, margin, y);
      y += 8;

      doc.setFillColor(236, 253, 245); // Emerald-50
      const tipsBoxHeight = tips.length * 12 + 8;
      doc.roundedRect(margin, y - 2, contentWidth, tipsBoxHeight, 2, 2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);

      tips.forEach((tip, index) => {
        if (tip && tip.trim()) {
          const lines = doc.splitTextToSize(`${index + 1}. ${tip}`, contentWidth - 16);
          lines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 8, y + 5 + (lineIndex * 4));
          });
          y += 10;
        }
      });
      y += 5;
    }

    // ========== FOOTER ==========
    y = pageHeight - 25;
    drawLine(y - 5, colors.lightGray, 0.3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.lightGray);

    const footer1Width = doc.getTextWidth(l.footer1);
    doc.text(l.footer1, (pageWidth - footer1Width) / 2, y);

    const footer2Width = doc.getTextWidth(l.footer2);
    doc.text(l.footer2, (pageWidth - footer2Width) / 2, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    const footer3Width = doc.getTextWidth(l.footer3);
    doc.text(l.footer3, (pageWidth - footer3Width) / 2, y + 10);

    // Bottom accent bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

    // Save PDF
    const fileName = `${customerName.trim().replace(/\s+/g, "-").toLowerCase()}-energy-bill.pdf`;
    doc.save(fileName);

    setGeneratingPdf(false);
    setShowBillDialog(false);
    setCustomerName("");
  };

  const householdValues = getTotalHouseholdValues();

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      {/* Bill Download Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              {t("bill", "title")}
            </DialogTitle>
            <DialogDescription>
              {t("bill", "description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
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
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">{t("bill", "billIncludes")}</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• {rooms.length} {t("bill", "roomsWithDetails")}</li>
                <li>• {t("bill", "totalPowerLabel")}: {householdValues.powerInKW.toFixed(2)} kW</li>
                <li>• {t("bill", "monthlyEstimate")}: ₹{householdValues.monthlyCost.toFixed(2)}</li>
                {tips.length > 0 && <li>• {tips.length} {t("bill", "aiTipsCount")}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBillDialog(false)}>
              {t("bill", "cancel")}
            </Button>
            <Button
              onClick={generateBillPDF}
              disabled={!customerName.trim() || generatingPdf}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
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
        className="max-w-3xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Zap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            <span className="gradient-text">{t("calculator", "title")}</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("calculator", "subtitle")}
          </p>
        </motion.div>

        {/* Usage Settings Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                {t("calculator", "usageSettings")}
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Configure your daily usage hours and electricity rate" :
                 language === "hi" ? "अपने दैनिक उपयोग घंटे और बिजली दर कॉन्फ़िगर करें" :
                 "तुमचे दैनिक वापर तास आणि वीज दर कॉन्फिगर करा"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">{t("calculator", "hoursPerDay")}</label>
                  <span className="text-sm font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                    {duration} {t("calculator", "hours")}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={24}
                  step={1}
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                  className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-amber-500/25"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">{t("calculator", "electricityRate")}</label>
                  <span className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                    ₹{rate}/{t("calculator", "perKwh")}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={0.5}
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-emerald-500/25"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Room Button */}
        <motion.div variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={addRoom}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 border-0"
            >
              <Plus className="mr-2 h-5 w-5" /> {t("calculator", "addRoom")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Rooms List */}
        <AnimatePresence mode="popLayout">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              layout
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.button
                        onClick={() => toggleRoom(room.id)}
                        className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={{ rotate: room.isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </motion.button>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-blue-500" />
                      </div>
                      <Input
                        value={room.name}
                        onChange={(e) =>
                          setRooms(
                            rooms.map((r) =>
                              r.id === room.id ? { ...r, name: e.target.value } : r
                            )
                          )
                        }
                        className="text-base font-semibold border-0 bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoom(room.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </motion.div>
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
                            className="w-full"
                            variant="outline"
                          >
                            <Plus className="mr-2 h-4 w-4" /> {t("calculator", "addEquipment")}
                          </Button>
                        </motion.div>
                      </CardContent>
                      <CardFooter className="border-t border-border/50 bg-secondary/20">
                        <div className="w-full grid grid-cols-2 gap-4 py-2">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{t("calculator", "power")}</p>
                            <p className="text-lg font-bold text-amber-500">
                              {room.totalPower.toLocaleString()} W
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{t("calculator", "dailyCost")}</p>
                            <p className="text-lg font-bold text-emerald-500">
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

        {/* Household Summary Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Home className="w-4 h-4 text-emerald-500" />
                  </div>
                  {t("calculator", "householdSummary")}
                </CardTitle>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBillDialog(true)}
                    disabled={rooms.length === 0 || householdValues.totalPower === 0}
                    className="gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50"
                  >
                    <Download className="w-4 h-4" />
                    {t("calculator", "downloadBill")}
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">{t("calculator", "totalPower")}</p>
                  <p className="text-xl font-bold text-amber-500">
                    {householdValues.powerInKW.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">kW</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">{t("calculator", "dailyCost")}</p>
                  <p className="text-xl font-bold text-emerald-500">
                    ₹{householdValues.dailyCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("calculator", "perDay")}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">{t("calculator", "monthlyCost")}</p>
                  <p className="text-xl font-bold text-blue-500">
                    ₹{householdValues.monthlyCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("calculator", "perMonth")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Saving Tips Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-emerald-500/5 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <span>{t("calculator", "smartTips")}</span>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">
                    {t("calculator", "aiRecommendations")}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={getEnergySavingTips}
                  disabled={loading || rooms.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 border-0 disabled:opacity-50"
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
              </motion.div>

              {tips.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
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
                        className="flex gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-emerald-500">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
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
