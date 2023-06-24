import express, { Express, Request, Response } from 'express';
import path from "path";
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import cookieParser from "cookie-parser";
import { MultipleAccessControlConditions } from '@lit-protocol/types';

const app: Express = express();
const port = process.env.PORT || 3001;

const MY_OWN_WALLET_ADDRESS = "0x4259E44670053491E7b4FE4A120C70be1eAD646b";

const accessControlCondtionsForProtectedPath1: MultipleAccessControlConditions = {
  accessControlConditions: [{
    chain: 'polygon',
    contractAddress: '',
    method: '',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '=',
      value: MY_OWN_WALLET_ADDRESS,
    },
    standardContractType: '',
  }]
};

app.use(cookieParser());

app.use("/packages", express.static(path.join(__dirname, 'packages')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/protected-path-1', async function(req: Request, res: Response) {
  const jwt = req.query?.jwt || req.cookies?.jwt;

  console.log("JWT is", jwt);

  if (!jwt) {
    res.status(401).send("Unauthorized");
    return;
  }

  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();

  try {
    // Verify the JWT is signed by the Lit network
    const { verified, header, payload } = LitJsSdk.verifyJwt({ jwt, publicKey: litNodeClient.networkPubKey! }); 
    console.log("JWT verified", verified);
    console.log("JWT header", header);
    console.log("JWT payload", payload);

    // Verify the access control conditions in the JWT claims are as expected.
    const expectedAccessControlConditionsHash = (await litNodeClient.getHashedAccessControlConditions(accessControlCondtionsForProtectedPath1))!.toString();
    const actualAccessControlConditionsHash = (await litNodeClient.getHashedAccessControlConditions(payload))!.toString();
    if (expectedAccessControlConditionsHash !== actualAccessControlConditionsHash) {
      console.error("Access control conditions in JWT are not as expected");
      res.status(401).send("Unauthorized");
      return;
    }

    // Set cookie.
    res.cookie("jwt", jwt, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).send("Congrats! You have access to /protected-path-1!")
  } catch (e) {
    console.error("JWT verification failed", e);
    res.status(401).send("Unauthorized");
    return;
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});