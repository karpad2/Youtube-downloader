import React, { Component } from 'react'
import { FaFolder, FaMicrophone, FaWindowClose, FaUser, FaPlayCircle } from 'react-icons/fa'
import './Listitemfinished.css';
import ProgressBar from './progressBar';
import {shell} from 'electron'

export default class Listitemfinished extends Component {
  constructor(props) {
    super(props);
    this.toHHMMSS = this.toHHMMSS.bind(this);
    this.destroy = this.destroy.bind(this);
    this.mouseHover = this.mouseHover.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.state = {
      isHovering: false,
      info: this.props.info,
      time: this.toHHMMSS(parseInt(this.props.info.length_seconds)),
      path: this.props.path
    }
  }

  destroy() { this.props.unmountMe(this.props.index) }
  mouseHover() { if (!this.state.isHovering) this.setState({ isHovering: true }) }
  mouseLeave() { this.setState({ isHovering: false }) }
  toHHMMSS(secs) {
    var sec_num = parseInt(secs, 10)    
    var hours   = Math.floor(sec_num / 3600) % 24
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60    
    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
  }

  render() {
    var { info, isHovering, time, path } = this.state;
    var title;
    if (info != null) {
      title = info.title.split('-');
      if (title[1] != undefined) title[1] = title[1].trim();
    }
    return (
      <div className="container">
        {info == null ? (
          <Loading /> 
        ) : (
          <div onMouseOver={this.mouseHover} onMouseLeave={this.mouseLeave} className="item_container">
            {isHovering && <div onClick={this.destroy} className='close'><FaWindowClose/></div>}
            <div className="img_container">
              <img src={info.thumbnail_url} alt="img"/>
              <div className="img_time">{time}</div>
            </div>
            <div className="info">
              {title[1] != undefined && <div className="info_div"><FaMicrophone /><div>{title[1]}</div></div>}
              {title[1] != undefined && <br/>}
              <div className="info_div"><FaUser /><div>{title[0]}</div></div><br/>
            </div>
            <div className="progressBar">
              <ProgressBar 
                strokeWidth="5"
                sqSize="45"
                percentage={100}/>
            </div>
            <div className="progressBar play">
              <ProgressBar 
                strokeWidth="5"
                sqSize="45"
                percentage={100}/>
            </div>
              <div className="btnIcon" onClick={() => shell.showItemInFolder(path)}>
                <FaFolder size={15}/>
              </div>
              <div className="btnIcon play" onClick={() => shell.openItem(path)}>
                <FaPlayCircle size={20}/>
              </div>
          </div>
        )}
      </div>
    )
  }
}
