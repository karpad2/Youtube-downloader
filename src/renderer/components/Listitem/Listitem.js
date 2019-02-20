import React, { Component } from 'react'
import ytdl from 'ytdl-core'
import fs from 'fs'
import './Listitem.css'
import Loading from './Loading'
import ProgressBar from './progressBar'
import {FaMicrophone, FaUser, FaCloudDownloadAlt, FaWindowClose, FaPauseCircle} from 'react-icons/fa'
import ffmpegPath from 'ffmpeg-static-electron'
import ffmpeg from 'fluent-ffmpeg'
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment)
  ffmpeg.setFfmpegPath(ffmpegPath.path);
else
  ffmpeg.setFfmpegPath(ffmpegPath.path.replace("app.asar", "app.asar.unpacked"));

export default class Listitem extends Component {
  constructor(props) {
    super(props);
    this.destroy = this.destroy.bind(this);
    this.mouseHover = this.mouseHover.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.doDownload = this.doDownload.bind(this);
    this.state = {
      link: this.props.link,
      info: null,
      isHovering: false,
      isDownloading: false,
      percent: 0,
    }
  }

  destroy() { this.props.unmountMe(this.props.index) }
  mouseHover() { if (!this.state.isHovering) this.setState({ isHovering: true }) }
  mouseLeave() { this.setState({ isHovering: false }) }
  doDownload() {
    var options = {
      quality: 'highest',
      filter: 'audio',
    }
    var path = (`D:\\Music\\${this.state.info.title.replace(/[*/':<>?\\|]/g,'_')}.mp3`)
    ffmpeg(ytdl.downloadFromInfo(this.state.info, options)
          .on('progress', (length, downloaded, totallength) => {
            this.setState({ percent: Math.round(downloaded / totallength * 100) })
            console.log((downloaded / 1024 / 1024).toFixed(2) + " Mb/" + (totallength / 1024 / 1024).toFixed(2) + " Mb");
          })
          .on('end', this.destroy))
    .toFormat('mp3')
    .audioBitrate('192')
    .save(path);
  }

  componentWillMount() {
    var {link} = this.state;
    ytdl.getInfo(link, (err, info) => {
      if (err) throw err;
      console.log(ytdl.filterFormats(info.formats, "audioonly"));
      this.setState({ info: info })
    })
  }

  render() {
    var {info, isHovering, isDownloading, percent} = this.state;
    var title;
    if (info != null) {
      title = info.title.split('-');
      if (title[1] != undefined) title[1] = title[1].trim();
    }
    return (
      <div>
        {info == null ? (
          <Loading /> 
        ) : (
          <div onMouseOver={this.mouseHover} onMouseLeave={this.mouseLeave} className="item_container">
            {isHovering && <div onClick={this.destroy} className='close'><FaWindowClose/></div>}
            <img src={info.thumbnail_url} alt="img"/>
            <div className="info">
              {title[1] != undefined && <div><FaMicrophone />{title[1]}</div>}
              {title[1] != undefined && <br/>}
              <div><FaUser />{title[0]}</div>
            </div>
            <div className="btnDownload">
              <div className="progressBar">
                <ProgressBar 
                  strokeWidth="4"
                  sqSize="30"
                  percentage={percent}/>
              </div>
              <div className="btnIcon" onClick={this.doDownload}>
                { isDownloading ? <FaPauseCircle /> : <FaCloudDownloadAlt /> }
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
