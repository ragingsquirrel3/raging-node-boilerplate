const assert = require('assert');
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Chart from '../src/components/chart';

describe('flexy chart', function () {
  it('can be instantiated with no props', function () {
    let html = ReactDOMServer.renderToStaticMarkup(<Chart />);
  });

  it('can be instantiated with empty data', function () {
    let html = ReactDOMServer.renderToStaticMarkup(<Chart data={[]}/>);
  });

  it('can be instantiated with data', function () {
    let testData = [{ name: 'cat', 'key1': 1, 'key2': 2 }, { name: 'dog', 'key1': 2, 'key2': 2 }];
    let html = ReactDOMServer.renderToStaticMarkup(<Chart data={testData}/>);
  });
});
