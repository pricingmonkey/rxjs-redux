import { EMPTY, Observable, of, concat } from 'rxjs';
import { pairwise, concatMap } from 'rxjs/operators';
import { shallowEqual } from './shallowEqual';
import { Options } from './options';

export const connect = <I, P>(mapInputToProps: (input: I | undefined) => P, options?: Options<P>) => {
  const arePropsEqual = (options && options.arePropsEqual) || shallowEqual;
  return (input$: Observable<I>) => {
    return concat(of(undefined), input$)
      .pipe(
        pairwise(),
        concatMap(([previousInput, nextInput]) => {
          const props = mapInputToProps(nextInput);
          if (!previousInput) {
            return of(props);
          }
          const previousProps = mapInputToProps(previousInput);
          if (arePropsEqual(previousProps, props)) {
            return EMPTY;
          } else {
            return of(props);
          }
        }),
      );
  };
};
