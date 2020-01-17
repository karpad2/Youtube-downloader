import React, { Component } from 'react';
var ytdl = require('ytdl-core');
import fs from 'fs';
import './Listitem.css';
import Loading from './Loading';
import ProgressBar from './progressBar';
import {
	FaMicrophone,
	FaUser,
	FaTimesCircle,
	FaPauseCircle,
	FaPlayCircle,
	FaInfoCircle
} from 'react-icons/fa';
import ffmpegPath from 'ffmpeg-static-electron';
import ffmpeg from 'fluent-ffmpeg';
var request = require('request');
const ID3Writer = require('browser-id3-writer');

const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) ffmpeg.setFfmpegPath(ffmpegPath.path);
else
	ffmpeg.setFfmpegPath(
		ffmpegPath.path.replace('app.asar', 'app.asar.unpacked')
	);

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
		this.handleClose = this.handleClose.bind(this);
		this.isExists = this.isExists.bind(this);
		this.startDownload = this.startDownload.bind(this);
		this.audio = null;
		this.video = null;
		this.convert = null;
		this.path = this.props.options.path;
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
		};
	}

	isExists() {
		if (!this.state.isDownloading && this.state.info != null) {
			var { info } = this.state;
			if (process.platform === 'win32')
				var file = this.path + '\\' + info.title.replace(/[*'/":<>?\\|]/g, '_');
			else
				var file = this.path + '/' + info.title.replace(/[*'/":<>?\\|]/g, '_');
			if (this.state.selectedFormat === 'mp3') {
				if (fs.existsSync(file + '.mp3')) return [ info, file + '.mp3' ];
				else return [ null, null ];
			} else {
				if (fs.existsSync(file + '.mp4')) return [ info, file + '.mp4' ];
				else return [ null, null ];
			}
		} else return [];
	}
	handleClose() {
		this.setState({ open: false });
	}
	chooseFormat(event) {
		this.setState({ selectedFormat: event.target.value });
	}
	toHHMMSS(secs) {
		var sec_num = parseInt(secs, 10);
		var hours = Math.floor(sec_num / 3600) % 24;
		var minutes = Math.floor(sec_num / 60) % 60;
		var seconds = sec_num % 60;
		return [ hours, minutes, seconds ]
			.map((v) => (v < 10 ? '0' + v : v))
			.filter((v, i) => v !== '00' || i > 0)
			.join(':');
	}
	loaded() {
		this.props.loaded(this.props.index);
	}
	close() {
		this.setState({ isDownloading: false }, () => {
			if (this.convert != null) {
				this.convert.kill();
				this.convert = null;
			}
			if (this.audio != null) {
				this.audio.pause();
				this.audio.destroy((err) => console.log(err));
				this.audio = null;
			}
			if (this.video != null) {
				this.video.pause();
				this.video.destroy((err) => console.log(err));
				this.video = null;
			}
			this.props.unmountMe(this.props.index);
		});
	}
	destroy(path) {
		this.props.unmountMe(this.props.index, this.state.info, path);
	}
	mouseHover() {
		if (!this.state.isHovering) this.setState({ isHovering: true });
	}
	mouseLeave() {
		this.setState({ isHovering: false });
	}
	doDownload() {
		if (this.state.info != null) {
			if (!this.state.isDownloading) {
				this.setState({ isDownloading: true });
				if (this.state.percentA > 0 || this.state.percentV > 0) {
					if (this.state.selectedFormat == 'mp3') {
						this.audio.resume();
					} else {
						if (this.video != null) this.video.resume();
						else this.audio.resume();
					}
				} else {
					this.startDownload();
				}
			}
		}
	}
	startDownload() {
		if (this.audio != null) this.audio.destroy();
		if (this.video != null) this.video.destroy();
		if (this.convert != null) this.convert.kill();

		var options = {
			quality: 'highest',
			filter: 'audio',
			highWaterMark: 0
		};
		var { selectedFormat } = this.state;
		var path = this.props.options.path;
		var audioBitrate = this.props.options.bitrate;
		if (process.platform === 'win32') {
			if (!fs.existsSync(path)) {
				path = path.split('\\');
				for (var i = 0; i < path.length; i++) {
					var dir = path.slice(0, i + 1).join('\\');
					if (!fs.existsSync(dir)) fs.mkdirSync(dir);
				}
			} else path = path.split('\\');
			path = path.join('\\') + '\\';
		} else {
			if (!fs.existsSync(path)) {
				path = path.split('/');
				for (var i = 1; i < path.length; i++) {
					var dir = path.slice(0, i + 1).join('/');
					if (!fs.existsSync(dir)) fs.mkdirSync(dir);
				}
			} else path = path.split('/');
			path = path.join('/') + '/';
		}
		var file = (this.path =
			path + this.state.info.title.replace(/[*'/":<>?\\|]/g, '_'));
		var albumCover = file + '.jpeg';
		if (!fs.existsSync(albumCover)) {
			var thumb = this.state.info.player_response.videoDetails.thumbnail
				.thumbnails;
			request
				.get(thumb[thumb.length - 1].url)
				.pipe(fs.createWriteStream(albumCover));
		}
		if (selectedFormat == 'mp3') {
			if (!fs.existsSync(file + '.mp3')) {
				this.audio = ytdl(this.state.link, options)
					.on('progress', (length, downloaded, totallength) => {
						if (!this.state.isDownloading && this.convert != null)
							this.audio.pause();
						this.setState({
							percentA: Math.round(downloaded / totallength * 100)
						});
					})
					.on('error', (err) => console.log(err));
				this.convert = ffmpeg(this.audio)
					.toFormat('mp3')
					.audioBitrate(audioBitrate.toString())
					.save(file + '_downloading.mp3')
					.on('error', (err) => {
						if (this.state.isDownloading) this.startDownload();
					})
					.on('end', () => {
						this.savedPath = file + '.mp3';
						const writer = new ID3Writer(
							fs.readFileSync(file + '_downloading.mp3')
						);
						var title = this.state.info.player_response.videoDetails.title.split(
							'-'
						);
						writer
							.setFrame('TIT2', title[1] || '')
							.setFrame('TPE1', [ title[0] ])
							.setFrame('APIC', {
								type: 3,
								data: fs.readFileSync(albumCover),
								description: 'Cover'
							});
						writer.addTag();
						fs.writeFileSync(this.savedPath, Buffer.from(writer.arrayBuffer));
						fs.unlinkSync(file + '_downloading.mp3');
						fs.unlinkSync(albumCover);
						this.destroy(file + '.mp3');
					});
			} else this.destroy(file + '.mp3');
		} else {
			if (!fs.existsSync(file + '.mp4')) {
				this.audio = ytdl(this.state.link, options)
					.on('progress', (length, downloaded, totallength) => {
						if (!this.state.isDownloading && this.convert != null)
							this.audio.pause();
						this.setState({
							percentA: Math.round(downloaded / totallength * 100)
						});
					})
					.on('error', () => this.startDownload());
				this.convert = ffmpeg(this.audio)
					.toFormat('mp3')
					.save(file + '_audio.mp3')
					.on('end', () => {
						options = {
							filter: (format) =>
								(format.quality_label || format.resolution) === selectedFormat
						};
						this.video = ytdl(this.state.link, options)
							.on('progress', (length, downloaded, totallength) => {
								if (!this.state.isDownloading) this.video.pause();
								this.setState({
									percentV: Math.round(downloaded / totallength * 100)
								});
							})
							.on('error', () => this.startDownload());
						this.convert = ffmpeg()
							.input(this.video)
							.videoCodec('copy')
							.input(file + '_audio.mp3')
							.audioCodec('copy')
							.save(file + '.mp4')
							.on('end', () => {
								fs.unlink(file + '_audio.mp3', (err) => {
									if (err) throw err;
								});
								this.savedPath = file + '.mp4';
								this.destroy(file + '.mp4');
							});
					});
			} else this.destroy(file + '.mp4');
		}
	}
	pause() {
		this.setState({ isDownloading: false });
		if (this.state.selectedFormat == 'mp3') {
			this.audio.pause();
		} else {
			if (this.video != null) this.video.pause();
			else this.audio.pause();
		}
	}

	componentWillMount() {
		var { link } = this.state;
		ytdl.getInfo(link, (err, info) => {
			if (err) this.close();
			else {
				console.log(info);
				this.loaded();
				var allformats = ytdl.filterFormats(info.formats, 'videoonly');
				var formats = [];
				allformats.forEach((format) => {
					if (!JSON.stringify(formats).includes(format.quality_label))
						formats.push(format);
				});
				//<------------------------------------------------------------------------------------------------------------>
				console.log(formats);
				//<------------------------------------------------------------------------------------------------------------>
				this.setState({
					info: info,
					time: this.toHHMMSS(
						parseInt(info.player_response.videoDetails.lengthSeconds)
					),
					videoformats: formats
				});
			}
		});
	}

	componentWillUnmount() {
		if (this.state.percentA > 0 || this.state.percentV > 0) {
			if (this.state.percentA != 100) {
				if (this.state.selectedFormat != 'mp3')
					fs.unlink(this.path + '_audio.mp3', (err) => console.log(err));
				else fs.unlink(this.path + '.mp3', (err) => console.log(err));
			} else if (this.state.percentV != 100) {
				if (this.state.selectedFormat != 'mp3') {
					fs.unlink(this.path + '_audio.mp3', (err) => console.log(err));
					fs.unlink(this.path + '.mp4', (err) => console.log(err));
				}
			}
		}
	}

	render() {
		var {
			info,
			isHovering,
			isDownloading,
			percentA,
			percentV,
			time,
			videoformats
		} = this.state;
		var title, time;
		if (info != null) {
			title = info.player_response.videoDetails.title.split('-');
			if (title[1] != undefined) title[1] = title[1].trim();
			var thumbs = info.player_response.videoDetails.thumbnail.thumbnails;
		}
		var colors = this.props.style;
		//console.log(videoformats);
		return (
			<div
				style={{
					display: this.props.display,
					backgroundColor: colors.background,
					color: colors.color,
					boxShadow: '0px 0px 2px 2px ' + colors.shadow
				}}
				className="container"
			>
				{info == null ? (
					<Loading color={colors.secondary} />
				) : (
					<div
						onMouseOver={this.mouseHover}
						onMouseLeave={this.mouseLeave}
						className="item_container"
					>
						{isHovering && (
							<div
								onClick={this.close}
								style={{ color: colors.color }}
								className="close"
							>
								<FaTimesCircle />
							</div>
						)}
						<div className="img_container">
							<img src={thumbs[thumbs.length - 1].url} alt="img" />
							<div className="img_time">{time}</div>
						</div>
						<div className="info">
							{title[1] != undefined && (
								<div className="info_div">
									<FaMicrophone />
									<div>{title[1]}</div>
								</div>
							)}
							{title[1] != undefined && <br />}
							<div className="info_div">
								<FaUser />
								<div>{title[0]}</div>
							</div>
							<br />
							<div
								className={
									'radio-group ' +
									(this.props.theme === 1 ? 'linput' : 'dinput')
								}
								style={{
									backgroundColor: colors.background,
									boxShadow: '0 0 2px 2px ' + colors.shadow
								}}
							>
								<div>
									<input
										type="radio"
										onClick={this.chooseFormat}
										value={'mp3'}
										name={`${this.props.index}type`}
										className="btnRadio"
										id={`${this.props.index}option`}
										defaultChecked
									/>
									<label htmlFor={`${this.props.index}option`}>MP3</label>
								</div>
								{videoformats.map((format, i) => {
									return (
										<div key={i}>
											<input
												type="radio"
												onClick={this.chooseFormat}
												value={format.qualityLabel || format.resolution}
												name={`${this.props.index}type`}
												className="btnRadio"
												id={`${this.props.index}option${i}`}
											/>
											<label htmlFor={`${this.props.index}option${i}`}>
												{format.qualityLabel || format.resolution}
											</label>
										</div>
									);
								})}
							</div>
						</div>
						<div
							className="progressBar"
							style={
								percentA == 0 && isDownloading ? (
									{
										animation: 'rotating 1s ease-in-out infinite',
										boxShadow: '0 0 5px 5px ' + colors.shadow
									}
								) : (
									{ boxShadow: '0 0 5px 5px ' + colors.shadow }
								)
							}
						>
							<ProgressBar
								strokeWidth="5"
								sqSize="45"
								color={colors.secondary}
								percentage={percentA == 0 && isDownloading ? 5 : percentA}
							/>
						</div>
						<div
							className="progressBar"
							style={
								percentV == 0 && isDownloading ? (
									{
										animation: 'rotating 1s ease-in-out infinite',
										boxShadow: '0 0 5px 5px ' + colors.shadow
									}
								) : (
									{ boxShadow: '0 0 5px 5px ' + colors.shadow }
								)
							}
						>
							<ProgressBar
								strokeWidth="5"
								sqSize="60"
								color={colors.secondary}
								percentage={
									percentV == 0 && isDownloading && percentA == 100 ? (
										5
									) : (
										percentV
									)
								}
							/>
						</div>
						{isDownloading ? (
							<div
								className="btnIcon"
								style={{
									backgroundColor: colors.secondary,
									color: colors.background
								}}
								onClick={this.pause}
							>
								<FaPauseCircle size={20} />
							</div>
						) : (
							<div
								className="btnIcon download"
								style={{
									backgroundColor: colors.secondary,
									color: colors.background
								}}
								onClick={this.doDownload}
							>
								<FaPlayCircle size={20} />
							</div>
						)}
					</div>
				)}
			</div>
		);
	}
}
