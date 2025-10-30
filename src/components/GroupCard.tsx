import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Group } from "@/lib/mockData";
import { Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface GroupCardProps {
  group: Group;
}

const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <Link to={`/group/${group.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative p-6 bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group overflow-hidden">
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:via-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
          
          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              <div className="flex -space-x-3">
                {group.members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-slate-900 border-2 border-card shadow-lg"
                    title={member.name}
                  >
                    {member.avatar}
                  </div>
                ))}
                {group.members.length > 3 && (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border-2 border-card">
                    +{group.members.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {group.members.length} members
                </span>
                <Badge variant="secondary" className="gap-1 bg-white/10 text-foreground border-white/20">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Total Spend</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  ${group.totalSpend.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Created {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};

export default GroupCard;
