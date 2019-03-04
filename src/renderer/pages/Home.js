import React, { Component } from 'react'
import clipboard from 'electron-clipboard-extended'
import Listitem from '../components/Listitem/Listitem'
import { FaArrowDown, FaWindowClose, FaWindowRestore, FaWindowMinimize } from 'react-icons/fa'
import { IoIosOptions } from 'react-icons/io'
import './Home.css'
import ytpl from 'ytpl'
import { ipcRenderer } from 'electron'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import fs from 'fs';
import Listitemfinished from '../components/Listitem/Listitemfinished';

//TODO: Add playlist
//TODO: Modal option window

const style = createMuiTheme({
  overrides: {
    MuiDialog: {
      paper: {
        backgroundColor: '#1c1f23'
      },
      root: {
        color: '#a8a8a8'
      }
    },
    MuiInput: {
      root: {
        color: '#a8a8a8',
        '&$underline': {
          '&:before': {
            borderBottomColor: '#a8a8a8'
          },
          '&:after': {
            borderBottomColor: '#eba576'
          },
          '&&&&:hover:before': {
            borderBottom: '1px solid #eba576'
          }
        }
      },
    },
    MuiButton: {
      text: {
        color: '#a8a8a8'
      }
    },
    MuiInputLabel: {
      root: {
        color: '#a8a8a8',
        "&$focused": {
          "&$focused": {
            "color": "#eba576"
          }
        }
      },
    },
    MuiTypography: {
      h6: {
        color: '#a8a8a8'
      }
    }
  },
  typography: {
    "fontFamily": 'Iceland',
    "fontSize": 18,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500,
    useNextVariants: true
  },
});

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.updateLinks = this.updateLinks.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.startAll = this.startAll.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.numDown = 3;
    this.filterNum = 20;
    this.configPath = null;
    this.state = {
      data: [],
      finished: [],
      open: false,
      autoDownload: false,
      path: "D:\\Music\\Dev",
      options: {
        path: "D:\\Music\\Dev"
      }
    }
  }

  saveConfig() {
    var options = {
      path: this.state.path
    };
    this.setState({ 
      options: options
    });    
    fs.writeFileSync(this.configPath, JSON.stringify(options), 'utf8');
    this.handleClose()
  }
  startAll() {
    this.setState({autoDownload: !this.state.autoDownload})
    for (var i = 0; i < this.numDown; i++)
      if (this.state.data[i] != null)
        this.state.data[i].ref.current.doDownload();
  }
  updateLinks(link) {
    if (!this.state.data.some(e => e.link === link)) {
      var data = {
        ref: React.createRef(),
        link: link
      }
      this.setState({
        data: [...this.state.data, data]
      })
    }
  }
  deleteLink(key, info, path) {
    var { data } = this.state;
    if (this.state.autoDownload)
      for (var i = 0; i <= this.numDown; i++)
        if (this.state.data[i] != null && !this.state.data[i].ref.current.state.isDownloading)
          this.state.data[i].ref.current.doDownload();
    var arr = [...data];
    arr.splice(key, 1);
    this.setState({
      data: [...arr]
    })
    if (info != null) {
      var finished = {
        ref: React.createRef(),
        info: info,
        path: path
      }
      this.setState({ finished: [...this.state.finished, finished] })
    }
  }
  deleteFile(key) {
    var arr = [...this.state.finished];
    arr.splice(key, 1);
    this.setState({
      finished: [...arr]
    })
  }
  handleClose() { this.setState({ open: false }) };

  componentDidMount() {
    clipboard.clear();
    ipcRenderer.on('configPath', (event, arg) => {
      this.configPath = arg;
      var options = JSON.parse(fs.readFileSync(arg), 'utf8');
      this.setState({
        path: options.path,
        options: options
      })
    })
    clipboard.on('text-changed', () => {
      var regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
      var text = clipboard.readText()
      var link = text.match(regExp);
      if (link != null) {
        link = text.split('&');
        if (text.includes("list") || text.includes("channel")) {
          link.forEach(data=>{
            if (data.includes('list') || text.includes("channel"))
              ytpl(text, {limit: this.filterNum}, (err, list) => {
                if (err) throw err;
                console.log(list);
                list.items.forEach(link => {
                  this.updateLinks(link.url_simple)
                })
              })
          })
        }
        else this.updateLinks(text);
        clipboard.clear();
      }
    }).startWatching();
  }

  componentWillUnmount() {
    clipboard.stopWatching();
  }

  render() {
    var { data, finished, options, path } = this.state
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
            <FaArrowDown size={30} color={this.state.autoDownload ? '#eba576' : '#a8a8a8'} onClick={this.startAll}/>
            Auto
          </div>
        </div>
        <div className="items">
          {data.map((link, i) => {
            return <Listitem options={options} link={link.link} index={i} ref={link.ref} unmountMe={(index, info, path) => {this.deleteLink(index, info, path)}} key={link.link}/>
          })}
          {finished.map((file, i) => {
            return <Listitemfinished path={file.path} info={file.info} index={i} ref={file.ref} unmountMe={(index) => this.deleteFile(index)} key={file.info.title}/>
          })}
          {(data.length == 0 && finished.length == 0) && <div className="hint_text">Copy a youtube link</div>}
        </div>
        <MuiThemeProvider theme={style}>
          <Dialog 
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            >
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
              <Button onClick={this.saveConfig}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </div>
    )
  }
}