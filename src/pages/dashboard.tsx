import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { ShieldAlert, ShieldCheck, Activity, Settings, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom'

// Mock data placeholder - will be replaced by alerts API soon
const securitySections = [
  {
    title: "Endpoint Security",
    tiles: [
      { name: "Configuration Assessment", description: "Scan your assets as part of a configuration assessment audit.", icon: Settings },
      { name: "File Integrity Monitoring", description: "Alerts related to file changes, including permissions, content, etc.", icon: ShieldCheck },
      { name: "Malware Detection", description: "Check indicators of compromise triggered by malware infections.", icon: ShieldAlert },
    ]
  },
  {
    title: "Threat Intelligence",
    tiles: [
      { name: "Threat Hunting", description: "Browse through your security alerts, identifying issues and threats.", icon: Activity },
      { name: "MITRE ATT&CK", description: "Explore security alerts mapped to adversary tactics and techniques.", icon: ShieldAlert },
      { name: "Vulnerability Detection", description: "Discover what applications in your environment are affected.", icon: ShieldCheck },
    ]
  }
]


import { agentService, alertsService } from "@/services/api-services"
import { useEffect, useState } from "react"
export default function Dashboard() {
  const [agentStats, setAgentStats] = useState<any[]>([])
  const [severityData, setSeverityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentRes, alertsRes] = await Promise.all([
          agentService.getAgentStatusSummary(),
          alertsService.getAlertsSummary()
        ])

        if (agentRes.data && agentRes.data.data) {
          const stats = agentRes.data.data.connection || {}
          setAgentStats([
             { name: 'Active', value: stats.active || 0, color: '#10b981' },
             { name: 'Disconnected', value: stats.disconnected || 0, color: '#ef4444' },
             { name: 'Never Connected', value: stats.never_connected || 0, color: '#94a3b8' },
          ])
        }

        if (alertsRes.data && alertsRes.data.data) {
           const counts = alertsRes.data.data;
           setSeverityData([
             { name: 'Critical', value: counts.critical || 0, color: '#ef4444', level: '15 or higher' },
             { name: 'High', value: counts.high || 0, color: '#f97316', level: '12 to 14' },
             { name: 'Medium', value: counts.medium || 0, color: '#3b82f6', level: '7 to 11' },
             { name: 'Low', value: counts.low || 0, color: '#94a3b8', level: '0 to 6' },
           ]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
     return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard data...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Agents Summary & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Agents Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {agentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex gap-4 mt-2">
                {agentStats.map(stat => (
                  <div key={stat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span>{stat.name} ({stat.value})</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Last 24 Hours Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
              {severityData.map((sev) => {
                const colors: Record<string, { bg: string, text: string, border: string }> = {
                  'Critical': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-200' },
                  'High': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200' },
                  'Medium': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
                  'Low': { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-200' }
                };
                const theme = colors[sev.name] || colors['Low'];
                
                return (
                  <div 
                    key={sev.name} 
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-xl border-2 shadow-sm transition-all hover:shadow-md hover:scale-105 group",
                      theme.bg, 
                      theme.border
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2 truncate w-full text-center">{sev.name} severity</span>
                    <span className={cn("text-4xl font-black mb-2 tabular-nums", theme.text)}>
                      {sev.value}
                    </span>
                    <span className="text-[10px] font-medium opacity-50 text-center">Rule level {sev.level}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Operations Sections */}
      {securitySections.map((section) => (
        <div key={section.title} className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 whitespace-nowrap">{section.title}</span>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.tiles.map((tile) => {
              const card = (
                <Card key={tile.name} className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-2 rounded-md bg-slate-100 group-hover:bg-primary/10 transition-colors">
                      <tile.icon className="h-5 w-5 text-slate-600 group-hover:text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-sm">{tile.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">{tile.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );

              if (tile.name === "Configuration Assessment") {
                return (
                  <Link key={tile.name} to="/sca">
                    {card}
                  </Link>
                );
              }

              return <div key={tile.name}>{card}</div>;
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
