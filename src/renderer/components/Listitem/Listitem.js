import React, { Component } from 'react'
import ytdl from 'ytdl-core'
import fs from 'fs'
import './Listitem.css'
import Loading from './Loading'
import ProgressBar from './progressBar'
import {FaMicrophone, FaUser, FaArrowDown, FaTimesCircle, FaPauseCircle, FaPlayCircle} from 'react-icons/fa'
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
    this.loaded = this.loaded.bind(this);
    this.destroy = this.destroy.bind(this);
    this.mouseHover = this.mouseHover.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.doDownload = this.doDownload.bind(this);
    this.toHHMMSS = this.toHHMMSS.bind(this);
    this.chooseFormat = this.chooseFormat.bind(this);
    this.pause = this.pause.bind(this);
    this.close = this.close.bind(this);
    this.audio = null;
    this.video = null;
    this.convert = null;
    this.path;
    this.state = {
      link: this.props.link,
      info: null,
      isHovering: false,
      isDownloading: false,
      percentA: 0,
      percentV: 0,
      time: 0,
      videoformats: [],
      selectedFormat: 'mp3'
    }
  }

  chooseFormat(event) { this.setState({ selectedFormat: event.target.value }) }
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
  loaded() { this.props.loaded(this.props.index) }
  close() { this.props.unmountMe(this.props.index) }
  destroy(path) { this.props.unmountMe(this.props.index, this.state.info, path) }
  mouseHover() { if (!this.state.isHovering) this.setState({ isHovering: true }) }
  mouseLeave() { this.setState({ isHovering: false }) }
  doDownload() {
    if (this.state.info != null) {
      if (!this.state.isDownloading) {
        this.setState({isDownloading: true});
        if (this.state.percentA > 0 || this.state.percentV > 0) {
          if (selectedFormat == 'mp3') {
            this.audio.resume();
          }
          else {
            if (this.video != null)
              this.video.resume();
            else
              this.audio.resume();
          }
        }
        else {
          if (this.convert != null) this.convert.kill();
          var options = {
            quality: 'highest',
            filter: 'audio',
            highWaterMark: 0
          };
          var {selectedFormat} = this.state;
          var path = this.props.options.path;
          var audioBitrate = this.props.options.bitrate;
          if (process.platform === "win32") {
            if (!fs.existsSync(path)) {
              path = path.split("\\")
              for (var i = 0; i < path.length; i++) {
                var dir = path.slice(0, i+1).join('\\');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir)
              }
            }
            else
              path = path.split("\\")
            path = path.join("\\") + "\\";
          }
          else {
            if (!fs.existsSync(path)) {
              path = path.split("/")
              for (var i = 1; i < path.length; i++) {
                var dir = path.slice(0, i+1).join("/");
                if (!fs.existsSync(dir)) fs.mkdirSync(dir)
              }
            }
            else
              path = path.split("/")
            path = path.join("/") + "/";
          }
          var file = this.path = path + this.state.info.title.replace(/[*'/":<>?\\|]/g,'_');
          if (selectedFormat == 'mp3') {
            if (!fs.existsSync(file + ".mp3")) {
              this.audio = ytdl(this.state.link, options)
              .on('progress', (length, downloaded, totallength) => {
                if (!this.state.isDownloading)
                  this.audio.pause();
                this.setState({ percentA: Math.round(downloaded / totallength * 100) })
              })
              this.convert = ffmpeg(this.audio.on('end', () => this.destroy(file + ".mp3")))
              .toFormat('mp3')
              .audioBitrate(audioBitrate)
              .save(file+'.mp3');
            }
            else this.destroy(file + ".mp3")
          }
          else {
            if (!fs.existsSync(file + ".mp4")) {
              this.audio = ytdl(this.state.link, options)
              .on('progress', (length, downloaded, totallength) => {
                if (!this.state.isDownloading)
                  this.audio.pause();
                this.setState({ percentA: Math.round(downloaded / totallength * 100) })
              })
              .on('error', (err) => console.log(err))
              this.convert = ffmpeg(this.audio)
              .toFormat('mp3')
              .save(file+'_audio.mp3')
              .on('end', () => {
                options = {filter: (format) => format.quality_label === selectedFormat}
                this.video = ytdl(this.state.link, options)
                .on('progress', (length, downloaded, totallength) => {
                  if (!this.state.isDownloading)
                    this.video.pause();
                  this.setState({ percentV: Math.round(downloaded / totallength * 100) })
                })
                this.convert = ffmpeg()
                .input(this.video)
                .videoCodec('copy')
                .input(file + "_audio.mp3")
                .audioCodec('copy')
                .save(file + ".mp4")
                .on('end', () => {
                  fs.unlink(file + "_audio.mp3", err => {
                    if(err) throw err;
                  });
                  this.savedPath = file + ".mp4"
                  this.destroy(file + ".mp4");
                });
              })
            }
            else this.destroy(file + ".mp4")
          }
        }
      }
    }
  }
  pause() {
    this.setState({isDownloading: false});
    if (this.state.selectedFormat == 'mp3') {
      this.audio.pause();
    }
    else {
      if (this.video != null)
        this.video.pause();
      else
        this.audio.pause();
    }
  }

  componentWillMount() {
    var {link} = this.state;
    ytdl.getInfo(link, (err, info) => {
      if (err) this.close();
      else {
        this.loaded();
        var allformats = ytdl.filterFormats(info.formats, "videoonly");
        var formats = [];
        allformats.forEach(format=> {
          if (!JSON.stringify(formats).includes(format.quality_label)) formats.push(format);
        })
        //console.log(info);
        this.setState({ 
          info: info, 
          time: this.toHHMMSS(parseInt(info.length_seconds)), 
          videoformats: formats
        })
      }
    })
  }

  componentWillUnmount() {
    if (this.audio != null) this.audio.destroy();
    if (this.video != null) this.video.destroy();
    if (this.convert != null) this.convert.kill();
    if (this.state.percentA > 0 || this.state.percentV > 0) {
      if (this.state.percentA != 100) {
        if (this.state.selectedFormat != 'mp3')
          fs.unlink(this.path + '_audio.mp3', err => console.log(err))
        else 
          fs.unlink(this.path + '.mp3', err => console.log(err))
      }
      else if (this.state.percentV != 100) {
        if (this.state.selectedFormat != 'mp3') {
          fs.unlink(this.path + '_audio.mp3', err => console.log(err))
          fs.unlink(this.path + '.mp4', err => console.log(err))
        }
      }
    }
  }

  render() {
    var {info, isHovering, isDownloading, percentA, percentV, time, videoformats} = this.state;
    var title, time;
    if (info != null) {
      title = info.title.split('-');
      if (title[1] != undefined) title[1] = title[1].trim();
    }
    var colors = this.props.style;
    return (
      <div style={{display: this.props.display, backgroundColor: colors.background, color: colors.color, boxShadow: '0px 0px 2px 2px ' + colors.shadow}} className="container">
        {info == null ? (
          <Loading color={colors.secondary}/> 
        ) : (
          <div onMouseOver={this.mouseHover} onMouseLeave={this.mouseLeave} className="item_container">
          {isHovering && <div onClick={this.close} style={{color: colors.color}} className='close'><FaTimesCircle/></div>}
            <div className="img_container">
              <img src={info.thumbnail_url} alt="img"/>
              <div className="img_time">{time}</div>
            </div>
            <div className="info">
              {title[1] != undefined && <div className="info_div"><FaMicrophone /><div>{title[1]}</div></div>}
              {title[1] != undefined && <br/>}
              <div className="info_div"><FaUser /><div>{title[0]}</div></div><br/>
              <div className={"radio-group " + (this.props.options.theme === 1 ? 'linput' : 'dinput')} style={{backgroundColor: colors.background, boxShadow: '0 0 2px 2px ' + colors.shadow}}>
                <div>
                  <input type="radio" onClick={this.chooseFormat} value={"mp3"} name={`${this.props.index}type`} className="btnRadio" id={`${this.props.index}option`} defaultChecked />
                  <label htmlFor={`${this.props.index}option`}>MP3</label>
                </div>
                  {videoformats.map((format, i) => {
                    return (
                      <div key={i}>
                        <input type="radio" onClick={this.chooseFormat} value={format.quality_label} name={`${this.props.index}type`} className="btnRadio" id={`${this.props.index}option${i}`} />
                        <label htmlFor={`${this.props.index}option${i}`}>{format.quality_label}</label>
                      </div>
                    )
                  })}
              </div>
            </div>
            <div className="progressBar" style={(percentA == 0 && isDownloading) ? {animation: 'rotating 1s ease-in-out infinite', boxShadow: '0 0 5px 5px ' + colors.shadow} : {boxShadow: '0 0 5px 5px ' + colors.shadow}}>
              <ProgressBar 
                strokeWidth="5"
                sqSize="45"
                color={colors.secondary}
                percentage={(percentA == 0 && isDownloading)? 5 : percentA}/>
            </div>
            <div className="progressBar" style={(percentV == 0 && isDownloading) ? {animation: 'rotating 1s ease-in-out infinite', boxShadow: '0 0 5px 5px ' + colors.shadow} : {boxShadow: '0 0 5px 5px ' + colors.shadow}}>
              <ProgressBar 
                strokeWidth="5"
                sqSize="60"
                color={colors.secondary}
                percentage={(percentV == 0 && isDownloading && percentA == 100)? 5 : percentV}/>
            </div>
            {isDownloading ? 
              <div className="btnIcon" style={{backgroundColor: colors.secondary, color: colors.background}} onClick={this.pause}>
                <FaPauseCircle size={20}/>
              </div> :
              <div className="btnIcon download" style={{backgroundColor: colors.secondary, color: colors.background}} onClick={this.doDownload}>
                <FaPlayCircle size={20}/>
              </div>
            }
          </div>
        )}
      </div>
    )
  }
}
