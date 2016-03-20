import React from 'react';
import d3 from 'd3';

const NODE_CLASS = 'fc-node';
const DEFAULT_NODE_RADIUS = 5;
const TRANSITION_DURATION = 500;

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
      domSize: 600,
    }
  },

  render () {
    return (
      <div>
        <svg ref='svg' width={this.state.domSize} height={this.state.domSize} />
      </div>
    );
  },

  componentDidMount () {
    this._drawSVG();
  },

  // d3-fu
  _drawSVG () {
    const xScale = this._getXScale();
    const yScale = this._getYScale();
    let svg = d3.select(this.refs.svg);
    // TODO, add key function
    let nodes = svg.selectAll(`.${NODE_CLASS}`)
      .data(this.props.data);
    // exit
    nodes.exit().remove();
    // enter
    nodes.enter().append('circle')
      .classed(NODE_CLASS, true)
      .attr({
        cx: 0,
        cy: 0,
        r: DEFAULT_NODE_RADIUS
      });
    // update
    nodes.transition()
      .duration(TRANSITION_DURATION)
      .attr({
        cx: 300,
        cy: 300,
      });
  },

  _getXScale () {
    const _domain = this._getRangeByKey(this.state.xKey);
    const _range = [0, this.state.domSize];
    return d3.scale.linear()
      .domain(_domain)
      .range(_range);
  },

  _getYScale () {
    const _domain = this._getRangeByKey(this.state.yKey);
    const _range = [this.state.domSize, 0];
    return d3.scale.linear()
      .domain(_domain)
      .range(_range);
  },

  // returns [minValue, maxValue] for data measured by value at key param
  _getRangeByKey (key) {
    const data = this.props.data;
    function accessor (d) { return d[key]; };
    let minValue = d3.min(this.props.data, accessor);
    let maxValue = d3.max(this.props.data, accessor);
    return [minValue, maxValue];
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
