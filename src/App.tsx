import { AuthProvider, useAuth } from './context/auth-context'
import { TooltipProvider } from './components/ui/tooltip'
import { AppShell } from './components/layout/app-shell'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import AgentsPage from './pages/agents'
import ScaPage from './pages/sca'
import LoginPage from './pages/login'


function AppRoutes() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/sca/:agentId?" element={<ScaPage />} />
        <Route path="/settings" element={<div className="text-2xl font-bold">Settings Coming Soon</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Router>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
