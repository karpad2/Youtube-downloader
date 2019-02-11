import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Logo from '../components/Updater/Logo'
import Progressbar from '../components/Updater/Progressbar'

export default class Update extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="">
        <Logo />
        <Progressbar percent={this.props.percent} />
      </div>
    )
  }
}