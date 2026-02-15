import { useRef , useState , useEffect } from "react";
import TextField  from "@mui/material/TextField";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../style/vedioComponent.module.css" // module cannot have the override method
import IconButton from "@mui/material/IconButton";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import Badge from "@mui/material/Badge";
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from 'react-router-dom';
import server from "../environment";


const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers":[{"urls" : "stun:stun.l.google.com:19302"}]}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e)}
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let getDisplayMediaSuccess = (stream) => {

        try{

            window.localStream.getTracks().forEach(track => track.stop()) // in this we are stoping all tracks of video and intead of video we are passing the screen

        }catch(e){
            console.log(e);
        }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for(let id in connections ){
            if(id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal" , id , JSON.stringify({"sdp" : connections[id].localDescription}))
                })
                .catch((e) => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {   // on ended screen sharing screen stream will be off and video stream will get on 
            setScreen(false);

            try{

                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track =>track.stop())

            }catch(e){ console.log(e)}

            let blackSilence =(...args )=> new MediaStream([black(...args)] , silence())
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { console.log(e)}

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    
    const routeTo = useNavigate();

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

   let handleVideo = () => {
    setVideo(!video);
   }

   let handleAudio = () => {
    setAudio(!audio);
   }

   let handleScreen= () => {
    setScreen(!screen);
   }

   let handleModel = () => {
    setModal(!showModal);
   }

   let endedCall = () => {
    try{

        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach(track => track.stop())


    }catch(e){
        console.log(e)
    }
     window.location.href='/home'

   }

   let getDisplayMedia = () => {
    if(screen){
        if(navigator.mediaDevices.getDisplayMedia){
            navigator.mediaDevices.getDisplayMedia({video : true , audio : true})
            .then(getDisplayMediaSuccess)
            .then((stream) => {})
            .catch((e) => console.log(e))
            .catch((e) => console.log(e))
        }
    }
   }

   // message

   let sendMessage = () => {
    socketRef.current.emit("chat-message" , username , message);
    setMessage( " ")

   }
    
   // useEffect(() => {
   //  if(screen !== undefined){
   //      getDisplayMedia();
   //  }
   // } ,[screen] )
    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div>


                  <div className="row"> 
                    <div className="col-6 ">
                    <div className={styles.lobby}>
                     <h2> Ready to join? </h2>
                          <h6>No one else is there </h6>
                 
                    
                    <div style={{marginTop: "60px"}}>
                        <h6> <b>Enter your username</b> </h6>
                    <TextField  id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />&nbsp;&nbsp;&nbsp; &nbsp;
                    <Button variant="contained" onClick={connect}>Join now </Button>
                    </div>
                   

                    <img style={{"marginTop":"40px"}} src="/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg " alt=" " />
                     </div>
 </div>

                    <div className="col-6">
                        <div className={styles.vedioLobby}>
                        <video  className={styles.vedioLobby} ref={localVideoref} autoPlay muted></video>
                        </div>
                    </div>
                    </div>

                </div> :<div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>
                      
                     <h2>Chat</h2>
                      <div className={styles.chatContainer}>

                    
                           <div className={styles.chattingArea}>   {/* for chat box */}

                           {messages.map((item , index) => {
                            return (
                                <div key={index}>

                                    <p style={{fontWeight : "bold"}}>{item.data}</p>
                                    <p>{item.sender}</p>
                                </div>
                            )
                           })}
                            </div> 
                         
                     <div className={styles.chatArea}>
                     <TextField value={message} onChange={ e => setMessage(e.target.value)}
                     id="outlined-basic" label="Enter your chat" variant="outlined" />
                     <Button variant="contained" color="success" className={styles.chatSender} onClick={sendMessage}>
                       Send
                      </Button>
                     </div>

                      </div>

                    </div> : <></>}

                    <div className={styles.buttonContainer}>

                        <IconButton onClick={handleVideo} style={{color:"white"}}>
                            {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/>}
                        </IconButton>&nbsp;&nbsp;&nbsp;

                        <IconButton style={{color:"red"}} onClick={endedCall}>
                         <CallEndIcon />
                        </IconButton>&nbsp;&nbsp;&nbsp;

                        <IconButton onClick={handleAudio} style={{color : "white"}}>
                         {(audio === true ? <MicIcon/> : <MicOffIcon/>)}
                        </IconButton>&nbsp;&nbsp;&nbsp;

                        {screenAvailable === true ?
                    <IconButton style={{color : "white"}} onClick={handleScreen}>
                        {screen  === true ? <ScreenShareIcon/> : <StopScreenShareIcon/>}
                    </IconButton>    
                     : <></>}&nbsp;&nbsp;&nbsp;

                     <Badge badgeContent = {newMessages} max={999} color="secondary"> 
                       <IconButton onClick={handleModel} style={{color:"white"}}>
                        <ChatIcon/>
                       </IconButton>
                     </Badge>

                    </div>

                    <video className={styles.meetUserContainer} ref={localVideoref} autoPlay muted></video> 

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId} >
                            <h2>{video.socketId}</h2>
                                <video style={{width: "400px",
        height: "300px",
        objectFit: "cover"}}

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

               </div>

            }

        </div>
    )
}
