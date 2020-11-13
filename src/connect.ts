import { EMPTY, Observable, of, concat } from 'rxjs';
import { pairwise, concatMap, map, withLatestFrom } from 'rxjs/operators';
import { shallowEqual } from './shallowEqual';
import { Options } from './options';

const NONE = Object();
type MapInputToContext<I, C> = (input: I | undefined) => C;
type MapInputToProps<I, P> = (input: I | undefined) => P;

const connectWithoutContext = <I, P, C>(
  mapInputToProps: MapInputToProps<I, P>,
  options?: Options<P>
) => {
  const arePropsEqual = (options && options.arePropsEqual) || shallowEqual;
  return (input$: Observable<I>) => {
    return concat(of(NONE), input$)
      .pipe(
        map(input => {
          if (input === NONE) {
            return NONE as P;
          }
          if (input === undefined) {
            return undefined;
          }
          return mapInputToProps(input);
        }),
        pairwise(),
        concatMap(([previousProps, nextProps]) => {
          if (previousProps === NONE) {
            return of(nextProps);
          }
          if (previousProps === undefined || nextProps === undefined) {
            return of(nextProps);
          }
          if (arePropsEqual(previousProps, nextProps)) {
            return EMPTY;
          } else {
            return of(nextProps);
          }
        }),
      );
  };
};

const connectWithContext = <I, P, C>(
  mapInputToProps: MapInputToProps<I, P>,
  mapInputToContext: MapInputToContext<I, C>,
  options?: Options<P>
) => {
  const connectStateProps = connectWithoutContext(mapInputToProps, options);
  return (input$: Observable<I>) => {
    const props$ = connectStateProps(input$);
    const context$ = input$.pipe(map(mapInputToContext));
    return props$.pipe(
      withLatestFrom(context$),
      map(([props, context]) => {
        if (props === undefined && context === undefined) {
          return undefined;
        }
        return ({ ...props, ...context });
      })
    );
  };
};

export function connect<I, P, C>(
  mapInputToProps: MapInputToProps<I, P>,
  options?: Options<P>
): (input$: Observable<I>) => Observable<P>;
export function connect<I, P, C>(
  mapInputToStateProps: MapInputToProps<I, P>,
  mapInputToContextProps?: MapInputToContext<I, C>,
  options?: Options<P>
): (input$: Observable<I>) => Observable<P & C>;
export function connect<I, P, C>(
  mapInputToProps: MapInputToProps<I, P>,
  mapInputToContextOrOptions?: MapInputToContext<I, C> | Options<P>,
  options?: Options<P>
) {
  if (mapInputToContextOrOptions === undefined || typeof mapInputToContextOrOptions === 'object') {
    return connectWithoutContext(mapInputToProps, mapInputToContextOrOptions);
  } else {
    return connectWithContext(mapInputToProps, mapInputToContextOrOptions, options);
  }
}
