export interface Equipment {
  id: string;
  name: string;
  resistance: number;
  watts: number;
}

export interface Room {
  id: string;
  name: string;
  equipment: Equipment[];
}
export interface Equipment {
  id: string;
  name: string;
  resistance: number;
  watts: number;
  voltage?: number;
  current?: number;
}

export interface Room {
  id: string;
  name: string;
  equipment: Equipment[];
  totalPower: number;
  totalCost: number;
}

export interface CalculationResult {
  power: number;
  current: number;
  voltage: number;
  resistance: number;
}
