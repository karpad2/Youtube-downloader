import React, { Component } from 'react'
import Logo from '../components/Updater/Logo'
import Progressbar from '../components/Updater/Progressbar'
import './Update.css'

export default class Update extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="update_container">
        <Logo />
        <Progressbar percent={this.props.percent} />
      </div>
    )
  }
}