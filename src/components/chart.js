import React from 'react';
import d3 from 'd3';

const AXIS_WIDTH = 30;
const AXIS_HEIGHT = 30;
const NODE_CLASS = 'fc-node';
const PADDING_SIZE = 30;
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
      domSize: 350,
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
    const svg = d3.select(this.refs.svg);
    // render axes
    // x
    const xAxisFn = d3.svg.axis()
      .orient('bottom')
      .tickSize(6, 6)
      .scale(xScale);
    const xTranslate = `translate(${0}, ${this.state.domSize - PADDING_SIZE})`;
    var axis = svg.selectAll('g.x-axis').data([null]);
    axis.enter().append('g')
      .classed('x-axis', true)
      .attr({
        transform: xTranslate
      });
    axis.transition()
      .duration(TRANSITION_DURATION)
      .call(xAxisFn);
    // y
    const yAxisFn = d3.svg.axis()
      .orient('left')
      .tickSize(3, 3)
      .scale(yScale);
    const yTranslate = `translate(${PADDING_SIZE}, ${0})`;
    var axis = svg.selectAll('g.y-axis').data([null]);
    axis.enter().append('g')
      .classed('y-axis', true)
      .attr({
        transform: yTranslate
      });
    axis.transition()
      .duration(TRANSITION_DURATION)
      .call(yAxisFn);
      
    // render nodes
    // TODO, add key function
    var nodes = svg.selectAll(`.${NODE_CLASS}`)
      .data(this.props.data);
    // exit
    nodes.exit().remove();
    // enter
    nodes.enter().append('circle')
      .classed(NODE_CLASS, true)
      .attr({
        cx: d => { return xScale(d[this.state.xKey])},
        cy: yScale.range()[0],
        r: DEFAULT_NODE_RADIUS
      });
    // update
    nodes.transition()
      .duration(TRANSITION_DURATION)
      .attr({
        cx: d => { return xScale(d[this.state.xKey])},
        cy: d => { return yScale(d[this.state.yKey])},
      });
  },

  _getXScale () {
    const _domain = this._getRangeByKey(this.state.xKey);
    const _range = [PADDING_SIZE, this.state.domSize - PADDING_SIZE];
    return d3.scale.linear()
      .domain(_domain)
      .range(_range);
  },

  _getYScale () {
    const _domain = this._getRangeByKey(this.state.yKey);
    const _range = [this.state.domSize - PADDING_SIZE, PADDING_SIZE];
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
