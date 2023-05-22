import './Otp.css';
import { useState } from 'react';
import { Input } from 'tiny-ui';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Card } from 'tiny-ui';
import { ethers } from 'ethers';
import { ProviderType } from '@lit-protocol/constants';
import {newSessionCapabilityObject, LitAccessControlConditionResource, LitAbility} from '@lit-protocol/auth-helpers';
export function Otp() {
    let [state, setState] = useState('start');
    const litNodeClient = new LitNodeClient({
        litNetwork: "serrano",
        debug: true
    });
    const authClient = new LitAuthClient({
        redirectUri: window.location.href.replace(/\/+$/, ''),
        litRelayConfig: {
            relayApiKey: 'testing-key',
            relayUrl: "http://127.0.0.1:8081"
        }
    });
 
    let [otpSession, setOtpSession] = useState({});
    let [userId, setUserId] = useState('');
    let [pkpInfo, setPkpInfo] = useState({});
    let [action, setAction] = useState({});
    let [accessToken, setAccessToken] = useState("");
    let [sessionSig, setSessionSig] = useState("");
    let [err, setErr] = useState("");
    let [signature, setSignature] = useState("");

    const onRegister = (e) => {
        setAction("register");
    }

    const onLogin = (e) => {
        setAction("login");
    }

    const onEnterStart = async(e) => {
        let transport = e.target.defaultValue;
        setUserId(`+1` + transport);

        let session = authClient.initProvider(ProviderType.Otp,{
            userId: '+1' + transport
        });
        let status = await session.sendOtpCode();
        if (status) {
            setOtpSession(session);
            e.target.defaultValue = '';
            setState('check');
        }
    };

    const onEnterCheckRegister = async (e) => {
        let code = e.target.defaultValue;
        let authMethod = await otpSession.checkOtpCode(code);
        console.log(authMethod);
        const res = await otpSession.mintPKPThroughRelayer(authMethod);
        console.log(res);
        setPkpInfo(res);
        setAccessToken(authMethod.accessToken);
        setState('display');
    };

    const onEnterCheckLogin = async (e) => {
        let code = e.target.defaultValue;
        let authMethod = await otpSession.checkOtpCode(code);
        console.log(authMethod);
        setAccessToken(authMethod.accessToken);
        const res = await otpSession.fetchPKPsThroughRelayer(authMethod);
        console.log(res);
        if (res[0].tokenId.hex) {
            res[0].tokenId = res[0].tokenId.hex;
        }
        setPkpInfo(res[0]); // only give the first pkp in the list

        setState('display');
    };

    const onSignSessionsig = async (e) => {
        const authNeededCallback = async authCallbackParams => {
            let chainId = 1;
            try {
                
            } catch {
              // Do nothing
            }
            console.log(authCallbackParams);
            let response = await litNodeClient.signSessionKey({
              authMethods: [
                {
                  authMethodType: 7,
                  accessToken: accessToken,
                },
              ],
              pkpPublicKey: pkpInfo.publicKey,
              expiration: authCallbackParams.expiration,
              resources: authCallbackParams.resources,
              chainId,
            });
    
            return response.authSig;
          };
          
          try {
            await litNodeClient.connect();

            // Create the Lit Resource keyed by `someResource`
            const litResource = new LitAccessControlConditionResource('*');

            // Generate session sigs with the given session params
            const sessionSigs = await litNodeClient.getSessionSigs({
                chain: 'ethereum',
                resourceAbilityRequests: [{
                    resource: litResource,
                    ability: LitAbility.PKPSigning
                }],
                authNeededCallback,
            });
            console.log(sessionSigs);
            setSessionSig(sessionSigs);
            setState("execute");
          } catch(e) {
            console.log(err);
            setErr(e);
          }
    }


    const onExecute = async (e) => {
        let toSign = e.target.defaultValue;
        toSign = ethers.utils.arrayify(ethers.utils.hashMessage(toSign));
        e.target.defaultValue = '';
        const litActionCode = `
            const go = async () => {
            // this requests a signature share from the Lit Node
            // the signature share will be automatically returned in the response from the node
            // and combined into a full signature by the LitJsSdk for you to use on the client
            // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
            const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
            };
            go();
        `;
        await litNodeClient.connect();
        // Sign message
        // @ts-ignore - complains about no authSig, but we don't need one for this action
        const results = await litNodeClient.executeJs({
            code: litActionCode,
            sessionSigs: sessionSig,
            jsParams: {
            toSign: toSign,
            publicKey: pkpInfo.publicKey,
            sigName: 'sig1',
            },
        });
        // Get signature
        const result = results.signatures['sig1'];
        const signature = ethers.utils.joinSignature({
            r: '0x' + result.r,
            s: '0x' + result.s,
            v: result.recid,
        });
        setSignature(signature.toString())
    };

    if (state === 'start') {
        return (
            <div>
                <div className='context-buttons'>
                    <button onClick={onRegister}>Register</button>
                    <button onClick={onLogin}>Login</button>
                </div>
                <br/>
                <br/>
                {action === 'register' &&
                    <div>
                        <span>Sign up with your Email or Phone #</span>
                        <Input placeholder='Email / Phone Number' onEnterPress={onEnterStart}/>
                    </div>
                }
                {
                    action === 'login' &&
                    <div>
                        <span>Login with your Email or Phone #</span>
                        <Input placeholder='Email / Phone Number' onEnterPress={onEnterStart}/>
                    </div>
                }
            </div>
        );
    } else if (state === 'check') {
        return (
            <div>
                <span>enter code</span>
                <br/>
                <Input placeholder='Code' onEnterPress={action === 'register' ? onEnterCheckRegister : onEnterCheckLogin}/>
            </div>
        );
    } else if (state === 'display') {
        return (
            <div>
                {action === 'register' &&
                    <span>Created your pkp account</span>
                }
                {action === 'login' &&
                    <span> Showing a pkp for your account</span>
                }
                <br/>
                <br/>
                <Card title="PKP information">
                    {pkpInfo.tokenId && 
                        <Card.Content>
                            <br/>
                            <div>pkp eth public key: {pkpInfo.ethAddress}</div>
                            <div>pkp tokenId: {pkpInfo.tokenId}</div>
                        </Card.Content>
                    }
                    {pkpInfo && !pkpInfo.tokenId &&
                        <Card.Content>
                            <br/>
                            <div> transaction: {pkpInfo} </div>
                        </Card.Content>
                    }
                </Card>
                <br/>
                <br/>
                <div className='context-buttons'>
                    <button onClick={pkpInfo.tokenId ? onSignSessionsig : onEnterCheckLogin}>Login</button>
                </div>
            </div>
        );
    } else if (state == "execute") {
        return (
            <div>
                <span>Enter a message to sign</span>
                <Input placeholder='message' onEnterPress={onExecute}/>
                <br/>
                <br/>
                {signature && 
                    <div>
                        <Card.Content>
                            <div>Signature</div>
                            <div>{signature}</div>
                        </Card.Content>
                    </div>
                }
            </div>
        )
    }
}