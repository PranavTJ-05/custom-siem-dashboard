import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  FileText,
  RefreshCw
} from "lucide-react"
import { blockchainService } from "@/services/blockchain-service"

export default function BlockchainPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [evidence, setEvidence] = useState<any[]>([])
  const [networkStatus, setNetworkStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [blocksRes, statsRes, evidenceRes, statusRes] = await Promise.all([
        blockchainService.getChain(currentPage),
        blockchainService.getChainStats(),
        blockchainService.getLatestLines(100),
        blockchainService.getNetworkStatus()
      ])

      setBlocks(blocksRes.data.data?.blocks || [])
      setStats(statsRes.data.data)
      
      const rawEvidence = evidenceRes.data.data || []
      const sortedEvidence = rawEvidence.sort((a: any, b: any) => {
         const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
         const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
         return timeB - timeA;
      })
      setEvidence(sortedEvidence)
      
      setNetworkStatus(statusRes.data.data)
    } catch (err) {
      console.error("Failed to fetch blockchain data:", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(true)
    
    // Poll every 5 seconds for live updates
    const interval = setInterval(() => {
      fetchData(false)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPage])

  const handleVerify = async () => {
    setVerifying(true)
    setVerificationResult(null)
    try {
      const res = await blockchainService.verifyChain()
      setVerificationResult(res.data)
    } catch (err) {
      console.error("Verification failed:", err)
      setVerificationResult({ status: 'error', message: 'Verification node unreachable' })
    } finally {
      setVerifying(false)
    }
  }

  if (loading && blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Syncing with blockchain network...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Network Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl overflow-hidden group">
          <CardContent className="p-6 relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Database className="h-12 w-12 text-primary" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Block Height</p>
             <h3 className="text-3xl font-black tabular-nums text-white">
               {networkStatus?.block_height ?? stats?.total_blocks ?? 0}
             </h3>
             <p className="text-[10px] text-primary/60 mt-1 font-medium">Genesis: Oct 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl group">
          <CardContent className="p-6 relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Activity className="h-12 w-12 text-blue-500" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Live Transactions</p>
             <h3 className="text-3xl font-black tabular-nums text-white">
               {stats?.total_transactions || 0}
             </h3>
             <p className="text-[10px] text-blue-500/60 mt-1 font-medium">Immutability Guaranteed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl group">
          <CardContent className="p-6 relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-12 w-12 text-emerald-500" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Network Status</p>
             <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-white">{networkStatus?.status || 'Online'}</h3>
             </div>
             <p className="text-[10px] text-emerald-500/60 mt-1 font-medium italic">{networkStatus?.node_count || 12} decentralized nodes</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-white border-none shadow-xl relative overflow-hidden flex flex-col justify-center items-center group cursor-pointer transition-all hover:scale-105" onClick={handleVerify}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <CardContent className="p-0 z-10 text-center flex flex-col items-center gap-2">
             {verifying ? (
               <Loader2 className="h-6 w-6 animate-spin" />
             ) : (
               <ShieldCheck className="h-6 w-6" />
             )}
             <span className="text-xs font-bold uppercase tracking-widest">Verify Integrity</span>
          </CardContent>
          {verificationResult && (
            <div className="absolute bottom-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md text-[9px] font-bold border border-white/10 animate-in slide-in-from-bottom-2">
              {verificationResult.authorized ? 'INTEGRITY VERIFIED' : 'CHECK FAILED'}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Table */}
        <Card className="lg:col-span-2 border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02] py-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white">Mainnet Ledger</CardTitle>
              <CardDescription className="text-slate-400">Immutable record of all security commits</CardDescription>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-slate-400" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                 <ChevronLeft className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-slate-400" onClick={() => setCurrentPage(p => p + 1)}>
                 <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[80px] text-slate-500 font-bold uppercase text-[10px]">Block</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Timestamp</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-[10px]">Hash</TableHead>
                  <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-32 text-center text-slate-500 italic opacity-50">
                        No blocks found on the current chain segment
                     </TableCell>
                  </TableRow>
                ) : (
                  blocks.map((block) => (
                    <TableRow key={block.index} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-black text-primary">#{block.index}</TableCell>
                      <TableCell className="text-xs text-slate-300 whitespace-nowrap">
                        12 minutes ago
                      </TableCell>
                      <TableCell className="font-mono text-[10px] break-all max-w-[200px] text-slate-400 group-hover:text-slate-200 transition-colors">
                        {block.hash}
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-slate-500">
                           <ChevronRight className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Evidence Logs Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white">
                  <FileText className="h-4 w-4 text-primary" /> Live Logs
                </CardTitle>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold bg-primary/20 text-primary border-none">LIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-6">
              <div className="flex flex-col gap-3">
                {evidence.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic text-xs opacity-50">
                    No active evidence streams detected
                  </div>
                ) : (
                  evidence.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 shadow-sm hover:border-primary/30 transition-all cursor-default group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-primary transition-colors" title={`TX: ${item.tx_id}`}>
                          {item.evidence_id}
                        </span>
                        <span className="text-[9px] font-medium text-slate-600 italic">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                      <div className="bg-slate-950/50 rounded-md p-2 border border-white/5">
                        <p className="text-sm font-semibold text-emerald-400 break-all font-mono leading-tight">
                          {item.last_line}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-slate-700 text-slate-400 font-medium lowercase">
                          {item.filename}
                        </Badge>
                        <span className="text-[8px] text-slate-600 font-mono truncate max-w-[100px]" title={item.tx_id}>
                          tx: {item.tx_id?.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-primary flex gap-2 hover:bg-white/5 transition-all" onClick={() => fetchData(true)}>
                <RefreshCw className="h-3 w-3" /> Refresh Streams
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-white/5 shadow-2xl relative overflow-hidden min-h-[140px] flex flex-col justify-center group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <ShieldCheck className="h-24 w-24 text-white" />
             </div>
             <CardContent className="p-6 relative z-10">
               <h4 className="text-white font-bold text-sm mb-2">Immutable Protocol V1</h4>
               <p className="text-slate-400 text-[10px] leading-relaxed mb-4 font-medium">
                 All security telemetry is cryptographically signed and committed to the decentralized registry to prevent tamper-attacks.
               </p>
               <Button className="w-full bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest h-9 border border-white/10 shadow-lg transition-all">
                 Network Config
               </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
