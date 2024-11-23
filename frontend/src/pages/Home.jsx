import { useState } from 'react';
import { v4 } from 'uuid'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [userName, setUserName] = useState("");

    const handleCreateRoom = (e) => {
        e.preventDefault();

        //generates unique id
        const id = v4();
        setRoomId(id);

        toast.success("created a new room")
    }

    const handleJoinRoom = () => {
        if (!roomId || !userName) {
            toast.error("ROOM ID AND USER NAME REQUIRED");
            return;
        }

        //REDIRECT
        navigate(`/editor/${roomId}`, {
            state: {
                userName
            }
        })
    }

    const handleKeyEnter = (e) => {
        if (e.code === 'Enter') {
            handleJoinRoom();
        }
    }

    return (
        <div className='homePageWrapper'>
            <div className='FormWrapper'>
                <h1>My Own online Compailer</h1>
                <h3>paste invitation room id</h3>
                <div className='inputGroup'>
                    <input type="text" className='inputBox' placeholder='ROOM ID' onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleKeyEnter} />
                    <input type="text" className='inputBox' placeholder='USER NAME' onChange={(e) => setUserName(e.target.value)} value={userName} onKeyUp={handleKeyEnter} />
                    <button className='btn joinBtn' onClick={handleJoinRoom}>join</button>
                    <span className='createInfo'>
                        if you don't have an invite then create &nbsp;
                        <a href="" onClick={handleCreateRoom} className='createNewBtn'>new room</a>
                    </span>
                </div>
            </div>

            <footer>
                <h4>build with 💛 by nikhil sai</h4>
            </footer>
        </div>
    )
}

export default Home