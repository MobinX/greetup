export const getMedia = async (video, audio) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: audio,
    video: video,
  });
  window.stream = stream;
  return stream
};

export class Peer {
  constructor({ id, config, isBad, send, onTrack }) {
    this.id = id;
    this.isBad = isBad;
    this.send = send;
    this.pc = new RTCPeerConnection(config);
    this.pc.onicecandidate = ({ candidate }) =>
      this.send({ type: "candidate", ice: candidate,to:this.id });
    this.pc.ontrack = (data) => onTrack(this.id, data);
    if (window.stream) {
      console.log("Adding track to peer")
      this.setTrack();
    }

    this.pc.onnegotiationneeded = async () => {
      console.log("neogotiating peer");
      try {
        this.makingOffer = true;
        //dataChenel
        this.dc = this.pc.createDataChannel("data");
        this.dc.onmessage = (evt) =>
          console.log("data chanel msg" + JSON.parse(evt.data));
        await this.pc.setLocalDescription();
        this.send({ description: this.pc.localDescription, type: "description",to:this.id });
      } catch (err) {
        console.error(err);
      } finally {
        this.makingOffer = false;
      }
    };
  }

  setTrack() {
    if (window.stream) {
      console.log("tracks added");
      for (const track of window.stream.getTracks()) {
        this.pc.addTrack(track, window.stream);
      }
    }
  }

  onmessage = async ({ data: { description, candidate } }) => {
    try {
      if (description) {
        console.log("receiving remote description from peer " + this.id);
        const offerCollision =
          description.type == "offer" &&
          (this.makingOffer || this.pc.signalingState != "stable");

        this.ignoreOffer = this.isBad && offerCollision;

        if (this.ignoreOffer) {
          console.log("ignoring offer peer my id" + this.id );
          return;
        }
        // this.pc.ondatachannel = (evt) => {
        //   this.dc = evt.channel;
        //   this.dc.onmessage = (evt) => console.log(JSON.parse(evt.data));
        //   this.dc.send(JSON.stringify({ msg: "  ggg" }));
        // };
        
        try{
          console.log("setting remote description peer" )
          await this.pc.setRemoteDescription(description);

        }
        catch(err){
          console.error("remote description error " + err + this.pc.signalingState )
      

        }

        if (description.type == "offer") {
          await this.pc.setLocalDescription();
          this.send({
            description: this.pc.localDescription,
            type: "description",
            to:this.id
          });
        }
      } else if (candidate) {
        try {
          console.log("receiving remote ICE from peer " + this.id);
          console.log(candidate);
          await this.pc.addIceCandidate(candidate);
        } catch (err) {
          if (!this.ignoreOffer) {
            console.log(err)
            throw err;

          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
}
