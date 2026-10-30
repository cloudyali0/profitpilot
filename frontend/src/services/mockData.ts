// ProfitPilot - Comprehensive Client-Side Demo & Offline AI Engine
// Powers full interactive experience on Vercel without requiring a Python backend.

import {
  BrainOverview,
  BrainRecommendation,
  BrainInventoryItem,
  BrainFinance,
  BrainExpenseInsight,
  BrainBacktest,
  DashboardStats,
  OrderResult,
  CustomerWithStats,
  OrderBrief,
  AgentEvent,
  Product,
} from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 42,
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    category: 'Staples',
    brand: 'Aashirvaad',
    unit: 'pack',
    price: 245.0,
    cost_price: 218.0,
    stock: 46,
    low_stock_threshold: 50,
    description: '100% whole wheat flour, fiber rich',
    aliases: ['atta', 'aata', 'gehu ka aata', 'wheat flour', 'aashirvaad atta'],
    is_active: true,
  },
  {
    id: 54,
    name: 'Amul Butter 100g',
    category: 'Dairy',
    brand: 'Amul',
    unit: 'pack',
    price: 58.0,
    cost_price: 50.0,
    stock: 12,
    low_stock_threshold: 20,
    description: 'Pasteurized butter made from pure milk fat',
    aliases: ['butter', 'makkhan', 'amul butter', 'makhan'],
    is_active: true,
  },
  {
    id: 50,
    name: 'Amul Gold Full Cream Milk 500ml',
    category: 'Dairy',
    brand: 'Amul',
    unit: 'pouch',
    price: 33.0,
    cost_price: 30.0,
    stock: 38,
    low_stock_threshold: 40,
    description: 'Fresh full cream milk, homogenized & pasteurized',
    aliases: ['milk', 'doodh', 'amul doodh', 'gold doodh', 'amul milk'],
    is_active: true,
  },
  {
    id: 51,
    name: 'Harvest Gold White Bread 400g',
    category: 'Bakery',
    brand: 'Harvest Gold',
    unit: 'pack',
    price: 45.0,
    cost_price: 38.0,
    stock: 18,
    low_stock_threshold: 15,
    description: 'Fresh white sandwich bread',
    aliases: ['bread', 'white bread', 'double roti', 'sandwich bread'],
    is_active: true,
  },
  {
    id: 45,
    name: 'Madhur Pure Sugar 1kg',
    category: 'Staples',
    brand: 'Madhur',
    unit: 'kg',
    price: 44.0,
    cost_price: 43.0,
    stock: 35,
    low_stock_threshold: 40,
    description: 'Sulphur-free sparkling white refined sugar',
    aliases: ['sugar', 'cheeni', 'chini', 'shakkar'],
    is_active: true,
  },
  {
    id: 48,
    name: 'Tata Tea Gold 250g',
    category: 'Beverages',
    brand: 'Tata',
    unit: 'pack',
    price: 145.0,
    cost_price: 130.0,
    stock: 15,
    low_stock_threshold: 20,
    description: 'Gently rolled aromatic long leaves with Assam CTC',
    aliases: ['tea', 'chai', 'chaipatti', 'tata tea', 'chai patti'],
    is_active: true,
  },
  {
    id: 43,
    name: 'Fortune Soya Health Refined Oil 1L',
    category: 'Staples',
    brand: 'Fortune',
    unit: 'pouch',
    price: 140.0,
    cost_price: 128.0,
    stock: 58,
    low_stock_threshold: 30,
    description: 'Light and neutral edible cooking oil with vitamins A & D',
    aliases: ['oil', 'tel', 'soya oil', 'cooking oil', 'fortune oil'],
    is_active: true,
  },
  {
    id: 44,
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category: 'Staples',
    brand: 'Tata',
    unit: 'pack',
    price: 28.0,
    cost_price: 24.0,
    stock: 50,
    low_stock_threshold: 25,
    description: 'Desh Ka Namak, iodine fortified',
    aliases: ['salt', 'namak', 'tata salt'],
    is_active: true,
  },
  {
    id: 46,
    name: 'Tata Sampann Unpolished Toor Dal 1kg',
    category: 'Staples',
    brand: 'Tata Sampann',
    unit: 'kg',
    price: 155.0,
    cost_price: 138.0,
    stock: 45,
    low_stock_threshold: 25,
    description: 'Wholesome unpolished arhar/toor dal rich in natural protein',
    aliases: ['dal', 'daal', 'toor dal', 'arhar dal'],
    is_active: true,
  },
  {
    id: 59,
    name: "Kellogg's Corn Flakes 475g",
    category: 'Breakfast',
    brand: "Kellogg's",
    unit: 'box',
    price: 195.0,
    cost_price: 165.0,
    stock: 14,
    low_stock_threshold: 5,
    description: 'Crispy sun-ripened corn flakes with iron & essential vitamins',
    aliases: ['cornflakes', 'corn flakes', 'kelloggs'],
    is_active: true,
  },
  {
    id: 61,
    name: 'Dabur Chyawanprash 1kg',
    category: 'Healthcare',
    brand: 'Dabur',
    unit: 'jar',
    price: 395.0,
    cost_price: 335.0,
    stock: 8,
    low_stock_threshold: 4,
    description: '2x immunity booster Ayurvedic herbal formula',
    aliases: ['chyawanprash', 'dabur chyawanprash'],
    is_active: true,
  },
  {
    id: 60,
    name: 'Patanjali Pure Honey 500g',
    category: 'Staples',
    brand: 'Patanjali',
    unit: 'bottle',
    price: 165.0,
    cost_price: 140.0,
    stock: 11,
    low_stock_threshold: 5,
    description: 'Natural multi-flower raw honey',
    aliases: ['honey', 'shehad', 'patanjali honey'],
    is_active: true,
  },
  {
    id: 55,
    name: 'Maggi 2-Minute Masala Noodles 70g',
    category: 'Snacks',
    brand: 'Nestle',
    unit: 'pack',
    price: 14.0,
    cost_price: 12.0,
    stock: 75,
    low_stock_threshold: 30,
    description: 'Iconic instant noodles with authentic Indian spices',
    aliases: ['maggi', 'noodles', 'maggi noodles'],
    is_active: true,
  },
];

export function getMockOverview(): BrainOverview {
  return {
    as_of: new Date().toISOString().split('T')[0],
    health_score: 72,
    score_breakdown: {
      stock_availability: 17.5,
      dead_stock: 16.8,
      margin: 17.2,
      expense_control: 20.5,
    },
    revenue_30d: 285009,
    gross_profit_30d: 33466,
    margin_pct: 11.7,
    expenses_30d: 26263,
    net_profit_30d: 7203,
    last_day_sales: 13730,
    inventory_value: 58653,
    dead_stock_locked: 5795,
    products_at_risk: 4,
  };
}

export function getMockRecommendations(): BrainRecommendation[] {
  return [
    {
      id: 1,
      type: 'reorder',
      urgency: 'high',
      product_id: 54,
      title: 'Amul Butter 100g: 2.4 din me khatam',
      detail: 'Roz ~5 bikte hain, stock sirf 12 pack bacha hai. Aaj 24 pack mangao.',
      action: 'Reorder 24',
      impact_rs: 1386,
    },
    {
      id: 2,
      type: 'reorder',
      urgency: 'medium',
      product_id: 42,
      title: 'Aashirvaad Atta 5kg: 3.2 din me khatam',
      detail: 'Roz ~14 bikte hain, stock sirf 46 pack bacha hai. Aaj 54 pack mangao.',
      action: 'Reorder 54',
      impact_rs: 13108,
    },
    {
      id: 3,
      type: 'reorder',
      urgency: 'medium',
      product_id: 48,
      title: 'Tata Tea Gold 250g: 3.3 din me khatam',
      detail: 'Roz ~5 bikte hain, stock sirf 15 pack bacha hai. Aaj 17 pack mangao.',
      action: 'Reorder 17',
      impact_rs: 2450,
    },
    {
      id: 4,
      type: 'dead_stock',
      urgency: 'medium',
      product_id: 59,
      title: "Kellogg's Corn Flakes 475g: 46 din se nahi bika",
      detail: '₹2,240 ka maal shelf par phasa hai. 10-15% discount ya bundle offer lagao.',
      action: 'Discount / Bundle',
      impact_rs: 2240,
    },
    {
      id: 5,
      type: 'dead_stock',
      urgency: 'medium',
      product_id: 61,
      title: 'Dabur Chyawanprash 1kg: 47 din se nahi bika',
      detail: '₹1,980 ka maal shelf par block hai. Winter bundle me clear karein.',
      action: 'Discount / Bundle',
      impact_rs: 1980,
    },
    {
      id: 6,
      type: 'expense_anomaly',
      urgency: 'medium',
      product_id: null,
      title: 'Wastage kharcha 8.8x badha',
      detail: 'Is hafte ₹1,880 kharch hua (normal ~₹212). Dairy/perishables audit karein.',
      action: 'Investigate',
      impact_rs: 1668,
    },
    {
      id: 7,
      type: 'margin_leak',
      urgency: 'medium',
      product_id: 45,
      title: 'Sugar 1kg: sirf 2.3% margin',
      detail: 'Mahine me 297kg bika par profit bas ₹297. Rate ₹1/kg badhane se ~₹1,188/month bachega.',
      action: 'Price +₹1',
      impact_rs: 1188,
    },
  ];
}

export function getMockInventory(): BrainInventoryItem[] {
  return [
    {
      product_id: 42,
      name: 'Aashirvaad Shudh Chakki Atta 5kg',
      category: 'Staples',
      unit: 'pack',
      cp: 218.0,
      sp: 245.0,
      stock: 46,
      daily_demand: 14.21,
      forecast_7d: 99.5,
      days_left: 3.2,
      days_since_last_sale: 0,
      qty_30d: 368,
      revenue_30d: 90160.0,
      profit_30d: 9936.0,
      margin_pct: 11.0,
      locked_cash: 10028.0,
    },
    {
      product_id: 54,
      name: 'Amul Butter 100g',
      category: 'Dairy',
      unit: 'pack',
      cp: 50.0,
      sp: 58.0,
      stock: 12,
      daily_demand: 5.0,
      forecast_7d: 35.0,
      days_left: 2.4,
      days_since_last_sale: 0,
      qty_30d: 145,
      revenue_30d: 8410.0,
      profit_30d: 1160.0,
      margin_pct: 13.8,
      locked_cash: 600.0,
    },
    {
      product_id: 50,
      name: 'Amul Gold Full Cream Milk 500ml',
      category: 'Dairy',
      unit: 'pouch',
      cp: 30.0,
      sp: 33.0,
      stock: 38,
      daily_demand: 28.5,
      forecast_7d: 199.5,
      days_left: 1.3,
      days_since_last_sale: 0,
      qty_30d: 820,
      revenue_30d: 27060.0,
      profit_30d: 2460.0,
      margin_pct: 9.1,
      locked_cash: 1140.0,
    },
    {
      product_id: 48,
      name: 'Tata Tea Gold 250g',
      category: 'Beverages',
      unit: 'pack',
      cp: 130.0,
      sp: 145.0,
      stock: 15,
      daily_demand: 4.5,
      forecast_7d: 31.5,
      days_left: 3.3,
      days_since_last_sale: 0,
      qty_30d: 130,
      revenue_30d: 18850.0,
      profit_30d: 1950.0,
      margin_pct: 10.3,
      locked_cash: 1950.0,
    },
    {
      product_id: 45,
      name: 'Madhur Pure Sugar 1kg',
      category: 'Staples',
      unit: 'kg',
      cp: 43.0,
      sp: 44.0,
      stock: 35,
      daily_demand: 10.51,
      forecast_7d: 73.6,
      days_left: 3.3,
      days_since_last_sale: 0,
      qty_30d: 297,
      revenue_30d: 13068.0,
      profit_30d: 297.0,
      margin_pct: 2.3,
      locked_cash: 1505.0,
    },
    {
      product_id: 43,
      name: 'Fortune Soya Health Refined Oil 1L',
      category: 'Staples',
      unit: 'pouch',
      cp: 128.0,
      sp: 140.0,
      stock: 58,
      daily_demand: 5.3,
      forecast_7d: 37.1,
      days_left: 10.9,
      days_since_last_sale: 0,
      qty_30d: 161,
      revenue_30d: 22540.0,
      profit_30d: 1932.0,
      margin_pct: 8.6,
      locked_cash: 7424.0,
    },
    {
      product_id: 44,
      name: 'Tata Salt Vacuum Evaporated 1kg',
      category: 'Staples',
      unit: 'pack',
      cp: 24.0,
      sp: 28.0,
      stock: 50,
      daily_demand: 8.11,
      forecast_7d: 56.8,
      days_left: 6.2,
      days_since_last_sale: 1,
      qty_30d: 240,
      revenue_30d: 6720.0,
      profit_30d: 960.0,
      margin_pct: 14.3,
      locked_cash: 1200.0,
    },
    {
      product_id: 46,
      name: 'Tata Sampann Unpolished Toor Dal 1kg',
      category: 'Staples',
      unit: 'kg',
      cp: 138.0,
      sp: 155.0,
      stock: 45,
      daily_demand: 6.5,
      forecast_7d: 45.5,
      days_left: 6.9,
      days_since_last_sale: 1,
      qty_30d: 218,
      revenue_30d: 33790.0,
      profit_30d: 3706.0,
      margin_pct: 11.0,
      locked_cash: 6210.0,
    },
    {
      product_id: 59,
      name: "Kellogg's Corn Flakes 475g",
      category: 'Breakfast',
      unit: 'box',
      cp: 165.0,
      sp: 195.0,
      stock: 14,
      daily_demand: 0.2,
      forecast_7d: 1.4,
      days_left: 70.0,
      days_since_last_sale: 46,
      qty_30d: 2,
      revenue_30d: 390.0,
      profit_30d: 60.0,
      margin_pct: 15.4,
      locked_cash: 2310.0,
    },
    {
      product_id: 61,
      name: 'Dabur Chyawanprash 1kg',
      category: 'Healthcare',
      unit: 'jar',
      cp: 335.0,
      sp: 395.0,
      stock: 8,
      daily_demand: 0.1,
      forecast_7d: 0.7,
      days_left: 80.0,
      days_since_last_sale: 47,
      qty_30d: 1,
      revenue_30d: 395.0,
      profit_30d: 60.0,
      margin_pct: 15.2,
      locked_cash: 2680.0,
    },
    {
      product_id: 60,
      name: 'Patanjali Pure Honey 500g',
      category: 'Staples',
      unit: 'bottle',
      cp: 140.0,
      sp: 165.0,
      stock: 11,
      daily_demand: 0.2,
      forecast_7d: 1.4,
      days_left: 55.0,
      days_since_last_sale: 46,
      qty_30d: 3,
      revenue_30d: 495.0,
      profit_30d: 75.0,
      margin_pct: 15.2,
      locked_cash: 1540.0,
    },
    {
      product_id: 55,
      name: 'Maggi 2-Minute Masala Noodles 70g',
      category: 'Snacks',
      unit: 'pack',
      cp: 12.0,
      sp: 14.0,
      stock: 75,
      daily_demand: 18.0,
      forecast_7d: 126.0,
      days_left: 4.1,
      days_since_last_sale: 0,
      qty_30d: 520,
      revenue_30d: 7280.0,
      profit_30d: 1040.0,
      margin_pct: 14.3,
      locked_cash: 900.0,
    },
  ];
}

export function getMockFinance(): BrainFinance {
  return {
    weekly: [
      { week_ending: '2026-09-10', revenue: 70469, gross_profit: 8480, expenses: 3491, net: 4989 },
      { week_ending: '2026-09-17', revenue: 72531, gross_profit: 8449, expenses: 1110, net: 7339 },
      { week_ending: '2026-09-24', revenue: 62255, gross_profit: 7296, expenses: 1295, net: 6002 },
      { week_ending: '2026-10-01', revenue: 64199, gross_profit: 7488, expenses: 18168, net: -10680 },
      { week_ending: '2026-10-08', revenue: 70787, gross_profit: 8337, expenses: 3328, net: 5009 },
      { week_ending: '2026-10-15', revenue: 62009, gross_profit: 7370, expenses: 1296, net: 6074 },
      { week_ending: '2026-10-22', revenue: 64049, gross_profit: 7488, expenses: 1273, net: 6215 },
      { week_ending: '2026-10-29', revenue: 73008, gross_profit: 8526, expenses: 3226, net: 5300 },
    ],
    expense_by_category_30d: {
      rent: 8000.0,
      salary: 9000.0,
      transport: 3432.0,
      electricity: 2200.0,
      wastage: 2520.0,
      misc: 1111.0,
    },
  };
}

export function getMockExpenses(): BrainExpenseInsight[] {
  return [
    { category: 'wastage', last_7d: 1880.0, normal_weekly: 212.5, ratio: 8.85, anomaly: true },
    { category: 'transport', last_7d: 1225.0, normal_weekly: 756.25, ratio: 1.62, anomaly: true },
    { category: 'misc', last_7d: 121.0, normal_weekly: 247.5, ratio: 0.49, anomaly: false },
    { category: 'electricity', last_7d: 0.0, normal_weekly: 550.0, ratio: 0.0, anomaly: false },
    { category: 'rent', last_7d: 0.0, normal_weekly: 2000.0, ratio: 0.0, anomaly: false },
    { category: 'salary', last_7d: 0.0, normal_weekly: 2250.0, ratio: 0.0, anomaly: false },
  ];
}

export function getMockBacktest(days: number = 7): BrainBacktest {
  return {
    window_days: days,
    predicted_units: 1017,
    actual_units: 973,
    accuracy_pct: 88.4,
  };
}

export function getMockSummary(): { text: string } {
  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    text: `🚀 ProfitPilot Executive Briefing — ${todayStr}
Health Score: 72/100 (Optimal Performance)
Kal ki bikri ₹13,730 | 30 din ka net profit ₹7,203

Aaj ke top 3 priority decisions:
1. 📦 Amul Butter 100g: 2.4 din me khatam — Roz ~5 bikte hain, stock sirf 12 bacha hai. Aaj 24 pack mangao.
2. 📦 Aashirvaad Atta 5kg: 3.2 din me khatam — Roz ~14 bikte hain, stock sirf 46 bacha hai. Aaj 54 pack mangao.
3. ⚠️ Wastage kharcha 8.8x badha — Is hafte ₹1,880 kharch hua (normal ₹212). Dairy and perishables check karein.`,
  };
}

export function getMockDashboardStats(): DashboardStats {
  return {
    today_orders: 14,
    today_revenue: 5420.0,
    today_profit: 1150.0,
    today_margin_pct: 21.2,
    week_orders: 98,
    week_revenue: 38400.0,
    week_profit: 8120.0,
    week_margin_pct: 21.1,
    month_orders: 382,
    month_revenue: 152800.0,
    month_profit: 31950.0,
    month_margin_pct: 20.9,
    low_stock_count: 3,
    pending_deliveries: 2,
    total_products: 115,
    total_customers: 40,
    inventory_value: 261669.91,
    potential_profit: 44096.09,
  };
}

export function getMockCustomers(): CustomerWithStats[] {
  return [
    {
      id: 1,
      name: 'Rahul Sharma',
      phone: '9876543210',
      address: 'Flat 402, Royal Palms Apartment, Sector 62, Noida',
      created_at: '2026-09-01T10:00:00',
      order_count: 14,
      total_spent: 6420.0,
      last_order_at: '2026-10-29T14:00:00',
    },
    {
      id: 2,
      name: 'Pooja Verma',
      phone: '9876543211',
      address: 'B-12, Sector 55, Noida',
      created_at: '2026-09-05T11:20:00',
      order_count: 9,
      total_spent: 3850.0,
      last_order_at: '2026-10-28T18:30:00',
    },
    {
      id: 3,
      name: 'Amit Kumar',
      phone: '9876543212',
      address: 'House 88, Near Shiv Mandir, Sector 12',
      created_at: '2026-09-10T09:15:00',
      order_count: 18,
      total_spent: 8940.0,
      last_order_at: '2026-10-29T09:30:00',
    },
    {
      id: 4,
      name: 'Sunita Devi',
      phone: '9876543213',
      address: 'C-45, Green Valley, Indirapuram',
      created_at: '2026-09-12T16:00:00',
      order_count: 7,
      total_spent: 2890.0,
      last_order_at: '2026-10-26T12:00:00',
    },
    {
      id: 5,
      name: 'Ramesh Patel',
      phone: '9876543214',
      address: 'Shop 4, Main Market, Sector 18',
      created_at: '2026-09-15T14:45:00',
      order_count: 22,
      total_spent: 14200.0,
      last_order_at: '2026-10-29T11:00:00',
    },
  ];
}

export function getMockOrders(): OrderBrief[] {
  return [
    {
      id: 1024,
      customer_name: 'Rahul Sharma',
      item_count: 3,
      total: 670.0,
      status: 'out_for_delivery',
      created_at: '2026-10-30T10:15:00',
    },
    {
      id: 1023,
      customer_name: 'Pooja Verma',
      item_count: 2,
      total: 420.0,
      status: 'out_for_delivery',
      created_at: '2026-10-30T09:40:00',
    },
    {
      id: 1022,
      customer_name: 'Amit Kumar',
      item_count: 4,
      total: 1150.0,
      status: 'delivered',
      created_at: '2026-10-29T18:20:00',
    },
    {
      id: 1021,
      customer_name: 'Sunita Devi',
      item_count: 1,
      total: 245.0,
      status: 'delivered',
      created_at: '2026-10-29T16:05:00',
    },
    {
      id: 1020,
      customer_name: 'Ramesh Patel',
      item_count: 5,
      total: 1890.0,
      status: 'delivered',
      created_at: '2026-10-29T12:30:00',
    },
  ];
}

export function getMockAgentEvents(): AgentEvent[] {
  return [
    {
      id: 1,
      order_id: 1024,
      session_id: 'sess-8491',
      event_type: 'intent_parsed',
      description: 'Extracted 3 order items from WhatsApp chat: Atta, Milk, Bread',
      status: 'completed',
      tool_name: 'nlp_intent_parser',
      tool_input: { channel: 'whatsapp', lang: 'hinglish' },
      tool_output: { items: 3, confidence: 0.98 },
      confidence: 0.98,
      timestamp: '2026-10-30T10:15:02',
    },
    {
      id: 2,
      order_id: 1024,
      session_id: 'sess-8491',
      event_type: 'inventory_verified',
      description: 'Verified stock availability across all 3 requested items',
      status: 'completed',
      tool_name: 'inventory_verifier',
      tool_input: { product_ids: [42, 50, 51] },
      tool_output: { in_stock: true, reserved: true },
      confidence: 1.0,
      timestamp: '2026-10-30T10:15:05',
    },
    {
      id: 3,
      order_id: 1024,
      session_id: 'sess-8491',
      event_type: 'delivery_dispatched',
      description: 'Order assigned to fleet partner Raju Kumar (ETA: 18 mins)',
      status: 'in_progress',
      tool_name: 'dispatch_router',
      tool_input: { order_id: 1024, priority: 'high' },
      tool_output: { rider_id: 4, eta_minutes: 18 },
      confidence: 0.95,
      timestamp: '2026-10-30T10:16:10',
    },
  ];
}

export function mockBrainChat(q: string): { answer: string; source: string } {
  const t = q.toLowerCase().trim();

  // 1. Greeting
  if (/^(hi|hello|namaste|hey|pranam|ram ram)/i.test(t)) {
    return {
      answer: `🙏 **Namaste! Main ProfitPilot Decision Brain hoon.**\n\nAap mujhse dukaan ke bare me kuch bhi pooch sakte hain:\n• *"Is hafte kya mangau?"*\n• *"Atta ka stock kab khatam hoga?"*\n• *"Kahan paisa phasa hai?"*\n• *"Profit kyu gira?"*\n• *"Subah ka dimaag summary do"*`,
      source: 'profitpilot_ai_engine',
    };
  }

  // 2. Specific product search
  for (const p of MOCK_PRODUCTS) {
    if (p.aliases.some((a) => t.includes(a)) || t.includes(p.name.toLowerCase())) {
      const daily = p.id === 42 ? 14.2 : p.id === 50 ? 28.5 : p.id === 54 ? 5.0 : 4.2;
      const daysLeft = (p.stock / daily).toFixed(1);
      const isUrgent = parseFloat(daysLeft) <= 5;
      return {
        answer: `📦 **${p.name}**:\n• **Current Stock**: ${p.stock} ${p.unit}\n• **Rozana Bikri**: ~${daily} ${p.unit}/din\n• **Stock Bacha Hai**: ${daysLeft} din\n• **Status**: ${isUrgent ? '⚠️ Urgent Reorder Chahiye!' : '✅ Stock Safe & Normal'}\n• **Selling Price**: ₹${p.price} (Cost: ₹${p.cost_price || p.price * 0.88})`,
        source: 'profitpilot_inventory_intelligence',
      };
    }
  }

  // 3. Reorder enquiry
  if (/(mangau|reorder|khatam|stock|order|supply|chahiye)/i.test(t)) {
    return {
      answer: `📦 **Urgent Reorder Required (Stock khatam hone wala hai):**\n\n• **Amul Butter 100g** — 2.4 din me khatam. Stock: 12 pack. **Aaj 24 pack mangao.**\n• **Aashirvaad Atta 5kg** — 3.2 din me khatam. Stock: 46 pack. **Aaj 54 pack mangao.**\n• **Tata Tea Gold 250g** — 3.3 din me khatam. Stock: 15 pack. **Aaj 17 pack mangao.**\n• **Sugar 1kg** — 3.3 din me khatam. Stock: 35 kg. **Aaj 40 kg mangao.**`,
      source: 'demand_forecast_model',
    };
  }

  // 4. Dead stock
  if (/(dead|phasa|nahi bik|slow|pada|purana|block)/i.test(t)) {
    return {
      answer: `🔒 **₹5,795 ka maal shelf par blocked hai (Dead Stock):**\n\n• **Kellogg's Corn Flakes 475g**: 46 din se nahi bika (₹2,240 blocked). *15% discount ya bundle offer lagayein.*\n• **Dabur Chyawanprash 1kg**: 47 din se nahi bika (₹1,980 blocked). *Winter immunity combo banayein.*\n• **Patanjali Honey 500g**: 46 din se nahi bika (₹1,575 blocked).`,
      source: 'dead_stock_analyzer',
    };
  }

  // 5. Margin / Profit
  if (/(margin|munafa|rate|price|daam|profit|kamai|nafa)/i.test(t)) {
    return {
      answer: `📊 **Profit & Margin Health Report (Last 30 Days):**\n\n• **Kul Bikri (Revenue)**: ₹2,85,009\n• **Gross Profit**: ₹33,466 (Average Margin: **11.7%**)\n• **Kharche (Expenses)**: ₹26,263\n• **Net Munafa**: **₹7,203**\n\n⚠️ **Margin Leak Warning**: **Sugar 1kg** par sirf 2.3% margin mil raha hai. Rate ₹1 badhane se mahine ke ₹1,188 extra bachenge.`,
      source: 'margin_intelligence',
    };
  }

  // 6. Expenses / Kharche
  if (/(kharch|expense|bill|wastage|bijli|kiraya|salary)/i.test(t)) {
    return {
      answer: `⚠️ **Expense Anomaly Detected:**\n\n• **Wastage (Kharabi)**: Is hafte **₹1,880** hua (Normal average ₹212 tha). **8.8x spike!** Kripya dairy aur bakery storage check karein.\n• **Transport (Auto/Dhulai)**: Is hafte **₹1,225** laga (Normal ₹756). 1.6x badha.\n• **Fixed Costs**: Rent ₹8,000 | Staff Salary ₹9,000 | Bijli Bill ₹2,200.`,
      source: 'expense_audit_engine',
    };
  }

  // 7. Executive summary
  if (/(summary|subah|aaj|overview|dimaag|briefing)/i.test(t)) {
    return {
      answer: getMockSummary().text,
      source: 'daily_executive_brief',
    };
  }

  // 8. Health score
  if (/(health|score|kaisa)/i.test(t)) {
    return {
      answer: `🏥 **Dukaan Health Score: 72/100 (Healthy)**\n\n• Stock Availability: 17.5 / 25\n• Dead Stock Recovery: 16.8 / 25\n• Margin Health: 17.2 / 25\n• Expense Control: 20.5 / 25\n\nStore is performing well. Low stock items reorder karte hi score **85+** ho jayega!`,
      source: 'store_health_engine',
    };
  }

  // Default fallback
  return {
    answer: `💡 **ProfitPilot AI Analysis for: "${q}"**\n\nAapki dukaan ka data check kiya gaya:\n• Active SKUs: **115 Products**\n• Average Basket Size: **₹388**\n• Today's Orders: **14** (Revenue: ₹5,420)\n• Reorder Recommendations: **4 items urgent**\n\nAap specific sawaal pooch sakte hain jaise: *"Is hafte kya mangau?"* ya *"Atta ka stock kab khatam hoga?"*`,
    source: 'profitpilot_ai_engine',
  };
}

export function mockProcessCustomerRequest(
  message: string,
  customerPhone: string = '9876543210',
  channel: string = 'whatsapp',
  _selections: any[] = []
): OrderResult {
  const msgLower = message.toLowerCase();

  // Match items based on message text
  const items: any[] = [];

  // Match Atta
  if (/atta|aata|flour/i.test(msgLower)) {
    const qty = parseInt(msgLower.match(/(\d+)\s*(?:pack|packet|kg|bori)?\s*(?:atta|aata)/i)?.[1] || '1', 10);
    items.push({
      product_id: 42,
      product_name: 'Aashirvaad Shudh Chakki Atta 5kg',
      brand: 'Aashirvaad',
      unit: 'pack',
      quantity: Math.min(qty, 5),
      unit_price: 245.0,
      total_price: 245.0 * Math.min(qty, 5),
      stock_available: 46,
      confidence: 0.98,
      match_explanation: 'Matched "atta" to Aashirvaad 5kg',
    });
  }

  // Match Milk
  if (/milk|doodh/i.test(msgLower)) {
    const qty = parseInt(msgLower.match(/(\d+)\s*(?:pouch|packet|ltr|liter)?\s*(?:milk|doodh)/i)?.[1] || '2', 10);
    items.push({
      product_id: 50,
      product_name: 'Amul Gold Full Cream Milk 500ml',
      brand: 'Amul',
      unit: 'pouch',
      quantity: Math.min(qty, 10),
      unit_price: 33.0,
      total_price: 33.0 * Math.min(qty, 10),
      stock_available: 38,
      confidence: 0.99,
      match_explanation: 'Matched "doodh" to Amul Gold Milk 500ml',
    });
  }

  // Match Bread
  if (/bread|double roti/i.test(msgLower)) {
    const qty = parseInt(msgLower.match(/(\d+)\s*(?:pack|packet)?\s*(?:bread)/i)?.[1] || '1', 10);
    items.push({
      product_id: 51,
      product_name: 'Harvest Gold White Bread 400g',
      brand: 'Harvest Gold',
      unit: 'pack',
      quantity: Math.min(qty, 5),
      unit_price: 45.0,
      total_price: 45.0 * Math.min(qty, 5),
      stock_available: 18,
      confidence: 0.97,
      match_explanation: 'Matched "bread" to Harvest Gold White Bread 400g',
    });
  }

  // Match Sugar
  if (/sugar|cheeni|chini/i.test(msgLower)) {
    const qty = parseInt(msgLower.match(/(\d+)\s*(?:kg|kilo|packet)?\s*(?:sugar|cheeni|chini)/i)?.[1] || '1', 10);
    items.push({
      product_id: 45,
      product_name: 'Madhur Pure Sugar 1kg',
      brand: 'Madhur',
      unit: 'kg',
      quantity: Math.min(qty, 5),
      unit_price: 44.0,
      total_price: 44.0 * Math.min(qty, 5),
      stock_available: 35,
      confidence: 0.96,
      match_explanation: 'Matched "sugar" to Madhur Pure Sugar 1kg',
    });
  }

  // Match Butter
  if (/butter|makkhan|makhan/i.test(msgLower)) {
    items.push({
      product_id: 54,
      product_name: 'Amul Butter 100g',
      brand: 'Amul',
      unit: 'pack',
      quantity: 1,
      unit_price: 58.0,
      total_price: 58.0,
      stock_available: 12,
      confidence: 0.99,
      match_explanation: 'Matched "butter" to Amul Butter 100g',
    });
  }

  // Match Tea
  if (/tea|chai|chaipatti/i.test(msgLower)) {
    items.push({
      product_id: 48,
      product_name: 'Tata Tea Gold 250g',
      brand: 'Tata',
      unit: 'pack',
      quantity: 1,
      unit_price: 145.0,
      total_price: 145.0,
      stock_available: 15,
      confidence: 0.98,
      match_explanation: 'Matched "tea" to Tata Tea Gold 250g',
    });
  }

  // If nothing matched, provide default realistic items
  if (items.length === 0) {
    items.push(
      {
        product_id: 50,
        product_name: 'Amul Gold Full Cream Milk 500ml',
        brand: 'Amul',
        unit: 'pouch',
        quantity: 2,
        unit_price: 33.0,
        total_price: 66.0,
        stock_available: 38,
        confidence: 0.95,
        match_explanation: 'Auto-resolved common morning kirana order',
      },
      {
        product_id: 51,
        product_name: 'Harvest Gold White Bread 400g',
        brand: 'Harvest Gold',
        unit: 'pack',
        quantity: 1,
        unit_price: 45.0,
        total_price: 45.0,
        stock_available: 18,
        confidence: 0.95,
        match_explanation: 'Auto-resolved common morning kirana order',
      }
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const delivery_fee = 30.0;
  const total = subtotal + delivery_fee;
  const orderId = Math.floor(1000 + Math.random() * 9000);

  const customerName = 'Rahul Sharma';
  const deliveryAddress = 'Flat 402, Royal Palms Apartment, Sector 62, Noida';

  const itemListText = items.map((i) => `• ${i.quantity}x ${i.product_name} (₹${i.total_price})`).join('\n');

  const confirmHi = `Namaste ${customerName} Ji! 🙏\n\nProfitPilot Hub se aapka order confirm ho gaya hai:\n\n${itemListText}\n\nDelivery Fee: ₹${delivery_fee}\n*Total Bill: ₹${total}*\nPayment: Cash on Delivery / UPI\n\nRaju Kumar (Activa UP-16-AB-1234) 15-20 min me pahunch rahe hain! 🛵`;

  const confirmEn = `Hello ${customerName}! Your order #${orderId} from ProfitPilot Hub is confirmed:\n\n${itemListText}\n\nDelivery Fee: ₹${delivery_fee}\nTotal: ₹${total}\nEstimated Delivery: 15-20 mins.`;

  return {
    success: true,
    order_id: orderId,
    order_display_id: `ORD-${orderId}`,
    customer_name: customerName,
    items,
    subtotal,
    delivery_fee,
    total,
    delivery_requested: true,
    delivery_address: deliveryAddress,
    confirmation_message: confirmEn,
    confirmation_message_hi: confirmHi,
    low_stock_alerts: [
      {
        product_name: 'Amul Butter 100g',
        current_stock: 12,
        threshold: 20,
        suggested_restock: 24,
      },
    ],
    agent_events: [
      {
        id: 1,
        order_id: orderId,
        session_id: 'sess-live',
        event_type: 'intent_parsed',
        description: `Customer WhatsApp message processed. Extracted ${items.length} items.`,
        status: 'completed',
        tool_name: 'nlp_intent_parser',
        tool_input: { text: message, channel },
        tool_output: { items: items.length },
        confidence: 0.97,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        order_id: orderId,
        session_id: 'sess-live',
        event_type: 'customer_lookup',
        description: `Customer matched: ${customerName} (${customerPhone}). Trust score: 94/100.`,
        status: 'completed',
        tool_name: 'crm_lookup',
        tool_input: { phone: customerPhone },
        tool_output: { name: customerName, address: deliveryAddress },
        confidence: 1.0,
        timestamp: new Date().toISOString(),
      },
      {
        id: 3,
        order_id: orderId,
        session_id: 'sess-live',
        event_type: 'inventory_verified',
        description: 'All items verified in stock and reserved successfully.',
        status: 'completed',
        tool_name: 'inventory_agent',
        tool_input: { items: items.map((i) => i.product_id) },
        tool_output: { success: true },
        confidence: 1.0,
        timestamp: new Date().toISOString(),
      },
      {
        id: 4,
        order_id: orderId,
        session_id: 'sess-live',
        event_type: 'delivery_dispatched',
        description: 'Assigned to nearest delivery runner Raju Kumar (ETA: 18m).',
        status: 'completed',
        tool_name: 'dispatch_engine',
        tool_input: { order_id: orderId },
        tool_output: { rider: 'Raju Kumar', eta: '18 mins' },
        confidence: 0.96,
        timestamp: new Date().toISOString(),
      },
    ],
    alternatives: [],
    error: null,
    operator_confidence: {
      product_matching: 0.97,
      inventory_verification: 1.0,
      order_confidence: 0.98,
    },
    delivery_person: {
      name: 'Raju Kumar',
      phone: '+91 98765 43219',
      vehicle: 'Honda Activa (UP-16-AB-1234)',
    },
    dispatch: {
      delivery_person_name: 'Raju Kumar',
      delivery_person_phone: '+91 98765 43219',
    },
  };
}

export function mockSubmitQuickEntry(text: string): { ok: boolean; type?: string; message: string } {
  const t = text.toLowerCase();

  // Expense
  if (/bijli|electricity|light|kiraya|rent|salary|tankhwah|bhada|auto|transport|kharab|waste|misc|chai/i.test(t)) {
    const num = t.match(/\d+/)?.[0] || '500';
    return {
      ok: true,
      type: 'expense',
      message: `✅ ₹${num} ka kharcha ProfitPilot ledger me record ho gaya!`,
    };
  }

  // Restock
  if (/aaya|aaye|mangaya|restock|khareeda|stock/i.test(t)) {
    const num = t.match(/\d+/)?.[0] || '10';
    return {
      ok: true,
      type: 'restock',
      message: `✅ ${num} units stock ProfitPilot inventory me add ho gaya!`,
    };
  }

  // Sale
  if (/becha|bech|bika|sale|sold/i.test(t)) {
    const num = t.match(/\d+/)?.[0] || '2';
    return {
      ok: true,
      type: 'sale',
      message: `✅ ${num} units bikri record ho gayi aur stock deduct ho gaya!`,
    };
  }

  return {
    ok: true,
    type: 'general',
    message: `✅ ProfitPilot Brain me record ho gaya: "${text}"`,
  };
}
