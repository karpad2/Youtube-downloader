import React, { Component } from 'react'
import './Loading.css'

export default class Loading extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="spinner" style={{backgroundColor: this.props.color}}></div>
    )
  }
}
