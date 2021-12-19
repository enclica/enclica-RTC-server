const socket = io('/')
const videoGrid = document.getElementById('video-grid')
document.getElementById('disconnected').style.display = 'none';
document.getElementById('mute').style.display = 'block';
const myPeer = new Peer(undefined, {
    host: '/',
    port: 8081
});
var mystream = null;
const myVideo = document.createElement('video')
var youruserid = null;
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
    mystream = stream;
    myPeer.on('call', call => {

        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log('connected0');
            addVideoStream(video, userVideoStream)
        })
    })
    socket.on('user-connected', userId => {
        //hide disconnected div
        connectToNewUser(userId, stream)
    })
    socket.on('user-disconnected', userId => {
        if (peer[userId]) peers[userId].close();

    });



    //unmute Audio
    document.getElementById('mute').addEventListener('click', () => {
        mystream.getAudioTracks()[0].enabled = !(mystream.getAudioTracks()[0].enabled);
        if (mystream.getAudioTracks()[0].enabled) {
            document.getElementById('mute').innerHTML = 'Mute';
        } else {
            document.getElementById('mute').innerHTML = 'Unmute';
        }

    });

    document.getElementById('stop-video').addEventListener('click', () => {

        mystream.getVideoTracks()[0].enabled = !(mystream.getVideoTracks()[0].enabled);

        if (mystream.getVideoTracks()[0].enabled) {
            document.getElementById('stop-video').innerHTML = 'Stop Video';
        } else {
            document.getElementById('stop-video').innerHTML = 'Start Video';
        }
    });

    document.getElementById('end').addEventListener('click', () => {
        socket.emit('stop-calling', ROOM_ID);
        socket.emit('mute-audio', ROOM_ID);
        stream.getTracks().forEach(track => track.stop());

        //disable end call button
        document.getElementById('end').disabled = true;
        socket.emit('mute-audio', ROOM_ID);
        var vid = document.getElementsByTagName('video');
        for (var i = 0; i < vid.length; i++) {
            vid[i].remove();
        }
        for (var i = 0; i < vid.length; i++) {
            vid[i].remove();
        }

        //play disconnect.mp3
        var audio = new Audio('/sounds/disconnect.mp3');
        audio.play();

        //hide buttons and video video
        document.getElementById('buttons').style.display = 'none';
        document.getElementById('video-grid').style.display = 'none';

        //show disconnected div
        document.getElementById('disconnected').style.display = 'block';

        socket.removeAllListeners();

        socket.disconnect(true);
    });

    myPeer.on('open', id => {

        socket.emit('join-room', ROOM_ID, id)
    })

    function addVideoStream(video, stream) {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            console.log('metadata')
            video.play()
        })
        console.log('video-added')
        videoGrid.append(video)
    }

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
            video.remove()
        })
        peers[userId] = call
        console.log(peers[userId])
    }
});