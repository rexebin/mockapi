import { errorResponseFactory } from '@mockapi/msw';

import { Hero, heroKey } from './hero';
import { rest } from 'msw';
import { baseUrl, repositoryFactory } from '../server/server';

const repository = repositoryFactory<Hero>(heroKey);

export const heroHandlers = [
  rest.get(`${baseUrl}/${heroKey}`, (req, res, ctx) => {
    const { data: items = [], error } = repository.getItems();
    if (error) {
      return errorResponseFactory(res, ctx)(error);
    }
    const search = req.url.searchParams.get('search');
    const result = items.filter((hero) =>
      search ? hero.name.toLowerCase().includes(search?.toLowerCase()) : true
    );

    return res(ctx.status(200), ctx.json(result));
  }),

  rest.get(`${baseUrl}/${heroKey}/getByName/:name`, (req, res, ctx) => {
    const { data: items = [], error } = repository.getItems();
    if (error) {
      return errorResponseFactory(res, ctx)(error);
    }

    const { name } = req.params;

    const result = items.find((hero) => hero.name === name);

    return res(ctx.status(200), ctx.json(result));
  }),
];
