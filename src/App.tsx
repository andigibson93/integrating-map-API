import React from 'react';
import './App.css';
import {MapsPage} from './MapContainer';

class App extends React.Component<any, any> {
  render() {
    return (
      <div className="App">
         <MapsPage/>
      </div>
    );
  }
}

export default App;
