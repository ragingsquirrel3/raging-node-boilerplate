import React from 'react';
import d3 from 'd3';
import Select from 'react-select';

const AXIS_WIDTH = 30;
const AXIS_HEIGHT = 30;
const BOX_CLASS = 'fc-box';
const DEFAULT_DOME_SIZE = 485;
const NODE_CLASS = 'fc-node';
const NUM_BINS = 10;
const PADDING_SIZE = 40;
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
      cKey: numericalKeys[numericalKeys.length - 1],
      domWidth: DEFAULT_DOME_SIZE,
      domHeight: DEFAULT_DOME_SIZE,
      mode: 'scatter' // 'scatter' or 'box'
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
            setMode('box');
          }}
          className={`${this.state.mode === 'box' ? 'active ' : ''}btn btn-default`}>Box Plot</a>
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
        <Select options={_options} value={this.state[key]} onChange={_onChange} clearable={false}/>
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
    let xAxis = svg.selectAll('g.x-axis').data([null]);
    xAxis.enter().append('g')
      .classed('x-axis', true)
      .attr({
        transform: xTranslate
      });
    xAxis.transition()
      .duration(TRANSITION_DURATION)
      .call(xAxisFn);
    // y
    const yAxisFn = d3.svg.axis()
      .orient('left')
      .tickSize(3, 3)
      .scale(yScale);
    const yTranslate = `translate(${PADDING_SIZE}, ${0})`;
    let yAxis = svg.selectAll('g.y-axis').data([null]);
    yAxis.enter().append('g')
      .classed('y-axis', true)
      .attr({
        transform: yTranslate
      });
    yAxis.transition()
      .duration(TRANSITION_DURATION)
      .call(yAxisFn);
      
    // render nodes
    let nodes = svg.selectAll(`.${NODE_CLASS}`)
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

    this._drawBoxPlots();
  },

  _drawBoxPlots () {
    const boxData = this._getBoxPlotData();
    const xScale = this._getXScale();
    const yScale = this._getYScale();
    const svg = d3.select(this.refs.svg);
    // little helper functions
    const xFn = d => { return xScale(d.startX); };
    const x2Fn = d => { return xScale(d.endX); };
    const yFn = d => { return yScale(d.tq); };
    const y2Fn = d => { return yScale(d.fq); };
    const widthFn = d => { return x2Fn(d) - xFn(d); };
    const heightFn = d => { return y2Fn(d) - yFn(d); };
    // boxes 
    let boxes = svg.selectAll(`.${BOX_CLASS}`).data(boxData);
    // exit
    boxes.exit().remove();
    // enter
    boxes.enter().append('rect')
      .classed(BOX_CLASS, true)
      .attr({
        x: xFn,
        y: yFn,
        width: widthFn,
        height: heightFn,
        fill: 'none',
        stroke: 'black',
        'stroke-dasharray': '0 1000'

      });
    // update
    boxes.transition().duration(TRANSITION_DURATION * 2)
      .attr({
        x: xFn,
        y: yFn,
        width: widthFn,
        height: heightFn,
        'stroke-dasharray': '1000 0'
      });

    // means
    const MEAN_CLASS = `${BOX_CLASS}-mean`;
    const meanYFn = d => { return (yFn(d) + y2Fn(d)) / 2 };
    let means = svg.selectAll(`.${MEAN_CLASS}`).data(boxData);
    means.exit().remove();
    means.enter().append('line')
      .classed(MEAN_CLASS, true)
      .attr({
        x1: xFn,
        x2: x2Fn,
        y1: meanYFn,
        y2: meanYFn,
        'stroke-dasharray': '0 1000',
        stroke: 'black',
        'stroke-width': 2
      });
    means.transition().duration(TRANSITION_DURATION * 2)
      .attr({
        x1: xFn,
        x2: x2Fn,
        y1: meanYFn,
        y2: meanYFn,
        'stroke-dasharray': '1000 0'
      });
    const midXFn = d => { return xFn(d) + widthFn(d) / 2; };
    // top lines
    const TOP_CLASS = `${BOX_CLASS}-top`;
    let tops = svg.selectAll(`.${TOP_CLASS}`).data(boxData);
    tops.exit().remove();
    tops.enter().append('line')
      .classed(TOP_CLASS, true)
      .attr({
        x1: midXFn,
        x2: midXFn,
        y1: yFn,
        y2: yFn,
        'stroke-dasharray': '3 3',
        stroke: 'black',
        'stroke-width': 2
      });
      tops.transition().duration(TRANSITION_DURATION * 2)
        .attr({
          x1: midXFn,
          x2: midXFn,
          y1: d => { return yScale(d.max); },
          y2: yFn
        });
    // bottom lines
    const BOTTOM_CLASS = `${BOX_CLASS}-bottom`;
    let bottoms = svg.selectAll(`.${BOTTOM_CLASS}`).data(boxData);
    bottoms.exit().remove();
    bottoms.enter().append('line')
      .classed(BOTTOM_CLASS, true)
      .attr({
        x1: midXFn,
        x2: midXFn,
        y1: y2Fn,
        y2: y2Fn,
        'stroke-dasharray': '3 3',
        stroke: 'black',
        'stroke-width': 2
      });
      bottoms.transition().duration(TRANSITION_DURATION * 2)
        .attr({
          x1: midXFn,
          x2: midXFn,
          y1: y2Fn,
          y2: d => { return yScale(d.min); },
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
  },

  // return an array of objects to describe box plots like { mean: 3, min: 1, max: 5, fq: 2, tq: 4, startX: 0, endX: 1 }
  _getBoxPlotData () {
    // no boxes of not box mode
    if (this.state.mode !== 'box') return [];
    // separate into histograms
    const data = this.props.data;
    const histData = d3.layout.histogram()
      .bins(NUM_BINS)
      .value( d => { return d[this.state.xKey]; })(data);
    // map to desired value
    const xFn = d => { return d[this.state.xKey]; };
    const yFn = d => { return d[this.state.yKey]; };
    return histData.map( d => {
      const _min = d3.min(d, yFn);
      const _max = d3.max(d, yFn);
      const _mean = d3.mean(d, yFn);
      const sorted = d.map(yFn).sort( (a, b) => {
        return a - b;
      });
      const _fq = d3.quantile(sorted, 0.25);
      const _tq = d3.quantile(sorted, 0.75);
      const _startX = d3.min(d, xFn);
      const _endX = d3.max(d, xFn);
      return {
        min: _min,
        max: _max,
        mean: _mean,
        fq: _fq,
        tq: _tq,
        startX: _startX,
        endX: _endX
      };
    });
  }
});

function getDefaultData () {
  let _data = [];
  for (var i = 2000; i >= 0; i--) {
    let cat = (Math.random() > 0.5) ? 'animal' : 'plant';
    _data.push({
      id: i,
      name: `item${i}`,
      key1: i,
      key2: Math.random(),
      key3: Math.random(),
      category: cat
    });
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
