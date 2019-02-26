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
    //this.getList = this.getList.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.btnRefs = [];
    this.configPath = null;
    this.state = {
      links: [], 
      open: false,
      path: null,
      options: null
    }
  }

  saveConfig() {
    this.setState({ 
      options: { path: this.state.path } 
    });
    fs.writeFileSync(this.configPath, JSON.stringify(this.state.options), 'utf8');
    this.handleClose()
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
  handleClose() { this.setState({ open: false }) };

  componentDidMount() {
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
        link.forEach(data=>{
          if (data.includes('list'))
            ytpl(text, (err, list) => {
              if (err) throw err;
              console.log(list);
              list.items.forEach(link => {
                this.updateLinks(link.url_simple)
              })
            })
        })
        this.updateLinks(text);
      }
    }).startWatching();
  }

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