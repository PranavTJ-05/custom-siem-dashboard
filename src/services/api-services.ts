import apiClient from '../lib/api-client';

export const authService = {
  login: (credentials: any) => {
    const params = new URLSearchParams()
    if (credentials.username) params.append('username', credentials.username)
    if (credentials.password) params.append('password', credentials.password)
    
    return apiClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
};

export const agentService = {
  getAgents: (params?: any) => apiClient.get('/agents', { params }),
  getAgentStats: (params?: any) => apiClient.get('/agents/stats/distinct', { params }),
  getAgentSummary: (params?: any) => apiClient.get('/agents/summary', { params }),
  getAgentStatusSummary: (params?: any) => apiClient.get('/agents/summary/status', { params }),
  getAgentOSSummary: (params?: any) => apiClient.get('/agents/summary/os', { params }),
  addAgent: (agentData: any, params?: any) => apiClient.post('/agents', agentData, { params }),
  deleteAgent: (params: { agents_list: string; status: string; purge?: boolean }) => 
    apiClient.delete('/agents', { params }),
};

export const overviewService = {
  getOverviewAgents: () => apiClient.get('/overview/agents'),
};

export const managerService = {
  getInfo: () => apiClient.get('/manager/info'),
  getStatus: () => apiClient.get('/manager/status'),
  getStats: () => apiClient.get('/manager/stats'),
  getStatsHourly: () => apiClient.get('/manager/stats/hourly'),
  getConfiguration: (params?: any) => apiClient.get('/manager/configuration', { params }),
  getLogs: (params?: any) => apiClient.get('/manager/logs', { params }),
};

export const scaService = {
  getAgentSca: (agentId: string, params?: any) => apiClient.get(`/sca/${agentId}`, { params }),
  getScaChecks: (agentId: string, policyId: string, params?: any) => 
    apiClient.get(`/sca/${agentId}/checks/${policyId}`, { params }),
};

export const alertsService = {
  getAlertsSummary: () => apiClient.get('/alerts/summary/severity'),
};
