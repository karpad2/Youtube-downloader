import React, { Component } from 'react'
import clipboard from 'electron-clipboard-extended'
import Listitem from '../components/Listitem/Listitem'
import { FaArrowDown, FaArrowsAltV, FaWindowClose, FaWindowRestore, FaWindowMinimize } from 'react-icons/fa'
import { IoIosOptions } from 'react-icons/io'
import './Home.css'
import ytpl from 'ytpl'
import { ipcRenderer } from 'electron'

//TODO: Add playlist
//TODO: Options panel
//TODO: Modal option window

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.updateLinks = this.updateLinks.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.startAll = this.startAll.bind(this);
    //this.getList = this.getList.bind(this);
    this.btnRefs = [];
    this.state = {
      links: [], 
    }
  }

  startAll() {
    this.btnRefs.forEach(btn => {
      btn.current.doDownload();
    })
  }

  updateLinks(link) {
    this.btnRefs.push(React.createRef());
    this.setState({
      links: [...this.state.links, link]
    })
  }

  deleteLink(key) {  
    var arr = [...this.state.links];
    arr.splice(key, 1);
    this.setState({
      links: [...arr]
    })
    arr = [...this.btnRefs];
    arr.splice(key, 1);
    this.btnRefs = [...arr];
  }

  componentDidMount() {
    clipboard.on('text-changed', () => {
      var regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
      var text = clipboard.readText()
      var link = text.match(regExp);
      if (link != null) {
        
        this.updateLinks(text);
      }
    }).startWatching();
  }

  componentWillUnmount() {
    clipboard.stopWatching();
  }

  render() {
    var { links } = this.state
    return (
      <div>
        <div className="navbar">
          <div className="appName">Youtube Downloader</div>
          <div className="buttons">
            <div><FaWindowClose onClick={() => ipcRenderer.send('closeWindow')}/></div>
            <div><FaWindowRestore onClick={() => ipcRenderer.send('resizeWindow')}/></div>
            <div><FaWindowMinimize onClick={() => ipcRenderer.send('minimizeWindow')}/></div>
          </div>
        </div>
        <div className="menu">
          <div className="btnOptions">
            <IoIosOptions size={30}/>
            Options
          </div>
          <div className="btnDownload">
            <FaArrowDown size={30} onClick={this.startAll}/>
            Start all
          </div>
        </div>
        {links.length > 0 ? links.map((link, i) => {
          return <Listitem link={link} index={i} ref={this.btnRefs[i]} unmountMe={(index) => this.deleteLink(index)} key={link}/>
        }) : <div className="hint_text">Copy a youtube link</div>}
      </div>
    )
  }
}