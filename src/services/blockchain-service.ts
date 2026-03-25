import axios from 'axios';

const BLOCKCHAIN_BASE_URL = 'https://deploy-6oeg.onrender.com';

const blockchainClient = axios.create({
  baseURL: BLOCKCHAIN_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle auth if needed (though the schema indicates login exists)
blockchainClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('blockchain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blockchainService = {
  // Auth
  login: (username: string) => blockchainClient.post('/api/auth/login', { username }),
  getProfile: () => blockchainClient.get('/api/auth/me'),

  // Chain
  getChain: (page = 1, per_page = 10) => 
    blockchainClient.get('/api/chain', { params: { page, per_page } }),
  getChainStats: () => blockchainClient.get('/api/chain/stats'),
  verifyChain: () => blockchainClient.get('/api/chain/verify'),

  // Evidence
  getEvidence: () => blockchainClient.get('/api/evidence'),
  getLatestLines: (limit = 100) => 
    blockchainClient.get('/api/evidence/latest-lines', { params: { limit } }),
  submitEvidence: (formData: FormData) => 
    blockchainClient.post('/api/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadEvidence: (evidenceId: string) => 
    blockchainClient.get(`/api/evidence/${evidenceId}/download`, { responseType: 'blob' }),

  // Network
  getNetworkStatus: () => blockchainClient.get('/api/network/status'),
  resetNetwork: () => blockchainClient.post('/api/network/reset'),
};

export default blockchainService;
