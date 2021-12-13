import { createMultisig, getMultisig } from "../../../lib/graphqlHelpers";

export default async function (req, res) {
  return new Promise(async (resolve) => {
    switch (req.method) {
      case "POST":
        try {
          const data = req.body;
          console.log("Function `createMultisig` invoked", data);
          const saveRes = await createMultisig(data);
          console.log("success", saveRes.data);
          res.status(200).send(saveRes.data.data.createMultisig);
          return resolve();
        } catch (err) {
          console.log(err);
          res.status(400).send(err.message);
          return resolve();
        }
      case "GET" :
        try {
          console.log("Function `getMultisig` invoked", req.query.address_bech32);
          const saveRes = await getMultisig(req.query.address_bech32);
          console.log("success", saveRes.data);
          res.status(200).send(saveRes.data);
          return resolve();
        } catch (err) {
          console.log(err);
          res.status(400).send(err.message);
          return resolve();
        }

    }
    // no route matched
    res.status(405).end();
    return resolve();
  });
}
