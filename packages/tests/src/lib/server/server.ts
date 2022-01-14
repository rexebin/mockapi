import { configMockApi } from '@mockapi/msw';
export const baseUrl = 'http://localhost:5000';

export const { handlerFactory, repositoryFactory } = configMockApi({
  baseUrl: baseUrl,
});
