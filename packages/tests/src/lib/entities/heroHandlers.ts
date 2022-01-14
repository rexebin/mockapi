import { getDefaultGetItemsResponse } from '@mockapi/msw';

import { Hero, heroKey } from './hero';
import { rest } from 'msw';
import { baseUrl, repositoryFactory } from '../server/server';

export const heroHandlers = [
  rest.get(`${baseUrl}/${heroKey}`, (req, res, ctx) => {
    const defaultHttpResponse = getDefaultGetItemsResponse<Hero>(
      heroKey,
      repositoryFactory<Hero>(heroKey)
    )(res, ctx);
    if (defaultHttpResponse.response) {
      return defaultHttpResponse.response;
    }

    const search = req.url.searchParams.get('search');
    const result = defaultHttpResponse.data.filter((hero) =>
      search ? hero.name.toLowerCase().includes(search?.toLowerCase()) : true
    );

    return res(ctx.status(200), ctx.json(result));
  }),

  rest.get(`${baseUrl}/${heroKey}/:name`, (req, res, ctx) => {
    const defaultHttpResponse = getDefaultGetItemsResponse<Hero>(
      heroKey,
      repositoryFactory<Hero>(heroKey)
    )(res, ctx);
    if (defaultHttpResponse.response) {
      return defaultHttpResponse.response;
    }

    const { name } = req.params;

    const result = defaultHttpResponse.data.find((hero) => hero.name === name);

    return res(ctx.status(200), ctx.json(result));
  }),
];
