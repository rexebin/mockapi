import { baseUrl } from '../server/server';
import { todoKey, todoSeeds } from '../entities';
import axios from 'axios';

describe('Get Items Endpoint', function () {
  it('should get todos', async function () {
    const data = await axios.get(`${baseUrl}/${todoKey}`);
    expect(data.data).toMatchObject(todoSeeds);
  });
});
