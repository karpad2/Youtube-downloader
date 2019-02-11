import React, { Component } from 'react'
import clipboard from 'electron-clipboard-extended'

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.updateLinks = this.updateLinks.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.state = {
      links: []
    }
  }

  updateLinks(link) {
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
  }

  componentDidMount() {
    clipboard.on('text-changed', () => {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var text = clipboard.readText()
      var link = text.match(regExp);
      if (link != null)
        this.updateLinks(text);
    }).startWatching();
  }

  componentWillUnmount() {
    clipboard.stopWatching();
  }

  render() {
    var { links } = this.state
    //console.log(links);
    return (
      <div>
        {links.map((link, index) => {
          return <div onClick={() => this.deleteLink(index)} key={index}>{link}</div>
        })}
      </div>
    )
  }
}