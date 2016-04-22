import _ from 'underscore';
import React from 'react';
import d3 from 'd3';

const DNA = React.createClass({
  getDefaultProps () {
    return {
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATC',
      steps: [
        {
          imgSrc: 'img/lorem.png'
        },
        {
          imgSrc: 'img/lorem.png'
        },
        {
          imgSrc: 'img/lorem.png'
        },
        {
          imgSrc: 'img/lorem.png'
        }
      ]
    }
  },

  getInitialState() {
    return {
      currentStep: 0,
      rnaPolY: 8,
      rnaPolCoord: RNA_POL_START_COORD,
      isSplit: true,
      sceneY: START_SCENE_Y
    };
  },

  // decrease until end then reloop
  _incrementStep (e) {
    let newStep = this.state.currentStep + 1;
    if (newStep > this.props.steps.length) newStep = 0;
    this.setState({ currentStep: newStep });
  },

  render () {
    return (
      <div onClick={this._incrementStep}>
        <a-scene>
          <a-sky color='#272822' />
          {this._renderBillboard()}
          <a-entity position={`0 ${this.state.sceneY} 0`}>
            {this._renderSection(`0 0 0`)}
            {this._renderRNAPol()}
          </a-entity>
        </a-scene>
      </div>
    );
  },

  componentDidUpdate(prevProps, prevState) {
    // if 0 -> 1 animate rnaPolY
    if (this.state.currentStep === 1 && prevState.currentStep === 0) {
      const END_Y = 1.85;
      this._interpolateNumber(this.state.rnaPolY, END_Y, 1000, val => {
        this.setState({ rnaPolY: val});
      });
    }
    // if 1 -> 2 animate rnaPolCoord to go along DNA
    if (this.state.currentStep === 2 && prevState.currentStep === 1) {
      this.setState({ isSplit: true });
      this._interpolateNumber(RNA_POL_START_COORD, RNA_POL_END_COORD, 3000, val => {
        this.setState({ rnaPolCoord: val });
      });
    }
    // if 2 -> 3 animate whole thing up
    if (this.state.currentStep === 3 && prevState.currentStep === 2) {
      this._interpolateNumber(START_SCENE_Y, END_SCENE_Y, 2000, val => {
        this.setState({ sceneY: val });
      });
    }
    // reset cleanup
    if (this.state.currentStep === 0 && prevState.currentStep > 0) {
      this.setState({
        rnaPolY: 8,
        rnaPolCoord: RNA_POL_START_COORD,
        sceneY: START_SCENE_Y
      });
    }
  },

  // cb(val)
  _interpolateNumber(start, end, duration, cb) {
    const STEPS = duration / 1000 * 20;
    if (this.interTimer) clearInterval(this.interTimer);
    let current = start;
    let stepValue = (end - start) / STEPS;
    let isUp = (end > start);
    this.interTimer = setInterval( () => {
      current += stepValue;
      cb(current);
      let isFinished = ((isUp && current >= end) || (!isUp && current <= end));
      if (isFinished) {
        cb(end);
        clearInterval(this.interTimer);
      }
    }, duration / STEPS);
  },

  _renderSection (_position, _rotation) {
    let y = 2;
    let bpNodes = this.props.sequence.split('').map( (d, i) => {
      let bpNode = this._renderBasePair(d, i);
      let x = this._xScale(i);
      let r = this._rScale(i);
      return <a-entity key={`bp${i}`} rotation={`${r} 0 0`} position={`${x} ${y} 0`}>{bpNode}</a-entity>;
    });
    _position = _position || '0 0 0';
    _rotation = _rotation || '0 0 0';
    return (
      <a-entity position={_position}  rotation={_rotation}>
        {bpNodes}
      </a-entity>
    );
  },

  _renderRNAPol () {
    if (this.state.currentStep < 1) return null;
    let x = this._xScale(this.state.rnaPolCoord);
    let y = this.state.rnaPolY;
    let _position = `${x} ${y} 0`;
    let r = this._rScale(this.state.rnaPolCoord);
    return (
      <a-entity position={_position} rotation={`${r} 0 0`}>
        <a-sphere position={`0 ${-SIZE * 0.9} 0`} radius={SIZE / 3} color={RNA_POL_COLOR} />
        {this._renderMRNA()}
      </a-entity>
    );
  },

  _renderMRNA () {
    let tSeqLength = Math.round(this.state.rnaPolCoord - RNA_POL_START_COORD);
    let tSeq = this.props.sequence
      .split('')
      .splice(RNA_POL_START_COORD, tSeqLength)
      .join('');
    // make long if showing ribosome step
    if (this.state.currentStep >= 3) tSeq = this.props.sequence;
    let translateFactor = 6.5 - tSeq.length / 4.08;
    let nodes = tSeq.split('').map( (d, i) => {
      let bpNode = this._renderBasePair(d, i, true);
      let x = this._xScale(i) + translateFactor;
      return <a-entity key={`bp${i}`} position={`${x} -0.25 0`}>{bpNode}</a-entity>;
    });
    return <a-entity position={`0 -1 0`} rotation={`0 0 90`}>{nodes}</a-entity>;
  },

  _renderBillboard () {
    // TEMP nothin
    return null;
    if (this.state.currentStep < 2) return null;
    let currentStepD = this.props.steps[this.state.currentStep - 1];
    let _src = currentStepD.imgSrc;
    let _position = currentStepD.position || DEFAULT_BILLBOARD_POSITION;
    return <a-image position={_position} width='9' height='9' id='billboard-img' src={_src} />;
  },

  _getSeparation (coord) {
    const defaultVal = 0;
    const max = 0.25;
    const thresh = 3;
    if (!this.state.isSplit) return defaultVal;
    let distance = Math.abs(coord - this.state.rnaPolCoord);
    if (distance > thresh) return defaultVal;
    return (thresh - distance) * (max / thresh);
  },

  _getPlusOuterPos (coord) {
    let p = this._getSeparation(coord) + SIZE / 2;
    return `0 -${p} 0`;
  },

  _getMinusOuterPos (coord) {
    let p = this._getSeparation(coord) + SIZE / 2;
    return `0 ${p} 0`;
  },

  _getPlusInnerPos (coord) {
    let p =this._getSeparation(coord) +  SIZE / 4;
    return `0 -${p} 0`;
  },

  _getMinusInnerPos (coord) {
    let p = this._getSeparation(coord) + SIZE / 4;
    return `0 ${p} 0`;
  },

  _renderBasePair (seqChar, coord, isRNA) {
    seqChar = seqChar.toLowerCase();
    // select primary and complementary nucleic acid colors from character
    let p, c;
    switch (seqChar) {
      case 'a':
        p = A_COLOR;
        c = T_COLOR;
        break;
      case 't':
        p = T_COLOR;
        c = A_COLOR;
        break;
      case 'c':
        p = C_COLOR;
        c = G_COLOR;
        break;
      case 'g':
        p = G_COLOR;
        c = C_COLOR;
        break;
    }
    if (isRNA) {
      return (
        <a-entity>
          <a-cylinder position={this._getMinusInnerPos(coord)} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={c} />
          <a-sphere position={this._getMinusOuterPos(coord)} radius={SIZE / 10} color={B_COLOR} />
        </a-entity>
      );
    }
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(coord)} radius={SIZE / 10} color={B_COLOR} />
        <a-cylinder position={this._getPlusInnerPos(coord)} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={p} />
        <a-cylinder position={this._getMinusInnerPos(coord)} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={c} />
        <a-sphere position={this._getMinusOuterPos(coord)} radius={SIZE / 10} color={B_COLOR} />
      </a-entity>
    );
  },

  _xScale (coord) {
    const scale = d3.scale.linear()
      .domain([0, 50])
      .range([-6.125, 6.375]);
    return scale(coord);
  },

  _rScale (coord) {
    return (coord * STEP_FACTOR_R) % 360;
  },
});

export default DNA;

//  colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';
const B_COLOR = '#3499FB';
const RNA_POL_COLOR = '#E85379';

const DEFAULT_BILLBOARD_POSITION = '0 1 -2';
const RNA_POL_START_COORD = 25;
const RNA_POL_END_COORD = 33;
const SIZE = 0.75;
const STEP_FACTOR_R = 22;
const START_SCENE_Y = 0;
const END_SCENE_Y = 10;
