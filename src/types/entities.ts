export interface Ingredient {
  id: number;
  name: string;
  weightG: number;
  cost: string; // mantemos string pois Prisma usa Decimal serializado
  createdAt: Date;
  updatedAt: Date;
}

export interface Portion {
  id: number;
  name: string;
  weightG: number;
  cost: string;
  ingredientId: number;
  ingredient?: Ingredient;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnackPortion {
  id: number;
  snackId: number;
  portionId: number;
  portion?: Portion;
  createdAt: Date;
  updatedAt: Date;
}

export interface Snack {
  id: number;
  name: string;
  snackPortions?: SnackPortion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper type retornado pela API com totais calculados
export interface SnackWithTotals extends Snack {
  portions: Portion[];
  totalCost: string;
  totalWeightG: number;
  suggestedPrice: string;
}
