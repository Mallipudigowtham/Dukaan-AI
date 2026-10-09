export type TransactionType = 'sale' | 'credit' | 'payment' | 'restock';

export type LanguageCode = 'en' | 'te' | 'ta' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechLocale: string;
  flag: string;
}

export interface AuthenticityEvaluation {
  isAuthentic: boolean;
  authenticityScore: number; // 0 - 100
  verdict: 'VERIFIED' | 'REQUIRES_CAUTION' | 'SUSPICIOUS_FAKE';
  confidence: 'high' | 'medium' | 'low';
  anomalyFlags: string[];
  explanation: string;
  tamperCheck?: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO string
  type: TransactionType;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  customer: string;
  customerPhone?: string;
  notes?: string;
  source: 'voice' | 'photo' | 'typed' | 'manual';
  evaluation: AuthenticityEvaluation;
  status: 'confirmed' | 'pending' | 'flagged';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Grains & Pulses' | 'Oils & Ghee' | 'Dairy & Beverages' | 'Spices & Essentials' | 'Personal Care' | 'Snacks & Packaged';
  unit: string;
  unitPrice: number; // Selling price
  costPrice: number; // Purchase/Wholesale cost
  currentStock: number;
  lowStockThreshold: number;
  reorderUnitQty: number; // Recommended restock batch
  lastRestockedDate: string;
  lastSoldDate: string;
  daysWithoutSale: number; // For unsold / dead stock tracking
  monthlySalesVelocity: number; // Units sold this month
}

export interface CustomerCredit {
  id: string;
  name: string;
  phone: string;
  pendingBalance: number;
  lastTransactionDate: string;
  creditLimit: number;
  history: Array<{
    id: string;
    date: string;
    type: 'credit' | 'payment';
    amount: number;
    description: string;
  }>;
}

export interface ReorderHint {
  itemName: string;
  currentStock: number;
  threshold: number;
  suggestedRestock: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface UnsoldStockAlert {
  itemName: string;
  currentStock: number;
  daysWithoutSale: number;
  tiedUpCapital: number;
  recommendation: string;
}

export interface ShopProfile {
  loginName: string;
  phoneNumber: string;
  storeName: string;
  preferredLanguage: LanguageCode;
  isLoggedIn: boolean;
}

