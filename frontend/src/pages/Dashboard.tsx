import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material";
import { CheckSquare, TrendingUp, FileText, Video } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, Tooltip as PieTooltip
} from "recharts";
import {
  getDashboardStats, getSkillData, getProgressData, getDashboardInsights,
  DashboardStats, SkillData, ProgressData, DashboardInsights
} from "../services/dashboardService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserName = (): string => {
  try {
    const raw = localStorage.getItem("ml_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const name =
        parsed?.name ||
        parsed?.displayName ||
        parsed?.username ||
        parsed?.email?.split("@")[0];
      if (name) return name;
    }
  } catch {}
  return "there";
};

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = {
  blue:   "#3b82f6",
  purple: "#a855f7",
  pink:   "#ec4899",
  amber:  "#f59e0b",
  green:  "#22c55e",
};

const PIE_COLORS = [PALETTE.blue, PALETTE.purple, PALETTE.pink, PALETTE.amber, PALETTE.green];

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

const CustomLineTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? "#0f172a" : "#ffffff",
      border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
      borderRadius: 10, padding: "10px 16px",
      color: isDark ? "#e2e8f0" : "#1e293b",
      fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    }}>
      <div style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ color: PALETTE.blue, fontWeight: 700, fontSize: 18 }}>{payload[0].value}%</div>
    </div>
  );
};

const CustomRadarTooltip = ({ active, payload, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? "#0f172a" : "#ffffff",
      border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
      borderRadius: 10, padding: "10px 16px",
      color: isDark ? "#e2e8f0" : "#1e293b", fontSize: 13,
    }}>
      <div style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>{payload[0]?.name}</div>
      <div style={{ color: PALETTE.purple, fontWeight: 700, fontSize: 18 }}>{payload[0]?.value}</div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, color, icon: Icon, isDark,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
  isDark: boolean;
}) => (
  <div style={{
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${color}30`,
    borderRadius: 16, padding: "24px 28px",
    flex: 1, minWidth: 160,
    position: "relative", overflow: "hidden",
    boxShadow: isDark ? `0 4px 24px ${color}18` : `0 4px 24px rgba(0,0,0,0.08)`,
  }}>
    {/* glow blob */}
    <div style={{
      position: "absolute", top: -30, right: -30,
      width: 100, height: 100,
      background: `radial-gradient(circle, ${color}30, transparent 70%)`,
      borderRadius: "50%", pointerEvents: "none",
    }} />
    {/* Icon badge */}
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 46, height: 46, borderRadius: 12,
      background: `${color}18`, marginBottom: 14,
    }}>
      <Icon size={22} color={color} strokeWidth={2} />
    </div>
    <div style={{
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", marginBottom: 6,
    }}>{label}</div>
    <div style={{ color, fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ color: isDark ? "#475569" : "#94a3b8", fontSize: 12, marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({ title, children, style, isDark }: {
  title: string; children: React.ReactNode; style?: React.CSSProperties; isDark: boolean;
}) => (
  <div style={{
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
    borderRadius: 16, padding: "28px",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
    ...style,
  }}>
    <div style={{
      color: isDark ? "#e2e8f0" : "#1e293b",
      fontSize: 15, fontWeight: 700, marginBottom: 24,
    }}>{title}</div>
    {children}
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const Shimmer = ({ w, h, r = 10, isDark }: { w: string | number; h: number; r?: number; isDark: boolean }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: isDark
      ? "linear-gradient(90deg, #1e293b 25%, #293548 50%, #1e293b 75%)"
      : "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  }} />
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const Dashboard = () => {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const [userName, setUserName]       = useState<string>("there");
  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [skillData, setSkillData]     = useState<SkillData[]>([]);
  const [progress, setProgress]       = useState<ProgressData[]>([]);
  const [insights, setInsights]       = useState<DashboardInsights | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, sk, pr, ins] = await Promise.all([
        getDashboardStats(),
        getSkillData(),
        getProgressData(),
        getDashboardInsights(),
      ]);
      setStats(s);
      setSkillData(sk);
      setProgress(pr);
      setInsights(ins);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setUserName(getUserName());
  }, [load]);

  const delta = progress.length >= 2
    ? progress[progress.length - 1].score - progress[0].score
    : 0;

  const pieData = skillData.map(s => ({ name: s.name, value: s.value }));

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const textPrimary   = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textMuted     = isDark ? "#475569" : "#94a3b8";
  const gridColor     = isDark ? "#1e293b" : "#e2e8f0";
  const barTrack      = isDark ? "#1e293b" : "#f1f5f9";
  const pageBg        = isDark ? "#060d1a" : "#f8fafc";
  const insightsBg    = isDark
    ? "linear-gradient(135deg, #0f172a 0%, #1a103a 100%)"
    : "linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%)";

  if (loading) {
    return (
      <div style={{ ...styles.page, background: pageBg }}>
        <style>{buildKeyframes(isDark)}</style>
        <div className="bg-animate"><div className="bg-blob" /></div>
        <Shimmer w={360} h={52} isDark={isDark} />
        <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
          {[1,2,3,4].map(i => <Shimmer key={i} w="23%" h={130} r={16} isDark={isDark} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24 }}>
          <Shimmer w="100%" h={340} r={16} isDark={isDark} />
          <Shimmer w="100%" h={340} r={16} isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, background: pageBg }}>
      <style>{buildKeyframes(isDark)}</style>
      <div className="bg-animate"><div className="bg-blob" /></div>

      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            color: textSecondary,
            fontSize: 30,        // increased
            fontWeight: 500,
            margin: 0,
          }}>
            Welcome back,
          </h1>
          <h1 style={{
            margin: 0,
            fontSize: 46,        // increased
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {userName} 👋
          </h1>
        </div>
        <p style={{ color: textMuted, fontSize: 15, margin: "10px 0 0" }}>
          {stats?.assessmentsCompleted === 0
            ? "Start an assessment to see your stats!"
            : `Tracking ${stats?.assessmentsCompleted} assessments · Overall score ${stats?.overallScore}%`}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Assessments"   value={stats?.assessmentsCompleted ?? 0} color={PALETTE.blue}   icon={CheckSquare} isDark={isDark} />
        <StatCard label="Overall Score" value={`${stats?.overallScore ?? 0}%`}   color={PALETTE.purple} icon={TrendingUp}  isDark={isDark} sub={`+${delta}% this period`} />
        <StatCard label="Resume Scans"  value={stats?.resumesAnalyzed ?? 0}      color={PALETTE.pink}   icon={FileText}    isDark={isDark} />
        <StatCard label="Interviews"    value={stats?.mockInterviewsTaken ?? 0}  color={PALETTE.amber}  icon={Video}       isDark={isDark} />
      </div>

      {/* ── Row 1: Skill Distribution + Performance Trend ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 20 }}>

        <SectionCard title="Skill Distribution" isDark={isDark}>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    onMouseEnter={(_, i) => setActiveSkill(pieData[i].name)}
                    onMouseLeave={() => setActiveSkill(null)}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        opacity={activeSkill && activeSkill !== entry.name ? 0.4 : 1}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <PieTooltip contentStyle={{
                    background: isDark ? "#0f172a" : "#ffffff",
                    border: `1px solid ${gridColor}`,
                    borderRadius: 10, color: textPrimary, fontSize: 13,
                  }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: textSecondary }} />
                </PieChart>
              </ResponsiveContainer>
              {activeSkill && (
                <div style={{ textAlign: "center", marginTop: 4, color: textSecondary, fontSize: 13 }}>
                  Hovering: <span style={{ color: textPrimary, fontWeight: 700 }}>{activeSkill}</span>
                  {" — "}
                  <span style={{ color: PALETTE.blue }}>
                    {skillData.find(s => s.name === activeSkill)?.value}%
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: textMuted, fontSize: 14, textAlign: "center", paddingTop: 80 }}>
              No skill data yet
            </div>
          )}
        </SectionCard>

        <SectionCard title="Performance Trend — Last 6 Months" isDark={isDark}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progress} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={PALETTE.blue} />
                  <stop offset="100%" stopColor={PALETTE.purple} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 12 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 12 }} />
              <Tooltip content={<CustomLineTooltip isDark={isDark} />} cursor={{ stroke: gridColor, strokeWidth: 2 }} />
              <Line
                type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={3}
                dot={{ r: 5, fill: PALETTE.blue, stroke: isDark ? "#0f172a" : "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: PALETTE.purple, stroke: isDark ? "#0f172a" : "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Row 2: Skill Radar ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionCard title="Skill Radar" isDark={isDark}>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={440}>
              <RadarChart cx="50%" cy="50%" outerRadius="52%" data={skillData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: textSecondary, fontWeight: 600 }}
                  tickLine={false}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip content={<CustomRadarTooltip isDark={isDark} />} />
                <Radar
                  name="Score" dataKey="value"
                  stroke={PALETTE.purple} fill={PALETTE.purple} fillOpacity={0.25} strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: textMuted, fontSize: 14, textAlign: "center", paddingTop: 80 }}>
              Complete an assessment to see your skill breakdown
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 3: AI Career Insights ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionCard title="AI Career Insights" isDark={isDark} style={{ background: insightsBg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginTop: -8 }}>
            <span style={{
              background: insights?.trend === "improving"
                ? (isDark ? "#14532d" : "#dcfce7")
                : (isDark ? "#78350f" : "#fef9c3"),
              color: insights?.trend === "improving"
                ? (isDark ? "#4ade80" : "#16a34a")
                : (isDark ? "#fcd34d" : "#b45309"),
              fontSize: 12, fontWeight: 700, padding: "3px 12px",
              borderRadius: 20, letterSpacing: "0.04em",
            }}>
              {insights?.trend === "improving" ? "↑ IMPROVING" : "→ STAGNANT"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ color: isDark ? "#4ade80" : "#16a34a", fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Strengths</div>
              {insights?.strengths.map((s, i) => (
                <div key={i} style={{ color: textPrimary, fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${gridColor}` }}>{s}</div>
              ))}
            </div>
            <div>
              <div style={{ color: isDark ? "#fcd34d" : "#b45309", fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>! Growth Areas</div>
              {insights?.weaknesses.map((w, i) => (
                <div key={i} style={{ color: textPrimary, fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${gridColor}` }}>{w}</div>
              ))}
            </div>
            <div>
              <div style={{ color: PALETTE.blue, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>→ To Do</div>
              {insights?.recommendations.map((r, i) => (
                <div key={i} style={{
                  color: textSecondary, fontSize: 12, padding: "7px 10px",
                  background: isDark ? "#1e293b" : "#f1f5f9",
                  borderRadius: 8, marginBottom: 8, lineHeight: 1.5,
                }}>{r}</div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Skill Bar Breakdown ── */}
      <SectionCard title="Skill Score Breakdown" isDark={isDark}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {skillData.map((skill, i) => (
            <div key={skill.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>{skill.name}</span>
                <span style={{ color: PIE_COLORS[i % PIE_COLORS.length], fontSize: 13, fontWeight: 700 }}>{skill.value}%</span>
              </div>
              <div style={{ background: barTrack, borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{
                  width: `${skill.value}%`, height: "100%",
                  background: `linear-gradient(90deg, ${PIE_COLORS[i % PIE_COLORS.length]}, ${PIE_COLORS[(i+1) % PIE_COLORS.length]})`,
                  borderRadius: 99,
                  animation: `growBar 1.2s ${i * 0.1}s both cubic-bezier(0.34,1.56,0.64,1)`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px 40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    maxWidth: 1400,
    margin: "0 auto",
    position: "relative",
    zIndex: 0,
  } as React.CSSProperties,
};

const buildKeyframes = (isDark: boolean) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  html, body, #root { background: ${isDark ? "#060d1a" : "#f8fafc"}; min-height: 100vh; }
  .bg-animate {
    position: fixed; inset: 0; z-index: -1;
    background: ${isDark ? "#060d1a" : "#f8fafc"};
    overflow: hidden; pointer-events: none;
  }
  .bg-animate::before {
    content: ''; position: absolute; width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, ${isDark ? "rgba(59,130,246,0.13)" : "rgba(59,130,246,0.07)"} 0%, transparent 70%);
    top: -200px; left: -150px; animation: driftA 18s ease-in-out infinite alternate;
  }
  .bg-animate::after {
    content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, ${isDark ? "rgba(168,85,247,0.11)" : "rgba(168,85,247,0.06)"} 0%, transparent 70%);
    bottom: -180px; right: -100px; animation: driftB 22s ease-in-out infinite alternate;
  }
  .bg-blob {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, ${isDark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.05)"} 0%, transparent 70%);
    top: 40%; left: 55%; transform: translate(-50%, -50%);
    animation: driftC 26s ease-in-out infinite alternate; pointer-events: none;
  }
  @keyframes driftA {
    0%   { transform: translate(0px,0px) scale(1); }
    50%  { transform: translate(140px,90px) scale(1.2); }
    100% { transform: translate(70px,180px) scale(0.95); }
  }
  @keyframes driftB {
    0%   { transform: translate(0px,0px) scale(1); }
    50%  { transform: translate(-110px,-70px) scale(1.15); }
    100% { transform: translate(-190px,50px) scale(1.25); }
  }
  @keyframes driftC {
    0%   { transform: translate(-50%,-50%) scale(1); }
    50%  { transform: translate(-60%,-30%) scale(1.3); }
    100% { transform: translate(-40%,-60%) scale(0.85); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes growBar { from { width: 0%; } }
`;

export default Dashboard;
