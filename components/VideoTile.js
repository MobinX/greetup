import { useState,useEffect,useRef } from "react";

export const VideoTile = ({data}) => {
    const videoRef = useRef()
    console.log(data)
    useEffect(()=>{
        if(videoRef.current) videoRef.current.srcObject = data.stream;
    },[videoRef])
    
    return <div><p>{data.id}</p>  <video ref={videoRef} autoPlay controls muted playsInline></video></div>;
}