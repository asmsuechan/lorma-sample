import React, { useState, useEffect } from 'react';
import Rowma, { getGeohash } from 'rowma_js';
import ReactNipple from 'react-nipple';
import 'react-nipple/lib/styles.css';

import _ from 'lodash';

function App() {
  const [rowma, setRowma] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionUuid, setConnectionUuid] = useState(null);
  const [commands, setCommands] = useState([]);
  const [command, setCommand] = useState(null);
  const [socket, setSocket] = useState(null);
  const [joystick, setJoystick] = useState(null);
  const [robot, setRobot] = useState(null);
  const [rosnode, setRosnode] = useState(null);
  const [rosrunArgs, setRosrunArgs] = useState('');
  const [rosrunCommand, setRosrunCommand] = useState(null);

  const handleClick = async () => {
    const geohash = await getGeohash();
    const rowma = new Rowma(geohash, { baseURL: 'http://localhost' });
    // const rowma = new Rowma(geohash, { baseURL: 'http://192.168.10.79' });
    // const rowma = new Rowma(geohash, { baseURL: 'http://18.176.1.219' });
    setRowma(rowma)

    if (!rowma) return
    rowma.currentConnectionList().then(res => {
      setConnections(res.data)
    })
  }

  const handleClick2 = async () => {
    if (!rowma) return
    const res = await rowma.runLaunch(socket, connectionUuid, command)
    console.log('Response:', res)
  }

  const handleClick3 = () => {
    rowma.connect(connectionUuid).then(sock => {
      setSocket(sock)
    }).catch(e => {
      console.log(e)
    })

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

  const handleSubscribe = async (event) => {
    const res = await rowma.subscribeTopic(socket, connectionUuid, "/image_raw")
    console.log('Response: ', res)
    socket.on('topic_to_device', (event) => {
      console.log("event: ", event);
    });
  }

  const handleKillNodes = async (event) => {
    const res = await rowma.killNodes(socket, connectionUuid, [rosnode])
    console.log('Response: ', res)
  }

  const handleNodeChange = (event) => {
    setRosnode(event.target.value)
  }

  const handleGetRobotState = (event) => {
    rowma.getRobotStatus(connectionUuid).then(res => {
      setRobot(res.data)
    })
  }

  const handleRunRosrun = () => {
    if (!rowma) return
    rowma.runRosrun(socket, connectionUuid, rosrunCommand, rosrunArgs)
  }

  const handlePublishTopic =  (msg) => {
    if (!rowma) return
    rowma.publishTopic(socket, connectionUuid, msg)
  }

  const handleRosrunCmdChange = (event) => {
    setRosrunCommand(event.target.value)
  }

  const handleRosrunArgsChange = (event) => {
    setRosrunArgs(event.target.value)
  }

  return (
    <div className="App">
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

      <button onClick={handleClick3}>Connect</button>
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
      <button onClick={handleSubscribe}>Subscribe</button>

      <button onClick={handleGetRobotState}>Get Robot</button>
      <select onChange={handleNodeChange}>
        <option value=''>{''}</option>
        {_.get(robot, 'rosnodes') && (
          _.map(robot.rosnodes, (rosnode) => {
            return(
              <option key={rosnode} value={rosnode}>{rosnode}</option>
            )
          })
        )}
        {/* eslint-enable no-unused-expressions */}
      </select>
      <button onClick={handleKillNodes}>Kill rviz</button>

      <select onChange={handleRosrunCmdChange}>
        <option value=''>{''}</option>
        {_.get(robot, 'rosrunCommands') && (
          _.map(robot.rosrunCommands, (rosrunCommand) => {
            return(
              <option key={rosrunCommand} value={rosrunCommand}>{rosrunCommand}</option>
            )
          })
        )}
        {/* eslint-enable no-unused-expressions */}
      </select>
      <input type="text" onChange={handleRosrunArgsChange} />

      <button onClick={handleRunRosrun}>Run rosrun</button>

      <button onClick={() => {
        const msg = {
          "op": "publish",
          "topic": "/initialpose",
          "msg": {
            "pose": {
              "pose": {
                "position": {
                  "x": 20.75847435,
                  "y": -3.68245887756,
                  "z": 0.0
                },
                "orientation": {
                  "x": 0.0,
                  "y": 0.0,
                  "z": -0.999993141493,
                  "w": 0.00370364230129
                },
              },
              "covariance": [0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.06853891945200942]
            }
          }
        }
        rowma.publishTopic(socket, connectionUuid, msg)
      }}>Publish Topic</button>

      <ReactNipple
        // supports all nipplejs options
        // see https://github.com/yoannmoinet/nipplejs#options
        options={{ mode: 'static', position: { top: '50%', left: '50%' } }}
        // any unknown props will be passed to the container element, e.g. 'title', 'style' etc
        style={{
          outline: `1px dashed red`,
          width: 150,
          height: 150,
          background: `#aaa`
          // if you pass position: 'relative', you don't need to import the stylesheet
        }}
        // all events supported by nipplejs are available as callbacks
        // see https://github.com/yoannmoinet/nipplejs#start
        onMove={(evt, data) => {
          const isForward = _.get(data, 'direction.y') === 'up'
          const msg =  {
            "op": "publish",
            "topic": "/joy",
            "msg": {
              "axes": [ -1 * Math.cos(data.angle.radian), Math.sin(data.angle.radian), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
              "buttons": [0, isForward ? 1 : 0, 0, !isForward ? 1 : 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          }

          rowma.publishTopic(socket, connectionUuid, msg)
        }}
        onEnd={(evt, data) => {
          // On stick movements stop
          const msg =  {
            "op": "publish",
            "topic": "/joy",
            "msg": {
              "axes": [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
              "buttons": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          }

          rowma.publishTopic(socket, connectionUuid, msg)
        }}

      />
    </div>
  );
}

export default App;
