import { skipWhile } from 'rxjs/operators';
import { Action } from 'redux';
import { Epic } from 'redux-observable';

import { StateObserver } from './stateObserver';

export const stateObserverAsEpic = <S, A extends Action>(stateObserver: StateObserver<S, A>): Epic<Action, A, S> => (
  action$,
  state$
) =>
  stateObserver(state$.pipe(skipWhile(v => !v)));
