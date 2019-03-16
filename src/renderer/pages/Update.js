import React, { Component } from 'react'
import Logo from '../components/Updater/Logo'
import Progressbar from '../components/Updater/Progressbar'
import './Update.css'
import {dark, light} from '../style/colors'
import { ipcRenderer } from 'electron';
import fs from 'fs'

export default class Update extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: 0
    }
  }

  componentWillMount() {
    ipcRenderer.on('configPath', (event, arg) => {
      var options = JSON.parse(fs.readFileSync(arg + "config.json"), 'utf8');
      this.setState({
        theme: options.theme != undefined ? options.theme : this.state.theme,
      });
    });
  }

  render() {
    var colors = this.state.theme === 1 ? light : dark;
    return (
      <div className="update" style={{backgroundColor: colors.background2, color: colors.color}}>
        <div className="update_container">
          <Logo color={colors.secondary}/>
          <Progressbar colors={colors} percent={50} />
        </div>
      </div>
    )
  }
}