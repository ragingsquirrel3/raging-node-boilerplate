import React from 'react';
import d3 from 'd3';
import Select from 'react-select';

// *** depends on global sigma from CDN in src/lib/index.html
// import sigma from GLOBAL

const AXIS_WIDTH = 50;
const AXIS_HEIGHT = 20;
const BOX_CLASS = 'fc-box';
const DEFAULT_DOME_SIZE = 485;
const EXAMPLE_N = 8250;
const NODE_CLASS = 'fc-node';
const NUM_BINS = 10;
const PADDING_SIZE = 30;
const DEFAULT_NODE_RADIUS = 2;
const TRANSITION_DURATION = 1000;

const Chart = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    defaultXKey: React.PropTypes.string,
    defaultYKey: React.PropTypes.string,
    defaultXScaleFn: React.PropTypes.string,
    defaultYScaleFn: React.PropTypes.string,
    defaultCKey: React.PropTypes.string
  },

  getDefaultProps () {
    return {
      data: getDefaultData()
    }
  },

  getInitialState () {
    const numericalKeys = this._getNumericalKeys();
    let _xKey = this.props.defaultXKey || numericalKeys[0];
    let _yKey = this.props.defaultYKey || numericalKeys[numericalKeys.length - 1];
    let _cKey = this.props.defaultCKey || numericalKeys[numericalKeys.length - 1];
    return {
      xKey: _xKey,
      yKey: _yKey,
      cKey: _cKey,
      xScaleFn: this.props.defaultXScaleFn || 'linear',
      yScaleFn: this.props.defaultYScaleFn || 'linear',
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
            <div id='sigma-target' style={{ position: 'absolute', width: this.state.domWidth, height: this.state.domHeight }}/>
            <svg ref='svg' style={styles.svg} width={this.state.domWidth} height={this.state.domHeight} />
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
    // TEMP nothing
    return null;
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
    let objFnKey = (key === 'xKey') ? 'xScaleFn' : 'yScaleFn';
    let onChangeFn = newValue => {
      let obj = {};
      obj[objFnKey] = newValue;
      this.setState(obj);
    };
    let scaleFnOptions = [
      { value: 'linear', label: 'Linear'},
      { value: 'sqrt', label: 'Square Root'},
      { value: 'ln', label: 'Logarithmic'}
    ];
    return (
      <div>
        <Select options={_options} value={this.state[key]} onChange={_onChange} clearable={false}/>
        <Select options={scaleFnOptions} value={this.state[objFnKey]} onChange={onChangeFn} clearable={false}/>
      </div>
    );
  },

  // d3-fu
  _drawSVG () {
    // if (!this.state.domWidth) return;
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
    const yTranslate = `translate(${AXIS_WIDTH}, ${0})`;
    let yAxis = svg.selectAll('g.y-axis').data([null]);
    yAxis.enter().append('g')
      .classed('y-axis', true)
      .attr({
        transform: yTranslate
      });
    yAxis.transition()
      .duration(TRANSITION_DURATION)
      .call(yAxisFn);

    // other rendering
    this._renderSigma();
    this._drawBoxPlots();
  },

  _renderSigma () {
    if (this.state.domWidth === DEFAULT_DOME_SIZE) return;
    const xScale = this._getXScale();
    const yScale = this._getYScale();
    const cScale = this._getCScale();
    const SIZE = 2; // always radius 2
    const DEFAULT_COLOR = '#1f77b4'; // d3 cool blue
    // adjust scales for the fact that sigma renders from middle, not edge
    const xAdjustment = (xScale.range()[1] - xScale.range()[0]) / 2 + PADDING_SIZE * 1.5 - 5;
    const yAdjustment = (yScale.range()[1] - yScale.range()[0]) / 2 - PADDING_SIZE * 1.5 + 5;
    const xFn = d => { return xScale(d[this.state.xKey]) - xAdjustment; };
    const yFn = d => { return yScale(d[this.state.yKey]) + yAdjustment; };
    // always put 'correct' position at x2, y2, old position (if known) at x, y
    // uses instance var this.lastGraph
    let hasLastRenderedData = (typeof this.lastGraph === 'object');
    const defaultY = yScale.range()[0];
    let nodesData = this.props.data.map( (d, i) => {
      let isUpdate = false;
      if (hasLastRenderedData) {
        isUpdate = typeof this.lastGraph.nodes[i] === 'object';
      }
      return {
        id: d.id,
        x: isUpdate ? this.lastGraph.nodes[i].x2 : xFn(d),
        y: isUpdate ? this.lastGraph.nodes[i].y2 : defaultY,
        x2: xFn(d),
        y2: yFn(d),
        size: SIZE,
        color: (d.study === 'Chong et al' ? DEFAULT_COLOR : '#bada55'),
        label: d.label
      };
    });
    let g = {
      nodes: nodesData,
      edges: []
    };

    // animate if sigma already exists
    // from https://github.com/jacomyal/sigma.js/blob/master/examples/animate.html
    if (typeof this.sigmaInstance === 'object') {
      this.sigmaInstance.graph.clear();
      this.sigmaInstance.refresh();
    }
    // re-render to 'old' position with values at x1, x2
    this.sigmaInstance = new sigma({
      graph: g,
      container: 'sigma-target',
      settings: {
        defaultNodeColor: DEFAULT_COLOR,
        drawEdges: false,
        minNodeSize: 1,
        maxNodeSize: 10,
        autoRescale: false,
        animationsTime: TRANSITION_DURATION,
        zoomMin: 1,
        zoomMax: 1
      }
    });
    // save that graph to instance var
    this.lastGraph = g;
    // animate to new 'correct' positions
    sigma.plugins.animate(
      this.sigmaInstance,
      { x: 'x2', y: 'y2', size: 'size' },
      {
        duration: TRANSITION_DURATION,
      }
    );
  },

  // d3 svg render
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
      bottoms.transition()
        .duration(TRANSITION_DURATION * 2)
        .attr({
          x1: midXFn,
          x2: midXFn,
          y1: y2Fn,
          y2: d => { return yScale(d.min); },
        });
  },

  _calculateDomSize () {
    let rect = this.refs.svgContainer.getBoundingClientRect();
    this.setState({ domWidth: rect.width });
  },

  _getXScale () {
    const _domain = this._getRangeByKey(this.state.xKey);
    const _range = [AXIS_WIDTH, this.state.domWidth - AXIS_WIDTH];
    return this._getScaleFn(this.state.xScaleFn)
      .domain(_domain)
      .range(_range);
  },

  _getYScale () {
    const _domain = this._getRangeByKey(this.state.yKey);
    const _range = [this.state.domHeight - PADDING_SIZE - AXIS_HEIGHT, PADDING_SIZE];
    return this._getScaleFn(this.state.yScaleFn)
      .domain(_domain)
      .range(_range);
  },

  _getScaleFn (scaleFnKey) {
    switch (scaleFnKey) {
      case 'linear':
        return d3.scale.linear();
        break;
      case 'ln':
        return d3.scale.log().base(Math.E);
        break;
      case 'sqrt':
        return d3.scale.sqrt();
        break;
    }
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
  for (var i = EXAMPLE_N; i >= 0; i--) {
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
    width: '90%',
    position: 'relative'
  },
  svg: {
    position: 'relative',
    zIndex: -1
  }
};

export default Chart;
