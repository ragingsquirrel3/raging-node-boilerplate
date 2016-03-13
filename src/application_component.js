import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

export default React.createClass({
  render () {
    console.log(blah)
    // Add the reducer to your store on the `routing` key
    const store = createStore(
      combineReducers({
        // ...reducers,
        routing: routerReducer
      })
    )

    // Create an enhanced history that syncs navigation events with the store
    const history = syncHistoryWithStore(browserHistory, store)

    console.log('hello')
    return (
      <Provider store={store}>
        { /* Tell the Router to use our enhanced history */ }
        <Router history={history}>

        </Router>
      </Provider>
    );  
  }
});
