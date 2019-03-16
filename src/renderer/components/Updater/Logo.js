import React, { Component } from 'react'
import './Logo.css'

export default class Logo extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="sk-cube-grid">
        <div className="sk-cube sk-cube1" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube2" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube3" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube4" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube5" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube6" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube7" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube8" style={{backgroundColor: this.props.color}}></div>
        <div className="sk-cube sk-cube9" style={{backgroundColor: this.props.color}}></div>
      </div>
    )
  }
}
