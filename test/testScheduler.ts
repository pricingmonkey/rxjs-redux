import { Observable, Observer, VirtualAction, VirtualTimeScheduler, of } from 'rxjs';
import { delay, flatMap } from 'rxjs/operators';

export interface TimedValue<T> {
  time: number;
  value: T;
}

const _5_MINUTES = 300 * 1000;

export class TestScheduler extends VirtualTimeScheduler {
  constructor(maxFrame = _5_MINUTES) {
    super(VirtualAction, maxFrame);
  }

  public run(observable: Observable<any>) {
    const observer = new TestObserver<any>(this);

    this.schedule(() => observable.subscribe(observer), 0);

    this.flush();

    return observer.output;
  }

  public inputStreamBuilder<T>() {
    return new InputStreamBuilder<T>(this);
  }
}

class InputStreamBuilder<T> {
  private values: TimedValue<T>[] = [];

  constructor(private scheduler: VirtualTimeScheduler) {
  }

  emit(time: number, value: T) {
    this.values.push({ time, value });
    return this;
  }

  build() {
    return of(...this.values).pipe(
      flatMap(({ time, value }) => {
        return of(value).pipe(delay(time, this.scheduler));
      }),
    );
  }
}

class TestObserver<T> implements Observer<T> {
  constructor(private scheduler: VirtualTimeScheduler) {
  }

  output: TimedValue<T>[] = [];

  complete() {}

  error(err: any) {
    throw err;
  }

  next(value: T) {
    this.output.push({ time: this.scheduler.frame, value });
  }
}
