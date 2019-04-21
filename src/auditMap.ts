import { concat, defer, EMPTY, Observable, of, SubscribableOrPromise, Subscriber } from 'rxjs';
import { concatMap, ignoreElements, tap } from 'rxjs/operators';

// https://github.com/ReactiveX/rxjs/issues/1777
export const auditMap = <T, R>(project: (value: T, index: number) => SubscribableOrPromise<R> | void) => (source: Observable<T>): Observable<R> =>
  Observable.create((obs: Subscriber<R>) => {
    let count = 0;
    return source.pipe(
      tap(() => count++),
      concatMap((e: T, i: number) =>
        concat(
          defer(() => count === 1 ? project(e, i) : EMPTY),
          of(0).pipe(
            tap(() => count--),
            ignoreElements()
          )
        )
      )
    ).subscribe(obs);
  });
