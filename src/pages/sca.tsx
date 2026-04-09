import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { scaService } from "@/services/api-services"
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, ShieldCheck, Activity, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ScaPage() {
  const { agentId: paramAgentId } = useParams()
  const isOverview = !paramAgentId
  const agentId = paramAgentId || "000"
  
  const [policies, setPolicies] = useState<any[]>([])
  const [overviewData, setOverviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isOverview) {
          const [res000, res001] = await Promise.all([
            scaService.getAgentSca("000"),
            scaService.getAgentSca("001")
          ]);
          
          const processResults = (id: string, response: any) => {
            const items = response.data?.data?.affected_items || [];
            const avgScore = items.length > 0 
              ? Math.round(items.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / items.length)
              : 0;
            const totalPass = items.reduce((acc: number, item: any) => acc + (item.pass || 0), 0);
            const totalFail = items.reduce((acc: number, item: any) => acc + (item.fail || 0), 0);
            
            return {
              id,
              name: id === "000" ? "Manager" : `Agent ${id}`,
              score: avgScore,
              pass: totalPass,
              fail: totalFail,
              total: items.length
            };
          };

          setOverviewData([
            processResults("000", res000),
            processResults("001", res001)
          ]);
        } else {
          const response = await scaService.getAgentSca(agentId);
          if (response.data && response.data.data && response.data.data.affected_items) {
            setPolicies(response.data.data.affected_items);
          }
        }
      } catch (e) {
        console.error("Failed to fetch SCA data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agentId, isOverview])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium animate-pulse">Auditing configurations...</span>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score > 80) return "text-emerald-600";
    if (score > 50) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score: number) => {
    if (score > 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score > 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  }

  if (isOverview) {
    return (
      <div className="flex flex-col gap-8 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-800 font-heading underline decoration-primary/30 decoration-4 underline-offset-8">
            Security Configuration Assessment
          </h1>
          <p className="text-muted-foreground text-sm font-medium opacity-80 mt-2">
            Select an active agent to review compliance benchmarks and security posture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {overviewData.map((agent) => (
            <Link key={agent.id} to={`/sca/${agent.id}`} className="group relative block transition-all duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[var(--radius)] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative bg-white border-slate-200 group-hover:bg-slate-50/50 transition-all overflow-hidden h-full flex flex-col shadow-md">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">{agent.name}</CardTitle>
                        <CardDescription className="font-mono text-[10px] tracking-wider uppercase opacity-50">System Identity: {agent.id}</CardDescription>
                      </div>
                    </div>
                    <div className={cn("text-4xl font-black tabular-nums tracking-tighter drop-shadow-sm", getScoreColor(agent.score))}>
                      {agent.score}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 flex-grow flex flex-col gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                      <span>Network Compliance</span>
                      <span className={getScoreColor(agent.score)}>{agent.score}% Score</span>
                    </div>
                    <Progress value={agent.score} className="h-2.5 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                     <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200 group-hover:border-emerald-300 transition-colors">
                        <span className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{agent.pass}</span>
                        <span className="text-[9px] uppercase font-black text-emerald-500/60 tracking-widest mt-1">Passed</span>
                     </div>
                     <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50 border border-rose-200 group-hover:border-rose-300 transition-colors">
                        <span className="text-2xl font-black text-rose-600 font-mono tracking-tighter">{agent.fail}</span>
                        <span className="text-[9px] uppercase font-black text-rose-500/60 tracking-widest mt-1">Failed</span>
                     </div>
                     <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-colors">
                        <span className="text-2xl font-black text-slate-600 font-mono tracking-tighter">{agent.total}</span>
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">Policies</span>
                     </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      Analyze detailed security audits <ArrowLeft className="h-3 w-3 rotate-180" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
           <Link to="/sca">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                 <ArrowLeft className="h-5 w-5" />
              </Button>
           </Link>
           <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Security Configuration Assessment</h1>
              <p className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-widest">
                Targeting Agent: <span className="text-primary font-bold">{agentId}</span>
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {policies.length > 0 ? policies.map((policy) => (
          <Card key={policy.id} className="group relative overflow-hidden bg-white border-slate-200 hover:border-slate-300 transition-all hover:shadow-md shadow-sm">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-sm font-bold text-slate-700 leading-tight group-hover:text-primary transition-colors">{policy.name}</CardTitle>
                <div className="p-2 rounded-lg bg-slate-100 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <div className={cn("text-3xl font-black font-mono tracking-tighter", getScoreColor(policy.score))}>
                     {policy.score}%
                   </div>
                   <div className="text-[10px] uppercase font-black text-muted-foreground/40 vertical-btm mb-1">Pass rate</div>
                </div>
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getScoreBg(policy.score))}>
                   {policy.score > 80 ? 'Compliant' : policy.score > 50 ? 'Warning' : 'Critical'}
                </div>
              </div>

              <Progress value={policy.score} className="h-1.5 mb-6 bg-slate-100" />

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-xs font-black text-emerald-600 font-mono tracking-tighter">{policy.pass || 0}</span>
                  <span className="text-[8px] uppercase font-black text-emerald-500/60 tracking-wider">Passed</span>
                </div>
                <div className="flex flex-col p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-xs font-black text-rose-600 font-mono tracking-tighter">{policy.fail || 0}</span>
                  <span className="text-[8px] uppercase font-black text-rose-500/60 tracking-wider">Failed</span>
                </div>
                <div className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-black text-slate-600 font-mono tracking-tighter">{(policy.pass || 0) + (policy.fail || 0)}</span>
                  <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Total</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-muted-foreground/60 italic font-medium">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
            No security policies have been evaluated for this agent yet.
          </div>
        )}
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Compliance Audit Trail</CardTitle>
            <CardDescription className="text-xs">Individual check results for the selected security policy.</CardDescription>
          </div>
          <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100 text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                <TableHead className="w-[120px] px-6">Definition ID</TableHead>
                <TableHead className="px-6">Requirement Description</TableHead>
                <TableHead className="px-6">Status</TableHead>
                <TableHead className="text-right px-6">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-slate-50 border-slate-100 transition-colors">
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground/50 italic font-medium">
                   <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="h-8 w-8 opacity-10" />
                      <span>Select a benchmark card above to populate detailed findings.</span>
                   </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
