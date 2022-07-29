import dynamic from 'next/dynamic'
import { useState,useEffect } from 'react';
const Meet = dynamic(() => import('../components/Meet'), { ssr: false });


export default function Home() {
  let icelist = []
  const [isLoadedIce, setLoadedIce] = useState(false);

  useEffect(() => {
    if (!isLoadedIce) {
      fetch("/api/getIce")
        .then((res) => res.json())
        .then((iceList) => {
          icelist = [...iceList.v.iceServers]
          setLoadedIce(true);
          console.log(icelist)
          window.icelist = icelist
        });
    }
  }, []);



  return (
    <div>
     {isLoadedIce && <Meet />}
     
    </div>
  );
}
