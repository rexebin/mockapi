import { baseUrl, repositoryFactory } from '../server/server';
import { Todo, todoKey, todoSeeds } from '../entities';
import axios from 'axios';

describe('Create Item', function () {
  const repository = repositoryFactory<Todo>(todoKey);
  it('should add new todo', async function () {
    const { data: existingTodos } = repository.getItems();
    expect(existingTodos).toMatchObject(todoSeeds);

    await axios.post(`${baseUrl}/${todoKey}`, {
      id: '4',
      title: 'Todo 4',
      completed: false,
    });

    const { data: newTodos } = repository.getItems();
    expect(newTodos).toMatchObject([
      ...todoSeeds,
      {
        completed: false,
        id: '4',
        title: 'Todo 4',
      },
    ]);
  });
});
