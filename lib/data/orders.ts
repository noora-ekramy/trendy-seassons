export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentMethod: string;
  date: string;
  createdAt: string;
}

export const orders: Order[] = [
  {
    id: "ORD-001",
    customerId: "user-1",
    customerName: "أحمد علي",
    customerEmail: "ahmed@email.com",
    items: [
      { productId: "prod-1", name: "NVIDIA GeForce RTX 4090", quantity: 1, price: 85000 },
      { productId: "prod-8", name: "G.Skill Trident Z5 RGB DDR5 32GB", quantity: 2, price: 7000 },
    ],
    total: 98000,
    status: "delivered",
    shippingAddress: "القاهرة، مصر الجديدة",
    paymentMethod: "cod",
    date: "2026-02-18",
    createdAt: "2026-02-18",
  },
  {
    id: "ORD-002",
    customerId: "user-2",
    customerName: "سارة حسن",
    customerEmail: "sara@email.com",
    items: [
      { productId: "prod-5", name: "Intel Core i9-14900K", quantity: 1, price: 30000 },
      { productId: "prod-10", name: "Samsung 990 Pro 2TB NVMe SSD", quantity: 1, price: 9000 },
    ],
    total: 39000,
    status: "shipped",
    shippingAddress: "الإسكندرية، سموحة",
    paymentMethod: "instapay",
    date: "2026-02-20",
    createdAt: "2026-02-20",
  },
  {
    id: "ORD-003",
    customerId: "user-3",
    customerName: "محمد خالد",
    customerEmail: "mohammed@email.com",
    items: [
      { productId: "prod-7", name: "AMD Ryzen 7 7800X3D", quantity: 1, price: 22000 },
    ],
    total: 22000,
    status: "processing",
    shippingAddress: "الجيزة، الدقي",
    paymentMethod: "vodafone_cash",
    date: "2026-02-21",
    createdAt: "2026-02-21",
  },
  {
    id: "ORD-004",
    customerId: "user-4",
    customerName: "فاطمة عمر",
    customerEmail: "fatima@email.com",
    items: [
      { productId: "prod-14", name: "LG 27GP850-B شاشة ألعاب 27 بوصة", quantity: 1, price: 19000 },
      { productId: "prod-15", name: "Logitech G Pro X Superlight 2", quantity: 1, price: 8500 },
    ],
    total: 27500,
    status: "pending",
    shippingAddress: "القاهرة، المعادي",
    paymentMethod: "cod",
    date: "2026-02-22",
    createdAt: "2026-02-22",
  },
  {
    id: "ORD-005",
    customerId: "user-5",
    customerName: "عمر يوسف",
    customerEmail: "omar@email.com",
    items: [
      { productId: "prod-3", name: "NVIDIA GeForce RTX 4070 Ti Super", quantity: 1, price: 42000 },
      { productId: "prod-6", name: "AMD Ryzen 9 7950X", quantity: 1, price: 33000 },
    ],
    total: 75000,
    status: "delivered",
    shippingAddress: "المنصورة، حي الجامعة",
    paymentMethod: "instapay",
    date: "2026-02-15",
    createdAt: "2026-02-15",
  },
  {
    id: "ORD-006",
    customerId: "user-1",
    customerName: "أحمد علي",
    customerEmail: "ahmed@email.com",
    items: [
      { productId: "prod-16", name: "NZXT Kraken X73 RGB AIO", quantity: 1, price: 13500 },
    ],
    total: 13500,
    status: "shipped",
    shippingAddress: "القاهرة، مصر الجديدة",
    paymentMethod: "cod",
    date: "2026-02-19",
    createdAt: "2026-02-19",
  },
  {
    id: "ORD-007",
    customerId: "user-6",
    customerName: "ليلى إبراهيم",
    customerEmail: "layla@email.com",
    items: [
      { productId: "prod-12", name: "NZXT H7 Flow RGB", quantity: 1, price: 8000 },
      { productId: "prod-13", name: "Corsair RM1000x 1000W PSU", quantity: 1, price: 10500 },
    ],
    total: 18500,
    status: "cancelled",
    shippingAddress: "طنطا، شارع البحر",
    paymentMethod: "vodafone_cash",
    date: "2026-02-17",
    createdAt: "2026-02-17",
  },
];

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}
