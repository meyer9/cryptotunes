import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Notes from './Vex';
import Vex from 'vexflow';
const {Accidental, StaveNote} = Vex.Flow;

function measureToNotes() {
  return [new StaveNote({
    keys: ["c/4"],
    duration: "w",
  })]
}

const chord1 = [new StaveNote({
  keys: ["c/4"],
  duration: "q",
}), new StaveNote({
  keys: ["c/4"],
  duration: "q",
})];

class App extends Component {
  render() {
    return (
      <Notes chord={measureToNotes()} />
    );
  }
}

export default App;
