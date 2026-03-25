import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, RefreshCcw, MoreHorizontal, Laptop, Server, Globe, ShieldCheck, Activity } from "lucide-react"
import { agentService } from "@/services/api-services"
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await agentService.getAgents();
        // OpenAPI spec says: { data: { affected_items: [...] }, message: "...", error: 0 }
        if (response.data && response.data.data && response.data.data.affected_items) {
          setAgents(response.data.data.affected_items);
        }
      } catch (e) {
        console.error("Failed to fetch agents:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [])

  const filteredAgents = agents.filter(agent => 
    (agent.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (agent.ip || '').includes(searchTerm) ||
    (agent.os?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    { label: "Total Agents", value: agents.length.toString(), icon: Globe, color: "text-blue-500" },
    { label: "Active", value: agents.filter(a => a.status === 'active').length.toString(), icon: ShieldCheck, color: "text-green-500" },
    { label: "Disconnected", value: agents.filter(a => a.status === 'disconnected').length.toString(), icon: Activity, color: "text-red-500" },
    { label: "Never Connected", value: agents.filter(a => a.status === 'never_connected').length.toString(), icon: Laptop, color: "text-slate-400" },
  ]

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading agents data...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold font-heading">Agents Management</h1>
         <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
               <RefreshCcw className="h-4 w-4" />
               Refresh
            </Button>
            <Button size="sm" className="gap-2">
               <Plus className="h-4 w-4" />
               Deploy New Agent
            </Button>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold">Agents List</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, IP or OS..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Agent Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Last Keep-Alive</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="cursor-pointer hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs">{agent.id}</TableCell>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-xs font-mono">{agent.ip}</TableCell>
                    <TableCell>
                      <Badge variant={
                        agent.status === 'active' ? 'outline' : 
                        agent.status === 'disconnected' ? 'destructive' : 'secondary'
                      } className={`capitalize py-0 px-2 h-5 text-[10px] ${agent.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                        {agent.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        {agent.os?.name?.toLowerCase().includes('windows') ? <Laptop className="h-3 w-3" /> : <Server className="h-3 w-3" />}
                        {agent.os?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal italic">{agent.group || 'default'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{agent.lastKeepAlive || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 text-primary">
                         <Link to={`/sca/${agent.id}`}>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title="View SCA">
                              <ShieldCheck className="h-4 w-4" />
                           </Button>
                         </Link>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No agents found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
