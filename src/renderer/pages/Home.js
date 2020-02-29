import React, { Component } from 'react';
import clipboard from 'electron-clipboard-extended';
import Listitem from '../components/Listitem/Listitem';
import { FaArrowDown, FaWindowClose, FaWindowRestore, FaWindowMinimize, FaTasks, FaFolder } from 'react-icons/fa';
import { MdClearAll } from 'react-icons/md';
import { IoIosOptions } from 'react-icons/io';
import './Home.css';
import ytpl from 'ytpl';
import { ipcRenderer } from 'electron';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	DialogActions,
	Button,
	MuiThemeProvider,
	Tabs,
	Tab,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Input
} from '@material-ui/core';
import fs from 'fs';
import Listitemfinished from '../components/Listitem/Listitemfinished';
const { dialog } = require('electron').remote;
import { style as style1 } from '../style/darkTheme';
import { style as style2 } from '../style/lightTheme';
import { dark, light } from '../style/colors';

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
		this.addOne = this.addOne.bind(this);
		this.addList = this.addList.bind(this);
		this.handleChooseClose = this.handleChooseClose.bind(this);
		this.checkNext = this.checkNext.bind(this);
		this.data = [];
		this.finished = [];
		this.queue = [];
		this.autoDownload = false;
		this.link = null;
		this.scrollBar = React.createRef();
		this.configPath = null;
		this.links = [];
		this.isLoading = false;
		this.state = {
			listLoading: false,
			bitrate: 192,
			theme: 0,
			numDown: 2,
			listNum: 10,
			filterNum: 1000,
			value: 0,
			data: [],
			finished: [],
			queue: [],
			open: false,
			choose: false,
			autoDownload: false,
			path: 'D:\\Music\\Probaasdasdasd',
			options: {
				path: 'D:\\Music\\Probaasdasdasd',
				bitrate: 192,
				theme: 0,
				numDown: 2,
				listNum: 10,
				filterNum: 1000
			}
		};
	}

	addOne() {
		var text = this.link;
		if (!this.data.some((e) => e.link === text)) this.addLink([ text ]);
		this.link = null;
		this.setState({ listLoading: false });
	}
	addList() {
		var text = this.link;
		var link = text.split('&');
		link.forEach((data) => {
			if (data.includes('list') || text.includes('channel'))
				ytpl(text, { limit: this.state.filterNum }, (err, list) => {
					if (err) {
						if (!this.data.some((e) => e.link === text)) this.addLink([ text ]);
					} else {
						var links = [];
						list.items.forEach((link) => {
							if (!this.queue.includes(link.url_simple) && !this.data.some((e) => e.link === link.url_simple))
								links = [ ...links, link.url_simple ];
						});
						this.addLink(links);
					}
					this.setState({ listLoading: false });
				});
		});
		this.link = null;
	}
	openFileDialog() {
		var options = {
			title: 'Change save location',
			defaultPath: this.state.options.path,
			properties: [ 'openDirectory' ]
		};
		dialog.showOpenDialog(options, (path) => {
			if (path[0] !== undefined) {
				this.setState({
					path: path[0],
					options: {
						path: path[0],
						bitrate: this.state.options.bitrate,
						theme: this.state.options.theme,
						numDown: this.state.options.numDown,
						listNum: this.state.options.listNum,
						filterNum: this.state.options.filterNum
					}
				});
			}
		});
	}
	handleChange = (event, value) => {
		this.setState({ value });
	};
	clearList() {
		if (this.state.value === 0) {
			var data = this.data.filter((item) => {
				return item.ref.current.state.isDownloading;
			});
			this.data = [ ...data ];
			this.queue = [];
			this.setState({ data: [ ...data ], queue: [] });
		} else if (this.state.value === 1) {
			this.finished = [];
			this.setState({ finished: [] });
		}
	}
	saveConfig(saved) {
		var options = {
			numDown: this.state.numDown,
			listNum: this.state.listNum,
			filterNum: this.state.filterNum,
			path: this.state.path,
			bitrate: this.state.bitrate,
			theme: this.state.theme
		};
		this.setState({
			options: options
		});
		fs.writeFileSync(this.configPath + 'config.json', JSON.stringify(options), 'utf8');
		this.handleClose(saved);
	}
	startAll() {
		this.autoDownload = !this.autoDownload;
		this.setState({ autoDownload: !this.state.autoDownload });
		if (this.autoDownload) {
			for (var i = 0; i < this.state.numDown; i++) {
				this.checkNext(i);
			}
		}
	}
	checkNext(i) {
		try {
			if (this.data[i] != undefined) {
			}
			var result = this.data[i].ref.current.isExists();
			if (result.length > 0) {
				if (result[0] != null) {
					this.data.splice(i, 1);
					if (this.queue[0] != undefined && this.data.length < this.state.listNum) {
						var newData = {
							ref: React.createRef(),
							link: this.queue[0]
						};
						this.queue.splice(0, 1);
						this.data = [ ...this.data, newData ];
					}
					var finished = {
						ref: React.createRef(),
						info: result[0],
						path: result[1]
					};
					if (!this.finished.some((e) => e.path === finished.path)) this.finished = [ ...this.finished, finished ];
					this.setState({
						queue: [ ...this.queue ],
						data: [ ...this.data ],
						finished: [ ...this.finished ]
					});
					if (i < this.data.length) this.checkNext(i);
				} else this.data[i].ref.current.doDownload();
			}
		} catch (error) {
			console.log(error);
		}
	}
	addLink(link) {
		this.queue = [ ...this.queue, ...link ];
		for (var i = 0; i < this.state.numDown; i++) {
			if (this.queue[0] != undefined && this.data.length < this.state.listNum) {
				var data = {
					ref: React.createRef(),
					link: this.queue[0]
				};
				this.queue.splice(0, 1);
				this.data = [ ...this.data, data ];
			}
		}
		this.setState({
			data: [ ...this.data ],
			queue: [ ...this.queue ]
		});
	}
	loadedInfo() {
		if (this.queue[0] != undefined && this.data.length < this.state.listNum) {
			var newData = {
				ref: React.createRef(),
				link: this.queue[0]
			};
			this.queue.splice(0, 1);
			this.data = [ ...this.data, newData ];
			this.setState({
				data: [ ...this.data ],
				queue: [ ...this.queue ]
			});
		}
		if (this.autoDownload) {
			for (var i = 0; i < this.state.numDown; i++) {
				this.checkNext(i);
			}
		}
	}
	deleteLink(key, info, path) {
		this.data.splice(key, 1);
		this.setState({ data: [ ...this.data ] });
		if (this.queue[0] != undefined && this.data.length < this.state.listNum) {
			var newData = {
				ref: React.createRef(),
				link: this.queue[0]
			};
			this.queue.splice(0, 1);
		}
		if (this.autoDownload) {
			var i = this.state.numDown - 1;
			if (i < this.data.length) this.checkNext(i);
		}
		if (newData != undefined) this.data = [ ...this.data, newData ];

		if (info != null) {
			if (!this.finished.some((file) => file.path === path)) {
				var finished = {
					ref: React.createRef(),
					info: info,
					path: path
				};
				this.finished = [ ...this.finished, finished ];
			}
		}
		this.setState({
			queue: [ ...this.queue ],
			data: [ ...this.data ],
			finished: [ ...this.finished ]
		});
		if (this.data.length === 0 && this.state.autoDownload === true) this.setState({ autoDownload: false });
	}
	deleteFile(key) {
		this.finished.splice(key, 1);
		this.setState({
			finished: [ ...this.finished ]
		});
	}
	handleClose(saved) {
		this.setState({ open: false });
		if (!saved) this.setState(this.state.options);
	}
	handleChooseClose() {
		this.setState({ choose: false, listLoading: false });
		this.link = null;
	}

	componentDidMount() {
		clipboard.clear();
		ipcRenderer.on('configPath', (event, arg) => {
			this.configPath = arg;
			var options = JSON.parse(fs.readFileSync(arg + 'config.json'), 'utf8');
			this.setState({
				options: {
					path: options.path,
					numDown: options.numDown != undefined ? options.numDown : this.state.numDown,
					listNum: options.listNum != undefined ? options.listNum : this.state.listNum,
					filterNum: options.filterNum != undefined ? options.filterNum : this.state.filterNum,
					bitrate: options.bitrate != undefined ? options.bitrate : this.state.bitrate,
					theme: options.theme != undefined ? options.theme : this.state.theme
				}
			});
			this.setState(this.state.options);
		});

		clipboard
			.on('text-changed', () => {
				var regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
				var text = clipboard.readText();
				var link = text.match(regExp);
				if (link != null) {
					this.setState({ listLoading: true });
					if (text.includes('list') || text.includes('channel')) {
						this.link = text;
						if (!text.includes('watch') && !text.includes('youtu.be')) {
							this.addList();
						} else {
							this.setState({ choose: true });
							ipcRenderer.send('window');
						}
					} else {
						if (!this.data.some((e) => e.link === text)) this.addLink([ text ]);
						this.setState({ listLoading: false });
					}
					clipboard.clear();
				}
			})
			.startWatching();
		this.scrollBar.current.addEventListener('scroll', () => {
			var node = this.scrollBar.current;
			if (
				node.scrollHeight - node.scrollTop === node.clientHeight &&
				this.data.length > this.state.listNum - 1 &&
				this.state.value !== 1
			) {
				for (var i = 0; i < this.state.numDown; i++) {
					if (this.queue[0] != undefined) {
						var data = {
							ref: React.createRef(),
							link: this.queue[0]
						};
						this.queue.splice(0, 1);
						this.data = [ ...this.data, data ];
						this.setState({
							data: [ ...this.data ],
							queue: [ ...this.queue ]
						});
					}
				}
			}
		});
	}

	render() {
		var { data, finished, options, path, value, theme, queue } = this.state;
		var onQueue = queue.length;
		var colors = theme === 0 ? dark : light;
		var style = theme === 0 ? style1 : style2;
		return (
			<div style={{ height: '100%' }}>
				<div className="navbar" style={{ backgroundColor: colors.background, color: colors.color }}>
					<div className="appName">Youtube Downloader</div>
					<div className="buttons">
						<div>
							<FaWindowClose onClick={() => ipcRenderer.send('closeWindow')} />
						</div>
						<div>
							<FaWindowRestore onClick={() => ipcRenderer.send('resizeWindow')} />
						</div>
						<div>
							<FaWindowMinimize onClick={() => ipcRenderer.send('minimizeWindow')} />
						</div>
					</div>
				</div>
				<div className="menu" style={{ backgroundColor: colors.background, color: colors.color }}>
					<div
						className="btnOptions"
						onClick={() => {
							this.setState({ open: true });
						}}
					>
						<IoIosOptions size={30} />
						Options
					</div>
					<div className="btnDownload">
						<FaArrowDown
							size={30}
							color={this.state.autoDownload ? colors.secondary : colors.color}
							onClick={this.startAll}
						/>
						Auto
					</div>
					<div className="btnClear">
						<MdClearAll className={this.state.listLoading ? 'loading' : ''} size={30} onClick={this.clearList} />
						{finished.length + ' / ' + (data.length + finished.length + onQueue)}
					</div>
					<div
						className="btnTabs"
						style={{
							backgroundColor: colors.background,
							color: colors.color,
							boxShadow: '0px 2px 1px 1px ' + colors.shadow
						}}
					>
						<MuiThemeProvider theme={style}>
							<Tabs value={this.state.value} onChange={this.handleChange}>
								<Tab icon={<FaTasks />} label="In progress" />
								<Tab icon={<FaFolder />} label="Downloaded" />
							</Tabs>
						</MuiThemeProvider>
					</div>
				</div>
				<div
					ref={this.scrollBar}
					style={{ backgroundColor: colors.background2, color: colors.color }}
					className={(options.theme === 1 ? 'lScroll' : 'dScroll') + ' items'}
				>
					{value === 1 &&
						finished.map((file, i) => {
							return (
								<Listitemfinished
									path={file.path}
									info={file.info}
									index={i}
									style={colors}
									ref={file.ref}
									unmountMe={(index) => this.deleteFile(index)}
									key={file.info.title}
								/>
							);
						})}
					{data.map((link, i) => {
						return (
							<Listitem
								display={value === 1 ? 'none' : 'block'}
								options={options}
								link={link.link}
								index={i}
								theme={theme}
								style={colors}
								ref={link.ref}
								loaded={(index) => {
									this.loadedInfo(index);
								}}
								unmountMe={(index, info, path) => {
									this.deleteLink(index, info, path);
								}}
								key={link.link}
							/>
						);
					})}
					{data.length == 0 && value === 0 && <div className="hint_text">Copy a youtube link</div>}
					{finished.length == 0 && value === 1 && <div className="hint_text">No file downloaded</div>}
				</div>
				<MuiThemeProvider theme={style}>
					<Dialog
						open={this.state.choose}
						onClose={this.handleChooseClose}
						maxWidth="sm"
						aria-labelledby="choose-dialog-title"
					>
						<DialogTitle id="choose-dialog-title">Download</DialogTitle>
						<DialogActions>
							<Button
								onClick={() => {
									this.addOne();
									this.handleChooseClose();
								}}
							>
								Only firts
							</Button>
							<Button
								onClick={() => {
									this.addList();
									this.handleChooseClose();
								}}
							>
								Playlist
							</Button>
						</DialogActions>
					</Dialog>
					<Dialog
						open={this.state.open}
						onClose={() => this.handleClose(false)}
						fullWidth
						maxWidth="sm"
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">Options</DialogTitle>
						<DialogContent>
							<div className="inputContainer">
								<TextField
									margin="dense"
									id="path"
									label="Download path"
									InputProps={{
										style: {
											paddingRight: '20px',
											width: '100%'
										}
									}}
									type="text"
									value={path}
									onChange={(event) => this.setState({ path: event.target.value })}
								/>
								<div
									className={'openFileDialog ' + (this.state.theme === 1 ? 'lDialog' : 'dDialog')}
									onClick={this.openFileDialog}
								>
									<FaFolder />
								</div>
								<div style={{ display: 'flex', marginTop: '30px' }}>
									<div style={{ flex: 1, borderRight: `1px solid ${colors.color}` }}>
										<TextField
											id="first"
											width="100px"
											label="Parallel download number"
											value={this.state.numDown}
											onChange={(event) => this.setState({ numDown: event.target.value })}
											type="number"
											InputLabelProps={{
												shrink: true
											}}
											margin="normal"
										/>
										<TextField
											id="second"
											width="100px"
											label="Visible media number"
											value={this.state.listNum}
											onChange={(event) => this.setState({ listNum: event.target.value })}
											type="number"
											InputLabelProps={{
												shrink: true
											}}
											margin="normal"
										/>
										<TextField
											id="third"
											width="100px"
											label="Youtube playlist limit"
											value={this.state.filterNum}
											onChange={(event) => this.setState({ filterNum: event.target.value })}
											type="number"
											InputLabelProps={{
												shrink: true
											}}
											margin="normal"
										/>
									</div>
									<div style={{ flex: 1, paddingLeft: '20px', paddingTop: '16px' }}>
										<FormControl>
											<InputLabel shrink htmlFor="bitrate-label-placeholder">
												Audio bitrate
											</InputLabel>
											<Select
												value={this.state.bitrate}
												onChange={(event) => this.setState({ bitrate: event.target.value })}
												input={<Input name="bitrate" id="bitrate-label-placeholder" />}
												displayEmpty
												name="bitrate"
											>
												<MenuItem value={192}>192</MenuItem>
												<MenuItem value={256}>256</MenuItem>
												<MenuItem value={320}>320</MenuItem>
											</Select>
										</FormControl>
										<br />
										<FormControl>
											<InputLabel shrink htmlFor="theme-label-placeholder">
												Theme
											</InputLabel>
											<Select
												value={this.state.theme}
												onChange={(event) => this.setState({ theme: event.target.value })}
												input={<Input name="theme" id="theme-label-placeholder" />}
												displayEmpty
												name="theme"
											>
												<MenuItem value={0}>Dark</MenuItem>
												<MenuItem value={1}>Light</MenuItem>
											</Select>
										</FormControl>
									</div>
								</div>
							</div>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={() => {
									this.setState(options);
									this.handleClose(false);
								}}
							>
								Close
							</Button>
							<Button onClick={() => this.saveConfig(true)}>Save</Button>
						</DialogActions>
					</Dialog>
				</MuiThemeProvider>
			</div>
		);
	}
}
