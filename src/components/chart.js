import React from 'react';
import d3 from 'd3';
import Select from 'react-select';

const AXIS_WIDTH = 30;
const AXIS_HEIGHT = 30;
const DEFAULT_DOME_SIZE = 485;
const NODE_CLASS = 'fc-node';
const PADDING_SIZE = 30;
const DEFAULT_NODE_RADIUS = 2;
const TRANSITION_DURATION = 500;

const Chart = React.createClass({
  propTypes: {
    data: React.PropTypes.array
  },

  getDefaultProps () {
    return {
      data: getDefaultData()
    }
  },

  getInitialState () {
    const numericalKeys = this._getNumericalKeys();
    return {
      xKey: numericalKeys[0],
      yKey: numericalKeys[numericalKeys.length - 1],
      domWidth: DEFAULT_DOME_SIZE,
      domHeight: DEFAULT_DOME_SIZE,
      mode: 'scatter' // 'scatter' or 'dist'
    }
  },

  render () {
    return (
      <div>
        {this._renderMenu()}
        <div style={styles.graphContainer}>
          <div style={styles.yContainer}>
            {this._renderSelectorFromKey('yKey')}
          </div>
          <div ref='svgContainer' style={styles.svgContainer}>
            <svg ref='svg' width={this.state.domWidth} height={this.state.domHeight} />
            <div style={styles.xContainer}>
              <div style={styles.innerXContainer}>
                {this._renderSelectorFromKey('xKey')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  // calc width and set resize events
  componentDidMount () {
    this._calculateDomSize();
    this._drawSVG();
  },

  componentDidUpdate () {
    this._drawSVG();
  },

  _renderMenu () {
    const setMode = (newMode) => {
      this.setState({ mode: newMode });
    };
    return (
      <div className='btn-group' role='group' ariaLabel='...'>
        <a
          onClick = { e => {
            setMode('scatter');
          }}
          className={`${this.state.mode === 'scatter' ? 'active ' : ''}btn btn-default`}>Scatterplot</a>
        <a
          onClick = { e => {
            setMode('dist');
          }}
          className={`${this.state.mode === 'dist' ? 'active ' : ''}btn btn-default`}>Distribution</a>
      </div>
    );
  },

  // key 'xKey' 'yKey' or 'cKey'
  _renderSelectorFromKey (key) {
    // if dist mode don't render y
    if (this.state.mode === 'dist' && key === 'yKey') return null;
    let _options = this._getNumericalKeys()
      .map( d => {
        return { value: d, label: d };
      });
    let _onChange = newValue => {
      let obj = {};
      obj[key] = newValue;
      this.setState(obj);
    };
    return (
      <div>
        <Select options={_options} value={this.state[key]} onChange={_onChange}/>
      </div>
    );
  },

  // d3-fu
  _drawSVG () {
    const xScale = this._getXScale();
    const yScale = this._getYScale();
    const cScale = this._getCScale();
    const svg = d3.select(this.refs.svg);
    // render axes
    // x
    const xAxisFn = d3.svg.axis()
      .orient('bottom')
      .tickSize(6, 6)
      .scale(xScale);
    const xTranslate = `translate(${0}, ${yScale.range()[0]})`;
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
    var nodes = svg.selectAll(`.${NODE_CLASS}`)
      .data(this.props.data, d => { return d.id; });
    // exit
    nodes.exit().remove();
    // enter
    nodes.enter().append('circle')
      .classed(NODE_CLASS, true)
      .attr({
        cx: d => { return xScale(d[this.state.xKey])},
        cy: yScale.range()[0],
        r: DEFAULT_NODE_RADIUS,
        fill: 'white'
      });
    // update
    nodes.transition()
      .delay( (d, i) => { return i / this.props.data.length * TRANSITION_DURATION * 3; })
      .duration(TRANSITION_DURATION)
      .attr({
        cx: d => { return xScale(d[this.state.xKey])},
        cy: d => { return yScale(d[this.state.yKey])},
        fill: cScale
      });
  },

  _calculateDomSize () {
    let rect = this.refs.svgContainer.getBoundingClientRect();
    // only update if width, webpack dev bug
    if (rect.width > 0) this.setState({ domWidth: rect.width });
  },

  _getXScale () {
    const _domain = this._getRangeByKey(this.state.xKey);
    const _range = [PADDING_SIZE, this.state.domWidth -  PADDING_SIZE];
    return d3.scale.linear()
      .domain(_domain)
      .range(_range);
  },

  _getYScale () {
    if (this.state.mode === 'dist') {
      // calculate mean
      let total = 0;
      this.props.data.forEach( d => {
        total += d[this.state.xKey];
      });
      const mean = total / this.props.data.length;
      // TEMP return a function that returns 1, replace with dist from x scale
      return d3.scale.linear().range([100, 100]);
    };
    const _domain = this._getRangeByKey(this.state.yKey);
    const _range = [this.state.domHeight - PADDING_SIZE - AXIS_HEIGHT, PADDING_SIZE];
    return d3.scale.linear()
      .domain(_domain)
      .range(_range);
  },

  _getCScale () {
    return d3.scale.category10();
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

function getDefaultData () {
  let _data = [];
  for (var i = 2000; i >= 0; i--) {
    _data.push({ id: i, name: `item${i}`, key1: i, key2: Math.random(), key3: Math.random() });
  };
  return _data;
};

const AXIS_SELECTOR_WIDTH = '12rem';
const styles = {
  graphContainer: {
    display: 'flex'
  },
  xContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  innerXContainer: {
    width: AXIS_SELECTOR_WIDTH
  },
  yContainer: {
    width: AXIS_SELECTOR_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: '1rem'
  },
  svgContainer: {
    width: '90%'
  }
};

export default Chart;
