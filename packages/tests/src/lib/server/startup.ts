import { setupServer } from 'msw/node';
import {
  heroHandlers,
  heroKey,
  seedHeroes,
  seedTodos,
  todoKey,
} from '../entities';
import { clearAllData, handlerFactory } from './server';

const handlers = [
  ...handlerFactory(todoKey),
  ...handlerFactory(heroKey, heroHandlers),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());

beforeEach(() => {
  seedTodos();
  seedHeroes();
});

afterEach(() => {
  clearAllData();
  server.resetHandlers();
});

afterAll(() => server.close());
