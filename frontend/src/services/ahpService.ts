import api from './api';

export const ahpService = {
  async saveComparison(matrix: number[][]) {
    const response = await api.post('/ahp/comparisons', { matrix });
    return response.data;
  },
  async getComparison() {
    const response = await api.get('/ahp/comparisons');
    return response.data;
  },
}; 