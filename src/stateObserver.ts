import { Action } from 'redux';
import { Observable } from 'rxjs';

export type StateObserver<S, A extends Action = Action> = (state$: Observable<S>) => Observable<A>;
