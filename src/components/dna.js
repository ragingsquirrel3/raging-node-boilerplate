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
    return INITIAL_STATE_OBJ;
  },

  // decrease until end then reloop
  _incrementStep (e) {
    if (this.state.isMoving) return;
    let newStep = this.state.currentStep + 1;
    if (newStep > this.props.steps.length) newStep = 0;
    this.setState({ currentStep: newStep });
  },

  render () {
    let bgColor = this._isInNucles() ? NUCLEUS_BG_COLOR : CYTO_BG_COLOR;
    return (
      <div onClick={this._incrementStep}>
        <a-scene>
          <a-sky color={bgColor} />
          {this._renderBillboard()}
          <a-entity position={`0 ${this.state.sceneY} 0`}>
            {this._renderSection(`0 0 0`)}
            {this._renderRNAPol()}
            {this._renderRibosome()}
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
     // if 1 -> 2 separate
    if (this.state.currentStep === 2 && prevState.currentStep === 1) {
      this._interpolateNumber(0, FINAL_SEPARATION_FACTOR, 1000, val => {
        this.setState({ separation: val });
      });
    }
    // if 2 -> 3 animate rnaPolCoord to go along DNA
    if (this.state.currentStep === 3 && prevState.currentStep === 2) {
      this.setState({ isSplit: true });
      this._interpolateNumber(RNA_POL_START_COORD, RNA_POL_END_COORD, 3000, val => {
        this.setState({ rnaPolCoord: val });
      });
    }
    // if 3 -> 4 animate whole thing up
    if (this.state.currentStep === 4 && prevState.currentStep === 3) {
      this._interpolateNumber(START_SCENE_Y, END_SCENE_Y, 2000, val => {
        this.setState({ sceneY: val });
      });
    }
    // if 4 -> 5 attach ribo
    if (this.state.currentStep === 5 && prevState.currentStep === 4) {
      let endX = this._xScale(this.state.rnaPolCoord) - 0.4;
      this._interpolateNumber(FAR_LEFT, endX, 1000, val => {
        this.setState({ riboX: val });
      });
    }
    // if 5 -> 6 translate
    if (this.state.currentStep === 6 && prevState.currentStep === 5) {
      let endY = RIBO_END_Y;
      this._interpolateNumber(RIBO_START_Y, endY, 1000, val => {
        this.setState({ riboY: val });
      });
    }
    // reset cleanup
    if (this.state.currentStep === 0 && prevState.currentStep > 0) {
      this.setState(INITIAL_STATE_OBJ);
    }
  },

  // cb(val)
  _interpolateNumber(start, end, duration, cb) {
    this.setState({ isMoving: true });
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
        this.setState({ isMoving: false });
        cb(end);
        clearInterval(this.interTimer);
      }
    }, duration / STEPS);
  },

  _renderSection (_position, _rotation) {
    // don't render after leaving nucleus
    if (!this._isInNucles()) return null;
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
    if (this.state.currentStep >= 4) tSeq = this.props.sequence;
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

  // ribosome and polypeptide chain
  _renderRibosome () {
    let _position = `${this.state.riboX} ${this.state.riboY} 0`;
    // make a peptide change with length corresponding to progress
    // 0 - 1 of translation progress
    let totalDelta = Math.abs(RIBO_START_Y - RIBO_END_Y);
    let currentDelta = Math.abs(this.state.riboY - RIBO_END_Y);
    let progress = 1 -currentDelta / totalDelta;
    let pepLength = Math.round(progress * END_PEP_LENGTH);
    let pepNodes = [];
    let x = 0;
    for (var i = pepLength; i > 0; i--) {
      x += PEP_STEP_FACTOR;
      pepNodes.push(this._renderAminoAcid(x));
    }
    return (
      <a-entity position={_position}>
        <a-sphere radius={SIZE / 2} color={RIBOSOME_COLOR} />
        {pepNodes}
      </a-entity>
    );
  },

  _renderAminoAcid (relX) {
    return (
      <a-entity key={`pep${relX}`} position={`${relX} 0 0`}>
        <a-sphere radius={SIZE / 5} color={PEP_COLOR} />
      </a-entity>
    );
  },

  _getSeparation (coord) {
    const defaultVal = 0;
    const max = this.state.separation;
    const thresh = 2;
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

  _isInNucles () {
    return this.state.sceneY < BORDER_Y;
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

// colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';
const B_COLOR = '#3499FB';
const RNA_POL_COLOR = '#E85379';
const RIBOSOME_COLOR = '#3499FB';
const PEP_COLOR = G_COLOR; // TEMP, should be dynamic
const NUCLEUS_BG_COLOR = '#272822';
const CYTO_BG_COLOR = '#FFF';

const DEFAULT_BILLBOARD_POSITION = '0 1 -2';
const RNA_POL_START_COORD = 25;
const RNA_POL_END_COORD = 33;
const SIZE = 0.75;
const STEP_FACTOR_R = 22;
const START_SCENE_Y = 0;
const END_SCENE_Y = 10;
const BORDER_Y = Math.abs(START_SCENE_Y - END_SCENE_Y) / 2;
const RIBO_START_Y = -(END_SCENE_Y - 3.5);
const RIBO_END_Y = RIBO_START_Y - 3;
const FAR_LEFT = -20;
const END_PEP_LENGTH = 12;
const PEP_STEP_FACTOR = 0.25;
const FINAL_SEPARATION_FACTOR = 0.25;
const INITIAL_STATE_OBJ = {
  currentStep: 0,
  rnaPolY: 8,
  rnaPolCoord: RNA_POL_START_COORD,
  isSplit: true,
  sceneY: START_SCENE_Y,
  riboX: FAR_LEFT,
  riboY: RIBO_START_Y,
  isMoving: false,
  separation: 0
};
