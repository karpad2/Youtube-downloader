import React, { Component } from 'react'
import './Progressbar.css';

export default class Progressbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="progress_container">
        <div className="progress" style={{"width": this.props.percent + "%"}}>
          <div className="progress_text">{this.props.percent}%</div>
        </div>  
      </div>
    )
  }
}
