import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

import Layout from './components/layout';
import Example from './components/example';
import Index from './components/views';

export default class ApplicationComponent extends React.Component {
  render () {
    // Add the reducer to your store on the `routing` key
    const store = createStore(
      combineReducers({
        // ...reducers,
        routing: routerReducer
      })
    )

    // Create an enhanced history that syncs navigation events with the store
    const history = syncHistoryWithStore(browserHistory, store)
    return (
      <Provider store={store}>
        { /* Tell the Router to use our enhanced history */ }
        <Router history={history}>
          <Route path="/" component={Layout}>
            <IndexRoute component={Index} />
            <Route path="/about" component={Example} />
            <Route path="/contact" component={Example} />
          </Route>
        </Router>
      </Provider>
    );  
  }
};
