'use strict';
import 'babel-register';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
console.log(ReactDOMServer)

import DNA from '../components/dna';

let DNAElement = React.createElement(DNA, {});
const htmlString = ReactDOMServer.renderToStaticMarkup(DNAElement);
console.log(htmlString)