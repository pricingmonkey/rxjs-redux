import * as chai from 'chai';
import { expect } from 'chai';
import { connect } from '../src';
import { TestScheduler } from './testScheduler';

chai.config.truncateThreshold = 0;
chai.config.includeStack = true;

describe('connect', () => {
  it('should stream values where change', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, { a: 1 })
      .emit(20, { a: 2 })
      .emit(40, { a: 3 })
      .build();

    const mapInputToProps = input => ({ a: input.a });
    const observable$ = input$.pipe(connect(mapInputToProps));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 0,
      value: { a: 1 }
    }, {
      time: 20,
      value: { a: 2 }
    }, {
      time: 40,
      value: { a: 3 }
    }]);
  });

  it('should stream values by shallow equality by default', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, { a: {} })
      .emit(20, { a: {} })
      .emit(40, { a: {} })
      .build();

    const mapInputToProps = (input) => input;
    const observable$ = input$.pipe(connect(mapInputToProps));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 0,
      value: { a: {} }
    }, {
      time: 20,
      value: { a: {} }
    }, {
      time: 40,
      value: { a: {} }
    }]);
  });

  it('should only stream initial value where props never changes even though input might change', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, { a: 1, b: 1 })
      .emit(20, { a: 1, b: 2 })
      .emit(40, { a: 1, b: 3 })
      .build();

    const mapInputToProps = input => ({ a: input.a });
    const observable$ = input$.pipe(connect(mapInputToProps));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 0,
      value: { a: 1 }
    }]);
  });

  it('should use overriden equality', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, { a: 0 })
      .emit(20, { a: 1 })
      .emit(40, { a: 2 })
      .build();

    const mapInputToProps = (input) => input;
    const alwaysEqual = () => true;
    const observable$ = input$.pipe(connect(mapInputToProps, { arePropsEqual: alwaysEqual }));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 0,
      value: { a: 0 }
    }]);
  });
});
