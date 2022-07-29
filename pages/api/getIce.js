export default async function handler(req, res) {
  
  let o = {
    format: "urls"
};

let bodyString = JSON.stringify(o);
let url = `https://global.xirsys.net/_turn/sigflow`
  
  const response = await fetch( url , {
   
    method:  "PUT" ,
    headers: {
        "Authorization": "Basic " + Buffer.from("mobin:e2d2ad94-0e2b-11eb-85a4-0242ac150006").toString("base64"),
     
    }
  });
  let re = await response.json()
  console.log(url)
  res.status(200).send(re)
}
