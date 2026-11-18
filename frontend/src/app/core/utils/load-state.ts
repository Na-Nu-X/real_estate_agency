import { Observable, catchError, map, of, startWith } from 'rxjs';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; notFound: boolean };

/** Wraps an HTTP observable into a loading / success / error state stream. */
export function toLoadState<T>(source$: Observable<T>): Observable<LoadState<T>> {
  return source$.pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    catchError((err: { status?: number }) => of<LoadState<T>>({ status: 'error', notFound: err?.status === 404 })),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}
