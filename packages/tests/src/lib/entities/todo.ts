import { repositoryFactory } from '../server/server';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export const todoKey = 'Todo';

export const todoSeeds: Todo[] = [
  {
    id: '1',
    title: 'Todo 1',
    completed: false,
  },
  {
    id: '2',
    title: 'Todo 2',
    completed: false,
  },
  {
    id: '3',
    title: 'Todo 3',
    completed: false,
  },
];

export function seedTodos() {
  const repository = repositoryFactory<Todo>(todoKey);
  repository.seed(todoSeeds);
}
