import { configMockApi } from '@mockapi/msw';
export const baseUrl = 'http://localhost:5000/api/v1';

export const { handlerFactory, repositoryFactory, clearAllData } =
  configMockApi({
    baseUrl: baseUrl,
  });
