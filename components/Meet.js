import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import { getMedia, Peer } from "../lib/sigflow";
import { VideoTile } from "./VideoTile";

configureAbly({ authUrl: "/api/createTokenRequest" });

export default function Meet({}) {

  const icelist = window.icelist;
  // const videoRef1 = useRef();
  // const videoRef2 = useRef();

  // const videoRef3 = useRef();

  const [peerCount,setPeer] = useState(0)

  console.log(icelist);
  const [messages, updateMessages] = useState([]);
  const [tracks, setTracks] = useState([]);
  let peers = [];
  const [localstream, setStream] = useState(null);
  useEffect(()=>{
    if(!localstream){
      getMedia(true, true).then((localstream) => setStream(localstream));
      console.log("geeting stream")
    }
  },[])


  const [channel, ably] = useChannel("msg1", "socket", (message) => {
    updateMessages((prev) => [...prev, message]);
    gotMsg(message);
    console.log("msg " + message + "from peer" + message.connectionId);
  });
  console.log("ably client id " + ably.auth.connectionId)
  const myconnectionId = ably.auth.connectionId;
  
  const [presenceData, updateStatus] = usePresence(
    "msg1",
    "initial",
    (presenceUpdate) => {

      // THe real play ground
      if (presenceUpdate.action == "enter") {
        console.log(icelist);
        const peerInd = peers.findIndex(
          (peer) => peer.id == presenceUpdate.connectionId
        );
        console.log("from presce peerind" + peerInd);

        if (peerInd < 0) {
          if (presenceUpdate.connectionId != ably.connection.id) {
            const peer = new Peer({
              id: presenceUpdate.connectionId,
              config: icelist,
              isBad: true,
              send: send,
              onTrack: ontrack,
            });
            peers.push(peer);
            window.peers = peers
            setPeer(perv => perv+1)
            console.log(peers)
            console.log(peers);
          }
        }
      }

      if (presenceUpdate.action == "leave") {
        const peerInd = peers.findIndex(
          (peer) => peer.id == presenceUpdate.connectionId
        );
            
            if (peerInd >= 0) {peers.splice(peerInd, 1);  setPeer(perv => perv-1)} 
      }
      console.log(presenceUpdate);
    }
  );
  useEffect(()=>console.log("peers " + peerCount),[peerCount])

  const gotMsg = (msg) => {
    console.log("got msg from peer "+ msg.connectionId + " to " + msg.data.to + " and my connectionId " + ably.connection.id);
    console.log(msg);
    //checking the msg is not mine and it is send to me \\\
    if ((msg.connectionId != ably.connection.id)  && (msg.data.to == ably.connection.id)) {
      let peerIndex = peers.findIndex((peer) => peer.id == msg.connectionId);
      console.log("Got Remote data "+msg.data.type+ " from peerInd" + peerIndex);
      if (peerIndex >= 0) {
        const msgd = msg.data;
        if (msgd.type == "description") {
          peers[peerIndex].onmessage({
            data: { description: msgd.description },
          });
        }
        if (msgd.type == "candidate") {
          peers[peerIndex].onmessage({ data: { candidate: msgd.ice } });
        }
      } else {
        const peer = new Peer({
          id: msg.connectionId,
          config: icelist,
          isBad: false,
          send: send,
          onTrack: ontrack,
        });
        peers.push(peer);
        console.log("from got msg");
        setPeer(perv => perv+1)

        window.peers = peers
        console.log(peers);
      }
    }
  };
  const ontrack = (id, { track, streams }) => {
    let temp = tracks;
    // [{id:990d0f, stream:streams[0]}]
   
    track.onunmute = () => {
      const trackIndex = temp.findIndex((tr) => tr.id == id);
      console.log("track index " +trackIndex)
      if (trackIndex < 0) {
        temp.push({ id: id, stream: streams[0] });
        console.log("Appending track" + (trackIndex < 0))
        setTracks([...temp]);
        console.warn(tracks)
      }
    };

    // track.onunmute = () => {
    //   // if (videoRef1.current.srcObject) {
    //   //   return;
    //   // }
    //   // videoRef1.current.srcObject = streams[0];
    //   // }
    //   if(peerCount == 1){
    //     if (videoRef1.current.srcObject) {
    //     return;
    //   }
    //   videoRef1.current.srcObject = streams[0];
    //   }
    //   if(peerCount == 2){
    //     if (videoRef2.current.srcObject) {
    //     return;
    //   }
    //   videoRef2.current.srcObject = streams[0];
    //   }
    //   if(peerCount == 3){
    //     if (videoRef3.current.srcObject) {
    //     return;
    //   }
    //   videoRef3.current.srcObject = streams[0];
    //   }
      
    // };
  };

  // Convert presence data to list items to render

  useEffect(() => {
    console.log("Tracks    kkkkk " + tracks);
    console.log(tracks);
  }, [tracks]);

  // helper get ice config

  const offVedio = ()=>{
    setStream("null")
    console.log(localstream)
  }


  const send = (msg) => {
    console.log("sending msg");
    console.log(msg);
    channel.publish("socket", msg);
  };

  return (
    <div>
      {/* <input onBlur={(e) => send(e.target.value)} /> */}
      <button onClick={offVedio}>{JSON.stringify(localstream)}</button>
      {localstream && (
        <VideoTile data={{ id: "me", stream: localstream, local: true }} />
      )}
      {tracks.map((t, i) => (
        <VideoTile data={t} key={i} />
      ))}
      {/* <video ref={videoRef1} autoPlay controls muted playsInline></video>
      <video ref={videoRef2} autoPlay controls muted playsInline></video>
      <video ref={videoRef3} autoPlay controls muted playsInline></video> */}

    </div>
  );
}
