import type { PlasmoMessaging } from "@plasmohq/messaging"
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(`Fetching google.com because of ${req.body.method} call`);
  try {
    const response = await fetch("https://www.google.com");
    console.log("Fetch successful", response.status);
    res.send({status: "success"});
  } catch (error) {
    console.error("Fetch failed", error);
    res.send({status: "failed"});
  }
}
 
export default handler
