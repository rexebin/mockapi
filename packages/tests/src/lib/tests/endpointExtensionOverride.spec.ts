import axios from 'axios';

import { heroKey } from '../entities';
import { baseUrl } from '../server/server';

describe('Endpoints Extension and Override', function () {
  it('should override default read todo api with custom endpoint', async function () {
    const data = await axios.get(`${baseUrl}/${heroKey}`, {
      params: { search: 'Iron' },
    });
    expect(data.data).toMatchObject([
      {
        id: '1',
        name: 'Iron Man',
      },
    ]);
  });

  it('should add custom endpoint', async function () {
    const data = await axios.get(
      `${baseUrl}/${heroKey}/getByName/${encodeURI('Iron Man')}`
    );
    expect(data.data).toMatchObject({
      id: '1',
      name: 'Iron Man',
    });
  });
});
