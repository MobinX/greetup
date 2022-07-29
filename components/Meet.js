import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import { getMedia, Peer } from "../lib/sigflow";
import { VideoTile } from "./VideoTile";

configureAbly({ authUrl: "/api/createTokenRequest" });

export default function Meet({}) {
  const icelist = window.icelist;
  const videoRef = useRef();
  console.log(icelist);
  const [messages, updateMessages] = useState([]);
  const [tracks, setTracks] = useState([]);
  let peers = [];
  const [localstream, setStream] = useState(null);
  getMedia(true, true).then((localstream) => setStream(localstream));

  const [channel, ably] = useChannel("msg1", "socket", (message) => {
    updateMessages((prev) => [...prev, message]);
    gotMsg(message);
    console.log("msg " + message + "from " + message.clientId);
  });
  const [presenceData, updateStatus] = usePresence(
    "msg1",
    "initial",
    (presenceUpdate) => {
      // THe real play ground
      if (presenceUpdate.action == "enter") {
        console.log(icelist);
        const peerInd = peers.findIndex(
          (peer) => peer.id == presenceUpdate.clientId
        );
        console.log("from presce peerind" + peerInd);

        if (peerInd < 0) {
          if (presenceUpdate.connectionId != ably.connection.id) {
            const peer = new Peer({
              id: presenceUpdate.clientId,
              config: icelist,
              isBad: true,
              send: send,
              onTrack: ontrack,
            });
            peers.push(peer);

            console.log(peers);
          }
        }
      }

      if (presenceUpdate.action == "leave") {
        const peerInd = peers.findIndex(
          (peer) => peer.id == presenceUpdate.clientId
        );
        if (peerInd >= 0) peers.splice(peerInd, 1);
      }
      console.log(presenceUpdate);
    }
  );

  const gotMsg = (msg) => {
    console.log("got msg ")
    console.log(msg)
    if (msg.connectionId != ably.connection.id) {
      let peerIndex = peers.findIndex((peer) => peer.id == msg.clientId);
      console.log("Got Remote data  from peerInd" + peerIndex);
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
          id: msg.clientId,
          config: icelist,
          isBad: false,
          send: send,
          onTrack: ontrack,
        });
        peers.push(peer);
        console.log("from got msg");
        console.log(peers);
      }
    }
  };
  const ontrack = (id, { track, streams }) => {
    // let temp = tracks;
    // // [{id:990d0f, stream:stream}]

    //     temp.push({ id: id, stream: streams[0] });

    // setTracks([...temp]);

    track.onunmute = () => {
      if (videoRef.current.srcObject) {
        return;
      }
      videoRef.current.srcObject = streams[0];
    };
  };

  // Convert presence data to list items to render

  useEffect(() => {
    console.log("Tracks    kkkkk ");
    console.log(tracks);
  }, [tracks]);

  // helper get ice config

  const send = (msg) => {
    console.log("sending msg")
    console.log(msg);
    channel.publish("socket", msg);
  };

  return (
    <div>
      <input onBlur={(e) => send(e.target.value)} />
      {localstream && <VideoTile data={{ id: "me", stream: localstream }} />}

      <video ref={videoRef} autoPlay controls muted playsInline></video>
    </div>
  );
}
