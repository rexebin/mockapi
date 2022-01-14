import {
  DefaultRequestBody,
  MockedResponse,
  ResponseComposition,
  RestContext,
} from 'msw';
import { getErrorResponse } from './getErrorResponse';
import { Repository } from '../repository';
import { BaseEntity } from '../model';

export type HttpResponseResult<T> = {
  response?:
    | MockedResponse<DefaultRequestBody>
    | Promise<MockedResponse<DefaultRequestBody>>;
  data: T;
};

export const getDefaultGetItemsResponse = <T extends BaseEntity>(
  key: string,
  repository: Repository<T>
) => {
  return (
    res: ResponseComposition<DefaultRequestBody>,
    ctx: RestContext
  ): HttpResponseResult<T[]> => {
    const errorResponse = getErrorResponse(res, ctx);
    if (errorResponse) {
      return { response: errorResponse, data: [] };
    }

    const { data: items = [], errorMessage } = repository.getItems();
    if (errorMessage) {
      return {
        response: res(
          ctx.status(400),
          ctx.json({
            detail: errorMessage,
          })
        ),
        data: [],
      };
    }
    return { data: items };
  };
};
