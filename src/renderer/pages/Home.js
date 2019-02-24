import React, { Component } from 'react'
import clipboard from 'electron-clipboard-extended'
import Listitem from '../components/Listitem/Listitem'
import { FaArrowDown, FaArrowsAltV, FaWindowClose, FaWindowRestore, FaWindowMinimize } from 'react-icons/fa'
import { IoIosOptions } from 'react-icons/io'
import './Home.css'
import ytpl from 'ytpl'
import { ipcRenderer } from 'electron'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@material-ui/core';

//TODO: Add playlist
//TODO: Modal option window

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.updateLinks = this.updateLinks.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.startAll = this.startAll.bind(this);
    //this.getList = this.getList.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.btnRefs = [];
    this.state = {
      links: [], 
      open: false,
      path: "D:\\Music",
      options: {
        path: "D:\\Music"
      }
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

  handleClose() { this.setState({ open: false }) };

  componentWillUnmount() {
    clipboard.stopWatching();
  }

  render() {
    var { links, options, path } = this.state
    return (
      <div style={{height: '100%'}}>
        <div className="navbar">
          <div className="appName">Youtube Downloader</div>
          <div className="buttons">
            <div><FaWindowClose onClick={() => ipcRenderer.send('closeWindow')}/></div>
            <div><FaWindowRestore onClick={() => ipcRenderer.send('resizeWindow')}/></div>
            <div><FaWindowMinimize onClick={() => ipcRenderer.send('minimizeWindow')}/></div>
          </div>
        </div>
        <div className="menu">
          <div className="btnOptions" onClick={() => { this.setState({ open: true }) }}>
            <IoIosOptions size={30}/>
            Options
          </div>
          <div className="btnDownload">
            <FaArrowDown size={30} onClick={this.startAll}/>
            Start all
          </div>
        </div>
        <div className="items">
          {links.length > 0 ? links.map((link, i) => {
            return <Listitem options={options} link={link} index={i} ref={this.btnRefs[i]} unmountMe={(index) => this.deleteLink(index)} key={link}/>
          }) : <div className="hint_text">Copy a youtube link</div>}
        </div>
        <Dialog 
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Options</DialogTitle>
          <DialogContent>
            <TextField 
              autoFocus
              margin="dense"
              id="path"
              label="Download path"
              type="text"
              value={path}
              onChange={(event) => this.setState({ path: event.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ path: options.path }); this.handleClose()}}>
              Close
            </Button>
            <Button onClick={() => { this.setState({ options: { path: this.state.path } }); this.handleClose() }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}