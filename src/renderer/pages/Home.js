import React, { Component } from 'react'
import Logo from '../components/Updater/Logo'
import Progressbar from '../components/Updater/Progressbar'

export default class Home extends Component {
  render() {
    return (
      <div>
        No available update yet!
        <Logo />
        <Progressbar percent={50} />
      </div>
    )
  }
}