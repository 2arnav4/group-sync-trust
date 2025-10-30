import { Card } from "@/components/ui/card";
import { Group } from "@/lib/mockData";
import { Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface GroupCardProps {
  group: Group;
}

const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <Link to={`/group/${group.id}`}>
      <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 group animate-scale-in">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {group.name}
            </h3>
            <div className="flex -space-x-2">
              {group.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white border-2 border-card"
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {group.members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground border-2 border-card">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.members.length} members
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Total spend
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {group.currency} {group.totalSpend.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GroupCard;
