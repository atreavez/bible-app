import { motion } from "framer-motion";
import { Flame, Trophy, BookOpen, Star, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export default function Progress() {
  const { stats } = useReadingProgress();

  const unlockedCount = stats.achievements.filter((a) => a.unlockedAt).length;
  const totalCount = stats.achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />
      <div className="pt-20 pb-12 px-4 md:px-6 max-w-5xl mx-auto">
        <GsapReveal className="text-center mb-10" direction="scale">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Your <span className="text-gradient-gold italic">Journey</span>
          </h1>
        </GsapReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Flame, label: "Current Streak", value: `${stats.streak} days`, color: "text-orange-500" },
            { icon: Star, label: "Longest Streak", value: `${stats.longestStreak} days`, color: "text-gold" },
            { icon: BookOpen, label: "Chapters Read", value: String(stats.chaptersRead), color: "text-olive" },
            { icon: Target, label: "Books Started", value: String(Object.keys(stats.readHistory).length), color: "text-accent" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="ornate-border rounded-2xl bg-card/80 p-5 text-center"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <OrnamentDivider />

        {/* Achievements */}
        <GsapReveal className="mt-10 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gold" />
              Achievements
            </h2>
            <span className="font-body text-sm text-muted-foreground">
              {unlockedCount}/{totalCount} · {progressPercent}%
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-olive to-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </GsapReveal>

        <div className="grid sm:grid-cols-2 gap-4">
          {stats.achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`ornate-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 ${
                achievement.unlockedAt
                  ? "bg-olive/5 border-gold/30"
                  : "bg-card/50 opacity-60"
              }`}
            >
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {achievement.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              {achievement.unlockedAt && (
                <span className="font-body text-xs text-gold">✓ Unlocked</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Reading History */}
        {Object.keys(stats.readHistory).length > 0 && (
          <>
            <OrnamentDivider className="my-10" />
            <GsapReveal>
              <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-olive" />
                Books You've Read
              </h2>
            </GsapReveal>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.readHistory).map(([book, chapters]) => (
                <div key={book} className="ornate-border rounded-xl bg-card/80 p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground">{book}</h3>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {chapters.length} chapter{chapters.length > 1 ? "s" : ""} read
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {chapters.sort((a, b) => +a - +b).map((ch) => (
                      <span key={ch} className="w-6 h-6 rounded bg-olive/20 text-olive font-body text-xs flex items-center justify-center">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
