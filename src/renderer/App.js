import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Home from './pages/Home';
import Update from './pages/Update';
import Logo from './components/Updater/Logo';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.updateReady = this.updateReady.bind(this);
    this.loadApp = this.loadApp.bind(this);
    this.state = {
      loading: true,
      update: false,
      percent: 0
    }
  }

  updateReady(arg) {
    this.setState({ loading:false, update: true, percent: Math.round(Number(arg)) })
  }

  loadApp() {
    this.setState({ loading: false });
  }

  componentWillMount() {
    ipcRenderer.on('updateReady', (event, arg) => {
      this.updateReady(arg);
    });
    ipcRenderer.on('noUpdateReady', () => {
      this.loadApp();
    });
  }

  render() {
    var {update, percent, loading} = this.state;
    return (
      <div style={{height: '100%'}}>
        {(!loading && update) ? <Update percent={percent}/> : <Home />}
      </div>
    )
  }
}