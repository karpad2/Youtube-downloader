import React, { Component } from 'react'
import clipboard from 'electron-clipboard-extended'

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.updateLinks = this.updateLinks.bind(this);
    this.state = {
      links: []
    }
  }

  updateLinks(link) {
    this.setState({
      links: [...this.state.links, link]
    })
  }

  componentDidMount() {
    clipboard.on('text-changed', () => {
      this.updateLinks(clipboard.readText());
    }).startWatching();
  }

  render() {
    var { links } = this.state
    console.log(links);
    return (
      <div>
        {links.map((link, index) => {
          return <div key={index}>{link}</div>
        })}
      </div>
    )
  }
}