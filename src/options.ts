export type Options<P> = {
  arePropsEqual: (previousProps: P, currentProps: P) => boolean;
};
