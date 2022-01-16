export interface Result<T> {
  error?: { statusCode: number; message: string };
  data?: T;
}
