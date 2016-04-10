import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import DNA from './components/dna';
import dnaApp from './reducers';

console.log('blah')

// init redux store and render to target element in DOM
let _store = createStore(dnaApp);
render(
  <Provider store={_store}>
    <DNA />
  </Provider>
, document.getElementById('target'));
