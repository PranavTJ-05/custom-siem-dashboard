import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { ShieldCheck, Lock, User } from "lucide-react"

import { authService } from "@/services/api-services"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authService.login({ username, password })

      // Look for standard FastAPI OAuth2 response or the legacy response
      const token = response.data.access_token || (response.data.data && response.data.data.token)

      if (token) {
        login(token)
        navigate("/")
      } else {
        setError("Invalid response from server. Please check your credentials.")
      }
    } catch (err: any) {
      console.error("Login failed:", err)
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Invalid credentials. Please try again."
      // If detail is an array (FastAPI validation error), parse it
      const finalMsg = Array.isArray(errorMsg) ? errorMsg.map(e => e.msg).join(', ') : errorMsg;
      setError(typeof finalMsg === 'string' ? finalMsg : "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-6 overflow-hidden bg-background">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] text-primary-foreground">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              SIEM <span className="text-primary">Ops</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Advanced Threat Defense</p>
          </div>
        </div>

        <Card className="border-border/30 bg-card/50 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-700">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">System Login</CardTitle>
            <CardDescription className="text-sm">
              Authorization required for secure dashboard access.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    placeholder="Security Identifier"
                    className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Access Key"
                    className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in shake-in">
                  <p className="text-xs text-destructive font-bold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    {error}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 font-bold text-base shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all transform active:scale-95" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  "Establish Connection"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            &copy; 2026 SIEM INFRASTRUCTURE SECURE CORE
          </p>
          <div className="flex gap-4">
             <div className="h-1 w-1 rounded-full bg-primary/30" />
             <div className="h-1 w-1 rounded-full bg-primary/30" />
             <div className="h-1 w-1 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
