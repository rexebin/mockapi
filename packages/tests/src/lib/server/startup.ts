import { setupServer } from 'msw/node';
import {
  heroHandlers,
  heroKey,
  seedHeroes,
  seedTodos,
  todoKey,
} from '../entities';
import { handlerFactory } from './server';

const handlers = [
  ...handlerFactory(todoKey),
  ...handlerFactory(heroKey, heroHandlers),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());

beforeEach(() => {
  seedTodos();
  seedHeroes();
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => server.close());
