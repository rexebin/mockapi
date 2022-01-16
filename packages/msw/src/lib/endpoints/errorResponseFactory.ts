import { ResponseComposition, RestContext } from 'msw';

export function errorResponseFactory(
  res: ResponseComposition,
  ctx: RestContext
) {
  return (error: { statusCode: number; message: string }) =>
    res(
      ctx.status(error.statusCode),
      ctx.json({
        detail: error.message,
      })
    );
}
