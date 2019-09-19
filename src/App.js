import React, { useState } from 'react';
import Lorma, { getGeohash } from 'lorma_js';

import _ from 'lodash';

function App() {
  const [lorma, setLorma] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionUuid, setConnectionUuid] = useState(null);
  const [commands, setCommands] = useState([]);
  const [command, setCommand] = useState(null);

  const handleClick = () => {
    if (!lorma) return
    lorma.currentConnectionList().then(res => {
      setConnections(res.data)
    })
  }

  const handleClick2 = () => {
    if (!lorma) return
    lorma.runLaunch(connectionUuid, command)
  }

  const handleClick3 = async () => {
    const geohash = await getGeohash();
    const lorma = new Lorma(geohash);
    setLorma(lorma)
  }

  const handleConnectionChange = (event) => {
    setConnectionUuid(event.target.value)
    const cmds = _.find(connections, (conn) => {
      return conn.uuid === event.target.value
    })
    setCommands(cmds.launchCommands)
  }

  const handleCommandChange = (event) => {
    setCommand(event.target.value)
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleClick3}>Connect</button>
        <button onClick={handleClick}>Show Connection List</button>

        {/* eslint-disable no-unused-expressions */}
        <select onChange={handleConnectionChange}>
          <option value=''>{''}</option>
          {connections.length > 0 && (
            _.map(connections, (conn) => {
              return(
                <option key={conn.uuid} value={conn.uuid}>{conn.uuid}</option>
              )
            })
          )}
        </select>

        <select onChange={handleCommandChange}>
          <option value=''>{''}</option>
          {commands.length > 0 && (
            _.map(commands, (command) => {
              return(
                <option key={command} value={command}>{command}</option>
              )
            })
          )}
          {/* eslint-enable no-unused-expressions */}
        </select>

        <button onClick={handleClick2}>Execute</button>
      </header>
    </div>
  );
}

export default App;
