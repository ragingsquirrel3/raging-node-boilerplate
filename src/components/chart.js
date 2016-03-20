import React from 'react';

const Chart = React.createClass({
  propTypes: {
    data: React.PropTypes.array
  },

  getDefaultProps () {
    return {
      data: [{ name: 'cat', 'key1': 1, 'key2': 2 }, { name: 'dog', 'key1': 2, 'key2': 2 }]
    }
  },

  getInitialState () {
    const numericalKeys = this._getNumericalKeys();
    return {
      xKey: numericalKeys[0],
      yKey: numericalKeys[0],
    }
  },

  render () {
    return <p>hola</p>;
  },

  _getXScale () {

  },

  _getYScale () {

  },

  // returns an array of strings which are the keys of the data for which all entries have numerical values
  _getNumericalKeys () {
    const firstEntry = this.props.data.length ? this.props.data[0] : {};
    const firstKeys = Object.keys(firstEntry);
    let numericalKeys = [];
    firstKeys.forEach( key => {
      if (typeof firstEntry[key] === 'number') numericalKeys.push(key);
    });
    return numericalKeys;
  }
});

export default Chart;
