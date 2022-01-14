import { DefaultRequestBody, ResponseComposition, RestContext } from 'msw';

const errorKey = '400';

export function requestErrorResponse() {
  localStorage.setItem(errorKey, 'true');
}

export function getErrorResponse(res: ResponseComposition<DefaultRequestBody>, ctx: RestContext) {
  if (localStorage.getItem(errorKey)) {
    return res(
      ctx.status(400),
      ctx.json({
        detail: 'Something Went Wrong on The Server',
      })
    );
  }
  return;
}
