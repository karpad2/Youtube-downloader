import React, { Component } from 'react'
import ytdl from 'ytdl-core'
import fs from 'fs'
import './Listitem.css'
import Logo from '../Updater/Logo'

export default class Listitem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: this.props.link,
      info: null,
      thumb: null
    }
  }

  componentWillMount() {
    var {link} = this.state;
    ytdl.getInfo(link, (err, info) => {
      if (err) throw err;
      console.log(info);
      this.setState({ info: info })
    })
  }

  render() {
    var {info, thumb} = this.state;
    return (
      <div className="item_container">
        {info == null ? <Logo/> : info.title}<br/>
      </div>
    )
  }
}
