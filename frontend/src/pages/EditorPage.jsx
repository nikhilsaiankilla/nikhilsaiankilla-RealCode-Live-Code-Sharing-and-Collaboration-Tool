import React, { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'

import Client from '../components/Client';
import Editor from '../components/Editor';

import { initSocket } from '../socket'
import { ACTIONS } from '../actions';


const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const { roomId } = useParams();

  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hasJoined = useRef(false); // Add this line

useEffect(() => {
  const init = async () => {
    try {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      if (!hasJoined.current) {
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          userName: location.state?.userName
        });
        hasJoined.current = true; // Set this to true after joining
      }

      socketRef.current.on(ACTIONS.JOINED, ({ clients, socketId, userName }) => {
        if (userName !== location.state?.userName) {
          toast.success(`${userName} joined the room`);
        }
        setClients(clients);
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} left the room.`);
        setClients((prev) => prev.filter(client => client.socketId !== socketId));
      });

    } catch (error) {
      handleErrors(error);
    }
  };
  init();

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.JOINED);
    }
  };
}, []);


  const handleErrors = (err) => {
    console.log("socket error", err);

    toast.error('socket connection failed try again later');
    navigate('/');
  }

  if (!location.state) {
    navigate('/');
  }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <h1>My Own online Compailer</h1>
          <h3>connected</h3>
          <div className="clientsList">
            {
              clients.map(client => (<Client client={client} key={client?.socketId} />))
            }
          </div>
        </div>

        <button className='btn copyBtn'>Copy room id</button>
        <button className='btn leaveBtn'>leave</button>
      </div>
      <div className='editorWrap'>
        <Editor socketRef={socketRef} roomId={roomId} />
      </div>
    </div>
  )
}

export default EditorPage