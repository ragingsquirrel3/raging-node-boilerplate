import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';

const DNA = React.createClass({
  getDefaultProps () {
    return {
      // sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTA'
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTATATGTATACGAATGGAAAAATTTATCCGAATCTC'
    }
  },

  getInitialState() {
    return {
      particles: []
    };
  },

  render () {
    const seqFns = {
      a: this._renderA,
      t: this._renderT,
      c: this._renderC,
      g: this._renderG
    };
    let x = -10;
    let y = 2;
    let r = 0
    const bpNodes = this.props.sequence.split('').map( (d, i) => {
      let bp = d.toLowerCase();
      let bpSequenceFn = seqFns[bp];
      let bpNode = bpSequenceFn(i);
      x += STEP_FACTOR_X;
      r += STEP_FACTOR_R;
      if (r > 360) {
        r = 0;
      }
      return <a-entity key={`bp${i}`} rotation={`${r} 0 0`} position={`${x} ${y} 0`}>{bpNode}</a-entity>;
    });

    let rNodes = this._renderRNodes();
    let RNAPolNode = this._renderRNAPolNode();
    return (
      <div>
        <a-scene>
          {rNodes}
          {RNAPolNode}
          {bpNodes}
        </a-scene>
      </div>
    );
  },

  _renderRNodes () {
    let nodes = this.state.particles.map( (d, i) => {
      // adjust x and y 
      const ADJUSTMENT_FACTOR = 10;
      let x = d.x / ADJUSTMENT_FACTOR;
      let y = d.y / ADJUSTMENT_FACTOR;
      return <a-sphere key={`r${i}`} position={`${x} ${y} -5`} radius="0.25" color='yellow'></a-sphere>;
    });
    return (
      <a-entity>
        {nodes}
      </a-entity>
    );
  },

  _renderRNAPolNode () {
     return (
        <a-entity position={`${this.props.mRNAPos * STEP_FACTOR_X - 10} 2 0`} rotation={`${this.props.mRNAPos * STEP_FACTOR_R + 90} 2.25 0`}>
          <a-sphere position='0 0 1'  radius='0.5' color='#684A3A'></a-sphere>
        </a-entity>
      );
  },

  _getPlusOuterPos (tSiteDistance) {
    let p = (tSiteDistance < 5) ? (0.5 + (5 - tSiteDistance) / 5) : 0.5
    return `0 -${p} 0`;
  },

  _getMinusOuterPos (tSiteDistance) {
    let p = (tSiteDistance < 5) ? (0.5 + (5 - tSiteDistance) / 5) : 0.5
    return `0 ${p} 0`;
  },

  _getPlusInnerPos (tSiteDistance) {
    let p = (tSiteDistance < 5) ? (0.5 + (5 - tSiteDistance) / 5) - 0.25 : 0.25
    return `0 -${p} 0`;
  },

  _getMinusInnerPos (tSiteDistance) {
    let p = (tSiteDistance < 5) ? (0.5 + (5 - tSiteDistance) / 5) - 0.25 : 0.25
    return `0 ${p} 0`;
  },

  _renderA (coord) {
    let distance = Math.abs(this.props.mRNAPos - coord);
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderT (coord) {
    let distance = Math.abs(this.props.mRNAPos - coord);
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderC (coord) {
    let distance = Math.abs(this.props.mRNAPos - coord);
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderG (coord) {
    let distance = Math.abs(this.props.mRNAPos - coord);
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  componentDidMount () {
    // don't animate particles for now
    // this._setupParticleAnimation();
    // animate DNA splitting
    const DELAY = 20;
    setInterval( () => {
      this.props.dispatch({ type: 'INCREMENT_TRANSCRIPTION', value: 0.05 });
    }, DELAY);
  },

  // d3 force fn a la https://github.com/mbostock/d3/wiki/Force-Layout
  // save animation state to state
  _setupParticleAnimation () {
    const MAX = 10;
    const N_PARTICLES = 10;
    const DELAY = 500;
    const force = d3.layout.force()
      .nodes([{}]) // single node
      .links([])
      .linkDistance(0.25)
      .gravity(0.1)
      .charge(-60)
      .size([MAX, MAX]);
    let nodes = force.nodes();
    let links = force.links();
    let nodeInterval = 0;
    // add nodes
    function addNode () {
      if (nodes.length > N_PARTICLES) return;
      nodeInterval ++;
      nodes.push({});
    };
    function addLink () {
      links.push({
        target: nodeInterval,
        source: nodeInterval - 1
      });
    };
    // on timer, add particles to nodes
    setInterval( () => {
      // only do n particles
      if (nodeInterval > N_PARTICLES || !this.isMounted()) return;
      addNode();
      if (nodeInterval > 0) addLink();
      force.start();
    }, DELAY);

    // update state on tick
    force.on('tick', e => {
      nodes[0].x = 0;
      nodes[0].y = 0;
      this.setState({ particles: nodes });
    });
    force.start();
  }
});


const mapStateToProps = (_state) => {
  let state = _state.dnaSceneReducer;
  return {
    promoterPos: state.promoterPos,
    mRNAPos: state.mRNAPos
  };
};

const AnimatedDNA = connect(
  mapStateToProps
)(DNA);

export default AnimatedDNA;

// bp colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';
const B_COLOR = '#3499FB';

const STEP_FACTOR_X = 0.35;
const STEP_FACTOR_R = 22;
