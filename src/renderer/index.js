import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const rootEl = document.getElementById('app');

function render() { ReactDOM.render(<App />, rootEl) }

if (module.hot) module.hot.accept('./App', render)

render();