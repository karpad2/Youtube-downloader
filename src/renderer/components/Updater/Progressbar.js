import React, { Component } from 'react'
import './Progressbar.css';

export default class Progressbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var colors = this.props.colors;
    return (
      <div style={{backgroundColor: colors.background, border: `3px solid ${colors.background}`}} className="progress_container">
        <div style={{backgroundColor: colors.secondary, border: `1px solid ${colors.secondary}`, "width": this.props.percent + "%"}} className="progress">
          <div className="progress_text">{this.props.percent}%</div>
        </div>  
      </div>
    )
  }
}
