'use strict';

/*MIT License
Core benchmark code copied from micro-memoize

Copyright (c) 2018 Tony Quetano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Benchmark = require('benchmark');
const Table = require('cli-table2');
const ora = require('ora');

const underscore = require('underscore').memoize;
const lodash = require('lodash').memoize;
const ramda = require('ramda').memoize;
const memoizee = require('memoizee');
const fastMemoize = require('fast-memoize');
const addyOsmani = require('./addy-osmani');
const memoizerific = require('memoizerific');
const lruMemoize = require('lru-memoize').default;
const moize = require('moize');
const microMemoize = require('micro-memoize').default; //require('../lib').default;
const iMemoized = require('iMemoized');
const nanomemoize = require('../src/nano-memoize.js');


const deepEquals = require('lodash').isEqual;
const fastDeepEqual = require('fast-equals').deepEqual;
const hashItEquals = require('hash-it').isEqual;

const showResults = (benchmarkResults) => {
  const table = new Table({
    head: ['Name', 'Ops / sec', 'Relative margin of error', 'Sample size']
  });

  benchmarkResults.forEach((result) => {
    const name = result.target.name;
    const opsPerSecond = result.target.hz.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
    const relativeMarginOferror = `± ${result.target.stats.rme.toFixed(2)}%`;
    const sampleSize = result.target.stats.sample.length;

    table.push([name, opsPerSecond, relativeMarginOferror, sampleSize]);
  });

  console.log(table.toString()); // eslint-disable-line no-console
};

const sortDescResults = (benchmarkResults) => {
  return benchmarkResults.sort((a, b) => {
    return a.target.hz < b.target.hz ? 1 : -1;
  });
};

const spinner = ora('Running benchmark');

let results = [];

const onCycle = (event) => {
  results.push(event);
  ora(event.target.name).succeed();
};

const onComplete = () => {
  spinner.stop();

  const orderedBenchmarkResults = sortDescResults(results);

  showResults(orderedBenchmarkResults);
};

const fibonacci = (number) => {
  return number < 2 ? number : fibonacci(number - 1) + fibonacci(number - 2);
};

const fibonacciMultiplePrimitive = (number, isComplete) => {
  if (isComplete) {
    return number;
  }

  const firstValue = number - 1;
  const secondValue = number - 2;

  return (
    fibonacciMultiplePrimitive(firstValue, firstValue < 2) + fibonacciMultiplePrimitive(secondValue, secondValue < 2)
  );
};

const fibonacciMultipleObject = (number, check) => {
  if (check.isComplete) {
    return number;
  }

  const firstValue = number - 1;
  const secondValue = number - 2;

  return (
    fibonacciMultipleObject(firstValue, {
      isComplete: firstValue < 2
    }) +
    fibonacciMultipleObject(secondValue, {
      isComplete: secondValue < 2
    })
  );
};

const fibonacciMultipleDeepEqual = ({number}) => {
  return number < 2
    ? number
    : fibonacciMultipleDeepEqual({number: number - 1}) + fibonacciMultipleDeepEqual({number: number - 2});
};

const runSingleParameterSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter');
  const fibonacciNumber = 35;

  const mUnderscore = underscore(fibonacci);
  const mLodash = lodash(fibonacci);
  const mRamda = ramda(fibonacci);
  const mMemoizee = memoizee(fibonacci);
  const mFastMemoize = fastMemoize(fibonacci);
  const mAddyOsmani = addyOsmani(fibonacci);
  const mMemoizerific = memoizerific(Infinity)(fibonacci);
  const mLruMemoize = lruMemoize(Infinity)(fibonacci);
  const mMoize = moize(fibonacci);
  const mMicroMemoize = microMemoize(fibonacci);
  const mIMemoized = iMemoized.memoize(fibonacci);
  const mNano = nanomemoize(fibonacci);


  return new Promise((resolve) => {
    fibonacciSuite
      .add('addy-osmani', () => {
        mAddyOsmani(fibonacciNumber);
      })
      .add('lodash', () => {
        mLodash(fibonacciNumber);
      })
      .add('lru-memoize', () => {
        mLruMemoize(fibonacciNumber);
      })
      .add('memoizee', () => {
        mMemoizee(fibonacciNumber);
      })
      .add('memoizerific', () => {
        mMemoizerific(fibonacciNumber);
      }) .add('ramda', () => {
        mRamda(fibonacciNumber);
      })
      .add('underscore', () => {
        mUnderscore(fibonacciNumber);
      })
      .add('iMemoized', () => {
      	mIMemoized(fibonacciNumber);
      })
      .add('micro-memoize', () => {
        mMicroMemoize(fibonacciNumber);
      })
      .add('moize', () => {
        mMoize(fibonacciNumber);
      })
      .add('fast-memoize', () => {
        mFastMemoize(fibonacciNumber);
      })
      .add('namomemoize', () => {
      	mNano(fibonacciNumber);
      })
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log('Starting cycles for functions with a single primitive parameter...'); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
};

const runSingleParameterObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Single parameter');
  const fibonacciNumber = Number(35);

  const mUnderscore = underscore(fibonacci);
  const mLodash = lodash(fibonacci);
  const mRamda = ramda(fibonacci);
  const mMemoizee = memoizee(fibonacci);
  const mFastMemoize = fastMemoize(fibonacci);
  const mAddyOsmani = addyOsmani(fibonacci);
  const mMemoizerific = memoizerific(Infinity)(fibonacci);
  const mLruMemoize = lruMemoize(Infinity)(fibonacci);
  const mMoize = moize(fibonacci);
  const mMicroMemoize = microMemoize(fibonacci);
  const mIMemoized = iMemoized.memoize(fibonacci);
  const mNano = nanomemoize(fibonacci,{relaxed:true});


  return new Promise((resolve) => {
    fibonacciSuite
      .add('addy-osmani', () => {
        mAddyOsmani(fibonacciNumber);
      })
      .add('lodash', () => {
        mLodash(fibonacciNumber);
      })
      .add('lru-memoize', () => {
        mLruMemoize(fibonacciNumber);
      })
      .add('memoizee', () => {
        mMemoizee(fibonacciNumber);
      })
      .add('memoizerific', () => {
        mMemoizerific(fibonacciNumber);
      }) .add('ramda', () => {
        mRamda(fibonacciNumber);
      })
      .add('underscore', () => {
        mUnderscore(fibonacciNumber);
      })
      .add('iMemoized', () => {
      	mIMemoized(fibonacciNumber);
      })
      .add('micro-memoize', () => {
        mMicroMemoize(fibonacciNumber);
      })
      .add('moize', () => {
        mMoize(fibonacciNumber);
      })
      .add('fast-memoize', () => {
        mFastMemoize(fibonacciNumber);
      })
      .add('namomemoize', () => {
      	mNano(fibonacciNumber);
      })
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log('Starting cycles for functions with a single object parameter...'); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
};

const runMultiplePrimitiveSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Primitive)');
  const fibonacciNumber = 35;
  const isComplete = false;

  const mMemoizee = memoizee(fibonacciMultiplePrimitive);
  const mFastMemoize = fastMemoize(fibonacciMultiplePrimitive);
  const mAddyOsmani = addyOsmani(fibonacciMultiplePrimitive);
  const mMemoizerific = memoizerific(Infinity)(fibonacciMultiplePrimitive);
  const mLruMemoize = lruMemoize(Infinity)(fibonacciMultiplePrimitive);
  const mMoize = moize(fibonacciMultiplePrimitive);
  const mMicroMemoize = microMemoize(fibonacciMultiplePrimitive);
  const mIMemoized = iMemoized.memoize(fibonacciMultiplePrimitive);
  const mNano = nanomemoize(fibonacciMultiplePrimitive);

  return new Promise((resolve) => {
    fibonacciSuite
      .add('addy-osmani', () => {
        mAddyOsmani(fibonacciNumber, isComplete);
      })
      .add('lru-memoize', () => {
        mLruMemoize(fibonacciNumber, isComplete);
      })
      .add('memoizee', () => {
        mMemoizee(fibonacciNumber, isComplete);
      })
      .add('iMemoized', () => {
      	mIMemoized(fibonacciNumber, isComplete);
      })
      .add('memoizerific', () => {
        mMemoizerific(fibonacciNumber, isComplete);
      })
    .add('fast-memoize', () => {
      mFastMemoize(fibonacciNumber, isComplete);
    })
      .add('micro-memoize', () => {
        mMicroMemoize(fibonacciNumber, isComplete);
      })
      .add('moize', () => {
        mMoize(fibonacciNumber, isComplete);
      })
      .add('nanomemoize', () => {
      	mNano(fibonacciNumber, isComplete);
      })
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log('Starting cycles for functions with multiple parameters that contain only primitives...'); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
};

const runMultipleObjectSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Object)');
  const fibonacciNumber = 35;
  const isComplete = {
    isComplete: false
  };

  const mMemoizee = memoizee(fibonacciMultipleObject);
  const mFastMemoize = fastMemoize(fibonacciMultipleObject);
  const mAddyOsmani = addyOsmani(fibonacciMultipleObject);
  const mMemoizerific = memoizerific(Infinity)(fibonacciMultipleObject);
  const mLruMemoize = lruMemoize(Infinity)(fibonacciMultipleObject);
  const mMoize = moize(fibonacciMultipleObject);
  const mMicroMemoize = microMemoize(fibonacciMultipleObject);
  const mNano = nanomemoize(fibonacciMultipleObject);
  
  return new Promise((resolve) => {
    fibonacciSuite
      .add('addy-osmani', () => {
        mAddyOsmani(fibonacciNumber, isComplete);
      })
      .add('lru-memoize', () => {
        mLruMemoize(fibonacciNumber, isComplete);
      })
      .add('memoizee', () => {
        mMemoizee(fibonacciNumber, isComplete);
      })
      .add('memoizerific', () => {
        mMemoizerific(fibonacciNumber, isComplete);
      })
    .add('fast-memoize', () => {
      mFastMemoize(fibonacciNumber, isComplete);
    })
      .add('micro-memoize', () => {
        mMicroMemoize(fibonacciNumber, isComplete);
      })
      .add('moize', () => {
        mMoize(fibonacciNumber, isComplete);
      })
      .add('nanomemoize', () => {
      	mNano(fibonacciNumber,isComplete);
      })
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log('Starting cycles for functions with multiple parameters that contain objects...'); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
};

const runAlternativeOptionsSuite = () => {
  const fibonacciSuite = new Benchmark.Suite('Multiple parameters (Object)');
  const fibonacciNumber = {
    number: 35
  };

  const mMicroMemoizeDeep = microMemoize(fibonacciMultipleDeepEqual, {
    isEqual: deepEquals
  });

  const mMicroMemoizeFastDeep = microMemoize(fibonacciMultipleDeepEqual, {
    isEqual: fastDeepEqual
  });

  const mMicroMemoizeHashIt = microMemoize(fibonacciMultipleDeepEqual, {
    isEqual: hashItEquals
  });
  
  const mNanoDeep = nanomemoize(fibonacciMultipleDeepEqual, {
    equals: deepEquals
  });
  const mNanoFastDeep = nanomemoize(fibonacciMultipleDeepEqual, {
    equals: fastDeepEqual
  });

  return new Promise((resolve) => {
    fibonacciSuite
      .add('micro-memoize deep equals (lodash isEqual)', () => {
        mMicroMemoizeDeep(fibonacciNumber);
      })
      .add('micro-memoize deep equals (fast-equals deepEqual)', () => {
        mMicroMemoizeFastDeep(fibonacciNumber);
      })
      .add('micro-memoize deep equals (hash-it isEqual)', () => {
        mMicroMemoizeHashIt(fibonacciNumber);
      })
      .add('nanomemoize deep equals (lodash isEqual)', () => {
      	mNanoDeep(fibonacciNumber);
      })
      .add('nanomemoize deep equals (fast-equals deepEqual)', () => {
        mNanoFastDeep(fibonacciNumber);
      })
      .on('start', () => {
        console.log(''); // eslint-disable-line no-console
        console.log('Starting cycles for alternative cache types...'); // eslint-disable-line no-console

        results = [];

        spinner.start();
      })
      .on('cycle', onCycle)
      .on('complete', () => {
        onComplete();
        resolve();
      })
      .run({
        async: true
      });
  });
};

// runAlternativeOptionsSuite();

runSingleParameterSuite()
  .then(runSingleParameterObjectSuite)
  .then(runMultiplePrimitiveSuite)
  .then(runMultipleObjectSuite)
  .then(runAlternativeOptionsSuite);
