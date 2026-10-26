export interface SerializedTransaction {
  id: number;
  type: "EXPENSE" | "INCOME";
  amount: number;
  category: string;
  note: string | null;
  date: string; // YYYY-MM-DD
}
