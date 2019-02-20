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
    this.toHHMMSS = this.toHHMMSS.bind(this);
    this.chooseFormat = this.chooseFormat.bind(this);
    this.state = {
      link: this.props.link,
      info: null,
      isHovering: false,
      isDownloading: false,
      percent: 0,
      time: 0,
      videoformats: [],
      selectedFormat: 'mp3'
    }
  }

  chooseFormat(id) {
    if (id >= 0) this.setState({ selectedFormat: this.state.videoformats[id].quality_label })
    else this.setState({ selectedFormat: "mp3" })
  }
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
  destroy() { this.props.unmountMe(this.props.index) }
  mouseHover() { if (!this.state.isHovering) this.setState({ isHovering: true }) }
  mouseLeave() { this.setState({ isHovering: false }) }
  doDownload() {
    var {selectedFormat} = this.state;
    var path = (`D:\\Music\\${this.state.info.title.replace(/[*/':<>?\\|]/g,'_')}`)
    var format, options;
    if (selectedFormat !== "mp3") {
      options = {
        filter: (format) => format.quality_label === selectedFormat
      }
      ytdl.downloadFromInfo(this.state.info, { quality: 'highest', filter: 'audio'})
          .on('progress', (length, downloaded, totallength) => {
            this.setState({ percent: Math.round(downloaded / totallength * 100) })
            console.log((downloaded / 1024 / 1024).toFixed(2) + " Mb/" + (totallength / 1024 / 1024).toFixed(2) + " Mb");
          })
          .pipe(fs.createWriteStream(path + "_audio.mp4"))
          .on('finish', () => {
            ffmpeg()
              .input(ytdl.downloadFromInfo(this.state.info, options)
                .on('progress', (length, downloaded, totallength) => {
                  this.setState({ percent: Math.round(downloaded / totallength * 100) })
                  console.log((downloaded / 1024 / 1024).toFixed(2) + " Mb/" + (totallength / 1024 / 1024).toFixed(2) + " Mb");
                }))
              .videoCodec('copy')
              .input(path + "_audio.mp4")
              .audioCodec('copy')
              .save(path + ".mp4")
              .on('end', () => {
                fs.unlink(path + "_audio.mp4", err => {
                  if(err) throw err;
                  this.destroy();
                });
              });
          })
    }
    else {
      options = {
        quality: 'highest',
        filter: 'audio'
      }
      ffmpeg(ytdl.downloadFromInfo(this.state.info, options)
            .on('progress', (length, downloaded, totallength) => {
              this.setState({ percent: Math.round(downloaded / totallength * 100) })
              console.log((downloaded / 1024 / 1024).toFixed(2) + " Mb/" + (totallength / 1024 / 1024).toFixed(2) + " Mb");
            })
            .on('end', this.destroy))
      .toFormat('mp3')
      .audioBitrate('192')
      .save(path+'.mp3');
      
    }
  }

  componentWillMount() {
    var {link} = this.state;
    ytdl.getInfo(link, (err, info) => {
      if (err) throw err;
      console.log(info);
      var allformats = ytdl.filterFormats(info.formats, "videoonly");
      var formats = [];
      allformats.forEach(format=> {
        if (!JSON.stringify(formats).includes(format.quality_label)) formats.push(format);
      })
      console.log(formats);
      this.setState({ 
        info: info, 
        time: this.toHHMMSS(parseInt(info.length_seconds)), 
        videoformats: formats
      })
    })
  }

  render() {
    var {info, isHovering, isDownloading, percent, time, videoformats} = this.state;
    var title, time;
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
            <div className="img_container">
              {isHovering && <div onClick={this.destroy} className='close'><FaWindowClose/></div>}
              <img src={info.thumbnail_url} alt="img"/>
              <div className="img_time">{time}</div>
            </div>
            <div className="info">
              {title[1] != undefined && <div className="info_div"><FaMicrophone /><div>{title[1]}</div></div>}
              {title[1] != undefined && <br/>}
              <div className="info_div"><FaUser /><div>{title[0]}</div></div><br/>
              <div className="radio-group">
                <div>
                  <input type="radio" onClick={() => this.chooseFormat(-1)} name="type" className="btnRadio" id="option" defaultChecked />
                  <label htmlFor="option">MP3</label>
                </div>
                {videoformats.map((format, i) => {
                  return (
                    <div key={i}>
                      <input type="radio" onClick={() => this.chooseFormat(i)} name="type" className="btnRadio" id={`option${i}`} />
                      <label htmlFor={`option${i}`}>{format.quality_label}</label>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="btnDownload">
              <div className="progressBar">
                <ProgressBar 
                  strokeWidth="6"
                  sqSize="45"
                  percentage={percent}/>
              </div>
              <div className="btnIcon" onClick={this.doDownload}>
                { isDownloading ? <FaPauseCircle /> : <FaCloudDownloadAlt size={30}/> }
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
