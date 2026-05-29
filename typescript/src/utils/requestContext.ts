import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(
  context: RequestContext,
  callback: () => T,
): T => requestContextStorage.run(context, callback);

export const getRequestId = (): string => {
  return requestContextStorage.getStore()?.requestId ?? '-';
};
