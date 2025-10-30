import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Expense, mockMembers } from "@/lib/mockData";
import { Calendar, Lock } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const payer = mockMembers.find(m => m.id === expense.paidBy);
  const splitAmount = expense.amount / expense.participants.length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Housing: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      Utilities: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      Food: "bg-green-500/10 text-green-700 dark:text-green-300",
      Travel: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      Accommodation: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{expense.description}</h4>
              <p className="text-sm text-muted-foreground">
                Paid by {payer?.name}
              </p>
            </div>
            {expense.isSmartContract && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Lock className="w-3 h-3" />
                Smart Contract
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getCategoryColor(expense.category)}>
              {expense.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(expense.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="text-2xl font-bold text-foreground">
            ${expense.amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            ${splitAmount.toFixed(2)} per person
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
