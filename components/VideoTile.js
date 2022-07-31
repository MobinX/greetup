import { useState, useEffect, useRef } from "react";

export const VideoTile = ({ data }) => {
  const videoRef = useRef();
  console.log("stream data " +data.stream);
  useEffect(() => {
    if (videoRef.current) {
      if (!data.local) {
        console.log("from track");
          if (videoRef.current.srcObject) {
            return;
          }
          videoRef.current.srcObject = data.stream;
        
      } else {
        videoRef.current.srcObject = data.stream;
      }
    }
  }, [videoRef]);

  return (
    <div>
      <p>{data.id}</p>{" "}
      <video ref={videoRef} autoPlay controls muted playsInline></video>
    </div>
  );
};
