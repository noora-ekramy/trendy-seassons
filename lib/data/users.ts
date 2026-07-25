export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "customer";
  ordersCount: number;
  totalSpent: number;
  joinDate: string;
}

export const users: UserRecord[] = [];
