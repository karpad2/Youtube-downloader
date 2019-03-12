import React, { Component, memo } from 'react'
import clipboard from 'electron-clipboard-extended'
import Listitem from '../components/Listitem/Listitem'
import { 
  FaArrowDown, 
  FaWindowClose, 
  FaWindowRestore, 
  FaWindowMinimize,
  FaTasks,
  FaFolder
} from 'react-icons/fa'
import {MdClearAll, MdContactMail} from 'react-icons/md'
import { IoIosOptions } from 'react-icons/io'
import './Home.css'
import ytpl from 'ytpl'
import { ipcRenderer } from 'electron'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  DialogActions, 
  Button, 
  MuiThemeProvider, 
  createMuiTheme,
  Tabs, 
  Tab
} from '@material-ui/core';
import fs from 'fs';
import Listitemfinished from '../components/Listitem/Listitemfinished';
const {dialog} = require('electron').remote;

const tabStyle = createMuiTheme({
  overrides: {
    MuiTab: {
      root: {
        '&:hover': {
          color: '#eba576',
          opacity: 1,
        },
        '&$selected': {
          color: '#eba576'
        },
        '&:focus': {
          color: '#eba576',
        },
      },
    },
    MuiTabs: {
      root: {
        borderRadius: '20px',
      },
      indicator: {
        backgroundColor: '#eba576',
        borderRadius: '20px'
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
})
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
        },
        display: 'block'
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
    this.deleteLink = this.deleteLink.bind(this);
    this.startAll = this.startAll.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.addLink = this.addLink.bind(this);
    this.clearList = this.clearList.bind(this);
    this.loadedInfo = this.loadedInfo.bind(this);
    this.openFileDialog = this.openFileDialog.bind(this);
    this.scrollBar = React.createRef();
    this.configPath = null;
    this.links = [];
    this.isLoading = false;
    this.state = {
      numDown: 5,
      listNum: 20,
      filterNum: 1000,
      value: 0,
      data: [],
      finished: [],
      queue: [],
      open: false,
      autoDownload: false,
      path: "/home/kornel/Music/dev",
      options: {
        path: "/home/kornel/Music/dev"
      }
    }
  }

  openFileDialog() {
    var options = {
      title: "Change save location",
      defaultPath: this.state.options.path,
      properties:["openDirectory"]
    }
    dialog.showOpenDialog(options, (path) => {
      if (path[0] !== undefined) {
        this.setState({
          path: path[0],
          options: {
            path: path[0]
          }
        })
      }
    });
  }
  handleChange = (event, value) => {
    this.setState({ value });
  }
  clearList() {
    if (this.state.value === 0) {
      var data = this.state.data.filter(item => {
        return item.ref.current.state.isDownloading
      })
      this.setState({data: [...data]})
    }
    else if (this.state.value === 1)
      this.setState({finished: []})
  }
  saveConfig() {
    var options = {
      numDown: this.state.numDown,
      listNum: this.state.listNum,
      filterNum: this.state.filterNum,
      path: this.state.path
    };
    this.setState({
      options: { 
        path: options.path
      }
    });    
    fs.writeFileSync(this.configPath + "config.json", JSON.stringify(options), 'utf8');
    this.handleClose()
  }
  startAll() {
    this.setState({autoDownload: !this.state.autoDownload})
    for (var i = 0; i < this.state.numDown; i++)
      if (this.state.data[i] != null)
        this.state.data[i].ref.current.doDownload();
  }
  addLink() {
    var links = [...this.state.queue];
    for (var i = 0; i < this.state.numDown; i++) {
      if (links[0] != undefined && this.state.data.length < this.state.listNum) {
        var data = {
          ref: React.createRef(),
          link: links[0]
        }
        links.splice(0, 1);
        this.setState({
          data: [...this.state.data, data],
          queue: [...links]
        })
      }
    }
  }
  loadedInfo() {
    if (this.state.queue[0] != undefined && this.state.data.length < this.state.listNum) {
      var links = [...this.state.queue]
      var data = {
        ref: React.createRef(),
        link: links[0]
      }
      links.splice(0, 1);
      this.setState({
        data: [...this.state.data, data],
        queue: [...links]
      })
    }
  }
  deleteLink(key, info, path) {
    var { data } = this.state;
    if (this.state.autoDownload)
      for (var i = 0; i <= this.state.numDown; i++)
        if (data[i] != undefined && !data[i].ref.current.state.isDownloading)
          data[i].ref.current.doDownload();
    var arr = [...data];
    if (this.state.queue.length != 0 && data.length < this.state.listNum) {
      var links = [...this.state.queue]
      var data = {
        ref: React.createRef(),
        link: links[0]
      }
      links.splice(0, 1);
      this.setState({queue: [...links]})
      arr = [...arr, data];
    }
    arr.splice(key, 1);
    this.setState({data: [...arr]})
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
      var options = JSON.parse(fs.readFileSync(arg + "config.json"), 'utf8');
      this.setState({
        path: options.path,
        numDown: options.numDown != undefined ? options.numDown : this.state.numDown,
        listNum: options.listNum != undefined ? options.listNum : this.state.listNum,
        filterNum: options.filterNum != undefined ? options.filterNum : this.state.filterNum,
        options: {
          path: options.path
        }
      })
      this.addLink();
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
              ytpl(text, {limit: this.state.filterNum}, (err, list) => {
                if (err) this.updateLinks(text);
                else {
                  var links = [];
                  //console.log(list);
                  list.items.forEach(link => {
                    if (!this.state.queue.includes(link.url_simple))
                      links = [...links, link.url_simple]
                  })
                  this.setState({queue: [...this.state.queue, ...links]})
                  this.addLink();
                }
              })
          })
        }
        else {
          if (!this.state.data.some(e => e.link === text))
            this.setState({queue: [...this.state.queue, text]})
          this.addLink();
        }
        clipboard.clear();
      }
    }).startWatching();
    this.scrollBar.current.addEventListener('scroll', ()=> {
      var node = this.scrollBar.current;
      if (node.scrollHeight - node.scrollTop === node.clientHeight && this.state.data.length > this.state.listNum - 1 && this.state.value !== 1) {
        for (var i = 0; i < this.state.numDown; i++) {
          if (this.state.queue[0] != undefined) {
            var links = [...this.state.queue]
            var data = {
              ref: React.createRef(),
              link: links[0]
            }
            links.splice(0, 1);
            this.setState({
              data: [...this.state.data, data],
              queue: [...links]
            })
          }
        }
      }    
    })
  }

  render() {
    var { data, finished, options, path } = this.state
    var onQueue = this.state.queue.length;
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
          <div className="btnClear">
            <MdClearAll size={30} onClick={this.clearList}/>
            {finished.length + " / " + (data.length + finished.length + onQueue)}
          </div>
          <div className="btnTabs">
            <MuiThemeProvider theme={tabStyle}>
              <Tabs value={this.state.value} onChange={this.handleChange}>
                <Tab icon={<FaTasks />} label="In progress" />
                <Tab icon={<FaFolder />} label="Downloaded" />
              </Tabs>
            </MuiThemeProvider>
          </div>
        </div>
        <div ref={this.scrollBar} className="items">
        {
          this.state.value === 1 &&
          finished.map((file, i) => {
            return( 
              <Listitemfinished 
                path={file.path} 
                info={file.info} 
                index={i} 
                ref={file.ref} 
                unmountMe={(index) => this.deleteFile(index)} 
                key={file.info.title}/>
            )
          })
        }
        {
          data.map((link, i) => {
            return (
              <Listitem 
                display={this.state.value === 1 ? 'none' : 'block'}
                options={options} 
                link={link.link} 
                index={i} 
                ref={link.ref}
                loaded={(index) => {this.loadedInfo(index)}}
                unmountMe={(index, info, path) => {this.deleteLink(index, info, path)}} 
                key={link.link}/>)
          })}
        {(data.length == 0 && this.state.value === 0) && <div className="hint_text">Copy a youtube link</div>}
        {(finished.length == 0 && this.state.value === 1) && <div className="hint_text">No file downloaded</div>}
        </div>
        <MuiThemeProvider theme={style}>
          <Dialog 
            open={this.state.open}
            onClose={this.handleClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="form-dialog-title"
            >
            <DialogTitle id="form-dialog-title">Options</DialogTitle>
            <DialogContent>
              <div className="inputContainer">
                <TextField 
                  autoFocus
                  fullWidth
                  margin="dense"
                  id="path"
                  label="Download path"
                  InputProps={{
                    style:{
                      paddingRight: '20px'
                  }}}
                  type="text"
                  value={path}
                  onChange={(event) => this.setState({ path: event.target.value })}
                />
                <div className="openFileDialog" onClick={this.openFileDialog}><FaFolder /></div>
                <TextField
                  id="standard-number"
                  label="Parallel download number"
                  value={this.state.numDown}
                  onChange={(event)=>this.setState({numDown: event.target.value})}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
                <TextField
                  id="standard-number"
                  label="Visible item number"
                  value={this.state.listNum}
                  onChange={(event)=>this.setState({listNum: event.target.value})}                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
                <TextField
                  id="standard-number"
                  label="Youtube playlist limit"
                  value={this.state.filterNum}
                  onChange={(event)=>this.setState({filterNum: event.target.value})}                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
              </div>
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