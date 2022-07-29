import Ably from "ably/promises";
import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
  } from "unique-names-generator"

  
export default async function handler(req, res) {


  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  }); // big_red_donkey

  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: randomName,
  });
  res.status(200).json(tokenRequestData);
}
