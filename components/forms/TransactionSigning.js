import axios from "axios";
import { encode, decode } from "uint8-to-base64";
import React from "react";
import { SigningStargateClient, defaultRegistryTypes, AminoTypes} from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";

import Button from "../inputs/Button";
import TextAreaInput from "../inputs/TextArea";
import HashView from "../dataViews/HashView";
import StackableContainer from "../layout/StackableContainer";
import {pubkeyToAddress} from "@cosmjs/amino";
import {fromBase64} from "@cosmjs/encoding";

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
      walletAccount: null,
      walletError: null,
      sigError: null,
      hasSigned: false,
      selectImport: false,
      sig: "",
      importSigError: null,
    };
  }

  componentDidMount() {
    this.connectWallet();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.transaction && this.props.transaction) {
      this.setState({ transaction: this.props.transaction });
      console.log(JSON.parse(this.props.transaction.signatures));
    }
  }

  handleBroadcast = async () => {
    this.setState({ processing: true });
    const res = await axios.get(
      `/api/transaction/${this.state.transaction.uuid}/broadcast`
    );

    this.setState({
      transaction: res.data,
      processing: false,
    });
  };
  
  connectWallet = async () => {
    try {
      await window.keplr.enable(process.env.NEXT_PUBLIC_CHAIN_ID);
      const walletAccount = await window.keplr.getKey(
        process.env.NEXT_PUBLIC_CHAIN_ID
      );
      const hasSigned = this.props.signatures.some(
        (sig) => sig.address === walletAccount.bech32Address
      );
      this.setState({ walletAccount, hasSigned });
    } catch (e) {
      console.log("enable err: ", e);
    }
  };

  signTransaction = async () => {
    try {
      window.keplr.defaultOptions = {
        sign: {
          preferNoSetMemo: true,
          preferNoSetFee: true,
          disableBalanceCheck: true,
        },
      };
      const offlineSigner = window.getOfflineSignerOnlyAmino(
        process.env.NEXT_PUBLIC_CHAIN_ID
      );
      const accounts = await offlineSigner.getAccounts();
      const signingClient = await SigningStargateClient.offline(offlineSigner);
      const signerData = {
        accountNumber: this.props.tx.accountNumber,
        sequence: this.props.tx.sequence,
        chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      };
      console.log(this.props.tx.msgs)
      console.log(this.state.walletAccount.bech32Address)
      
      const { bodyBytes, signatures } = await signingClient.sign(
        this.state.walletAccount.bech32Address,
        this.props.tx.msgs,
        this.props.tx.fee,
        this.props.tx.memo,
        signerData
      );

      // check existing signatures
      const bases64EncodedSignature = encode(signatures[0]);
      const bases64EncodedBodyBytes = encode(bodyBytes);
      const prevSigMatch = this.props.signatures.findIndex(
        (signature) => signature.signature === bases64EncodedSignature
      );

      if (prevSigMatch > -1) {
        this.setState({ sigError: "This account has already signed." });
      } else {
        const signature = {
          bodyBytes: bases64EncodedBodyBytes,
          signature: bases64EncodedSignature,
          address: this.state.walletAccount.bech32Address,
        };
        const res = await axios.post(
          `/api/transaction/${this.props.transactionID}/signature`,
          signature
        );
        console.log("Signature_base_64 :")
        console.log(bases64EncodedSignature);
        this.props.addSignature(signature);
        this.setState({ hasSigned: true });
      }
    } catch (error) {
      console.log("Error creating signature:", error);
    }
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  importSignature = async () => {
    // retrieve information from tx json
    let sig_json_parsed;
    try{
      sig_json_parsed = JSON.parse(this.state.sig);
    }catch(err) {
      console.log(err);
      this.setState({importSigError : "Invalid Tx Json. Check TX Again!"});
      return null;
    }

    //Constructing body bytes
    let registry = new Registry(defaultRegistryTypes);
    const signedTxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages : this.props.tx.msgs,
        memo : this.props.tx.memo,
      },
    };

    let bodyBytes = registry.encode(signedTxBodyEncodeObject)
    console.log("data:")

    var pubkey = sig_json_parsed.signatures[0]["public_key"];

    pubkey["type"] = "tendermint/PubKeySecp256k1"
    pubkey["value"] = pubkey["key"]
    
    delete pubkey["key"]
    
    console.log(pubkey)
    const bases64EncodedBodyBytes = encode(bodyBytes);
    const bech32Address = pubkeyToAddress(pubkey, "osmo")
    const bases64EncodedSignature = sig_json_parsed.signatures[0]["data"]["single"]["signature"]
    //HANDLING SIGNATURE
  
    const prevSigMatch = this.props.signatures.findIndex(
      (signature) => signature.signature === bases64EncodedSignature
    );

    try{
      if (prevSigMatch > -1) {
        this.setState({ sigError: "This account has already signed." });
      } else {
        const signature = {
          bodyBytes: bases64EncodedBodyBytes,
          signature: bases64EncodedSignature,
          address: bech32Address,
        };
        const res = await axios.post(
          `/api/transaction/${this.props.transactionID}/signature`,
          signature
        );
        console.log("Signature_base_64 :")
        console.log(bases64EncodedSignature);
        this.props.addSignature(signature);
        this.setState({ hasSigned: true });
      }
    } catch (error) {
      console.log("Error creating signature:", error);
    }
  }
  
  /* DISABLING TESTING
  testing = async() => {
    // first way to create registry
    const offlineSigner = window.getOfflineSignerOnlyAmino(
      process.env.NEXT_PUBLIC_CHAIN_ID
    );
    const signingClient = await SigningStargateClient.offline(offlineSigner, { prefix : "osmo"});
    let registry = signingClient.registry;
    
    // second way to create registry
    //let registry = new Registry(defaultRegistryTypes);
    
    // convert from bodyBytes back to transactions
    let bytes = "CpsBCiUvY29zbW9zLnN0YWtpbmcudjFiZXRhMS5Nc2dVbmRlbGVnYXRlEnIKK29zbW8xa3hmYTZxdnM0M2N6cnJ6bGpkcTQ5N2ZwbGRnY2x5c3Zxbmpqc3kSMm9zbW92YWxvcGVyMTA4M3N2cmNhNHQzNTBtcGhmdjl4NDV3cTlhc3JzNjBjNnJ2MGo1Gg8KBXVvc21vEgYxMDAwMDA="
    let txBody = registry.decodeTxBody(decode(bytes))
    console.log(txBody)

    // TRYING TO CREATE BodyBytes
    const signedTxBody = {
      messages: [
        {
          "typeUrl": "/cosmos.staking.v1beta1.MsgUndelegate",
          "value": {
            "delegatorAddress": "osmo1kxfa6qvs43czrrzljdq497fpldgclysvqnjjsy",
            "validatorAddress": "osmovaloper1083svrca4t350mphfv9x45wq9asrs60c6rv0j5",
            "amount": {
              "denom": "uosmo",
              "amount": "100000"
            }
          }
        }
      ],
      memo: "",
    };

    const signedTxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    

    let bodyBytes = registry.encode(signedTxBodyEncodeObject)

    console.log(bodyBytes)

    // TRYING TO CREATE SIGNATURE
    // addr : osmo1ya403hmh5ehj2qp6uf0pa672ynjguc7aea4mpk
    let sig = {
      pub_key:{
          type: "tendermint/PubKeySecp256k1",
          value: "AgRF5K27GQeEobpesp38nU1UdkZDFSPdud88zt3tWCRk"
      },
      signature: "EpksNkZTO0+0BeEG4AAlJQVtsQ+wECqwdZektvSL7ml3HbxCeU78lEkW5/Ux0z9hV+Yy0GAzMeIybQRqUTTQwQ=="
    }

    let signatures = [fromBase64(sig.signature)]
    console.log(signatures)



    // TRYING TO CREATE BECH32 ADDRESS FROM PUB_KEY AND SIGNATURE
    const bech32Address = pubkeyToAddress(sig["pub_key"], "osmo")
    console.log(bech32Address)
  } 

  */

  render(){
    return (
      <StackableContainer lessPadding lessMargin>
        {this.state.hasSigned ? (
          <StackableContainer lessPadding lessMargin lessRadius>
            <div className="confirmation">
              <svg
                viewBox="0 0 77 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
              </svg>
              <p>You've signed this transaction.</p>
            </div>
          </StackableContainer>
        ) : (
          <>
            <h2>Sign this transaction</h2>
            {this.state.walletAccount ? (
              <Button label="Sign transaction" onClick={this.signTransaction} />
            ) : (
              <Button label="Connect Wallet" onClick={this.connectWallet} />
            )}
            
            <br/>
            {this.state.selectImport ? (
              <>
                <TextAreaInput
                  name="sig"
                  value={this.state.sig}
                  onChange={this.handleChange}
                  error={this.state.importSigError}
                  placeholder="paste your signature here"
                />

                <Button label="Submit signature" onClick={this.importSignature} />
              </>
            ) : (
              <Button label="Import signature" onClick={() => this.setState({ selectImport : true })} />
            )}
          </>
        )}
        {this.state.sigError && (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>This account has already signed this transaction.</p>
            </div>
          </StackableContainer>
        )}
        <h2>Current Signers</h2>
        <StackableContainer lessPadding lessMargin lessRadius>
          {this.props.signatures.map((signature, i) => (
            <StackableContainer
              lessPadding
              lessRadius
              lessMargin
              key={`${signature.address}_${i}`}
            >
              <HashView hash={signature.address} />
            </StackableContainer>
          ))}

          {this.props.signatures.length === 0 && <p>No signatures yet</p>}
        </StackableContainer>
        <style jsx>{`
          p {
            text-align: center;
            max-width: none;
          }
          h2 {
            margin-top: 1em;
          }
          h2:first-child {
            margin-top: 0;
          }
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .signature-error p {
            max-width: 550px;
            color: red;
            font-size: 16px;
            line-height: 1.4;
          }
          .signature-error p:first-child {
            margin-top: 0;
          }
          .confirmation {
            display: flex;
            justify-content: center;
          }
          .confirmation svg {
            height: 0.8em;
            margin-right: 0.5em;
          }
        `}</style>
      </StackableContainer>
    );
  }
}
