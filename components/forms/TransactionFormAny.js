import axios from "axios";
import { coins } from "@cosmjs/launchpad";
import React from "react";
import { withRouter } from "next/router";
import {JSONObject} from "core-js/fn/object"
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import TextAreaInput from "../../components/inputs/TextArea";
import * as txCheck from "../../lib/txCheck";

import StackableContainer from "../layout/StackableContainer";

class TransactionFormAny extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: 0,
      memo: "",
      gas: 200000,
      processing: false,
      addressError: "",
      tx: "",
    };

    this.addressAmino = txCheck.addressAmino
    this.addressConversion = txCheck.addressConversion
    this.typeMsg = [
      'cosmos-sdk/MsgWithdrawDelegationReward',
      'cosmos-sdk/MsgDelegate', 
      'cosmos-sdk/MsgSend', 
      'cosmos-sdk/MsgUndelegate', 
      'cosmos-sdk/MsgBeginRedelegate'
    ]
    this.typeMsgConversion = [
      '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', 
      '/cosmos.staking.v1beta1.MsgDelegate', 
      '/cosmos.bank.v1beta1.MsgSend', 
      '/cosmos.staking.v1beta1.MsgUndelegate', 
      '/cosmos.staking.v1beta1.MsgBeginRedelegate'
    ]
  }

  handleChange = (e) => {
    this.setState({ processing: false });

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  convertCLITransaction = (tx_json_parsed) => {
    let msgValue = {}
    let msg = tx_json_parsed.body.messages[0]
    msgValue["type"] = msg["@type"]
    msgValue["value"] = {}
    for(const key in msg){
      if(key === "type") continue;
      msgValue["value"][key] = msg[key];
    }

    let fee = tx_json_parsed.auth_info.fee;
    msgValue["fee"] = {}
    msgValue["fee"]["gas"] = fee.gas_limit;
    msgValue["fee"]["amount"] = fee.amount;

    return msgValue;
  }

  createTransaction = () => { 
    if(!this.props.accountOnChain){
      window.alert(`Account with address : ${this.props.address} haven't been in chain yet, can't create Transaction!`);
      return null;
    }

    if (this.state.processing == true) {
      console.log("loading")
      window.alert("Processing");
      return null;
    }

    console.log("hello")
    
    // retrieve information from tx json
    let tx_json_parsed;
    try{
      tx_json_parsed = JSON.parse(this.state.tx);
    }catch(err) {
      console.log(err);
      this.setState({addressError : "Invalid Tx Json. Check TX Again!"});
      return null;
    }

    var msgValue;
    var type;
    var fee;
    if("msgs" in tx_json_parsed){
      msgValue = tx_json_parsed.msgs[0].value;
      type = tx_json_parsed.msgs[0].type; 
      fee = tx_json_parsed.fee
    }else{
      let msg = this.convertCLITransaction(tx_json_parsed);
      msgValue = msg.value;
      type = msg.type;
      fee = msg.fee;
    }

    // console.log(msgValue)
    try{
      txCheck.checkMsg(msgValue)
    }catch(err){
      this.setState({ addressError: err.message });
      return null;
    }

    //====== NEW ENGINE TO CONVERT ======
    // convert type
    let posi = this.typeMsg.indexOf(type);
    if(posi > -1){
      type = this.typeMsgConversion[posi];
    }else if(!this.typeMsgConversion.includes(type)){
      this.setState({ addressError: "Wrong Transaction Type. Check Again Your Transaction Type" });
      return null;
    }

    // convert to compatible field
    for(let i = 0; i < this.addressAmino.length; i++){
      if(!(this.addressAmino[i] in msgValue)) continue;

      if(this.addressAmino[i] === "delegator_address" || this.addressAmino[i] === "from_address"){
        msgValue[this.addressConversion[i]] = this.props.address;
      }else{
        msgValue[this.addressConversion[i]] = msgValue[this.addressAmino[i]];
      }

      delete msgValue[this.addressAmino[i]];
    }

    // console.log(msgValue);

    const msg = {
      value: msgValue,
      typeUrl : type,
    };

    return {
      accountNumber: this.props.accountOnChain.accountNumber,
      sequence: this.props.accountOnChain.sequence,
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      msgs: [msg],
      fee: fee,
      memo: this.state.memo,
    };
  };
  
  handleCreate = async () => {
    console.log("creating");

    this.setState({ processing: true });
    const tx = this.createTransaction();
    console.log(tx);

    // if failed to create, return null
    if(!tx){
      return null;
    }

    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    this.props.router.push(
      `${this.props.address}/transaction/${transactionID}`
    );
  };

  render() {
    return (
      <StackableContainer lessPadding>
        <button className="remove" onClick={this.props.closeForm}>
          ✕
        </button>
        <h2>Import transaction</h2>
        <div className="form-item">
          <TextAreaInput
            name="tx"
            value={this.state.tx}
            onChange={this.handleChange}
            error={this.state.addressError}
            placeholder="paste your transaction here"
          />
        </div>
        <Button label="Import Transaction" onClick={this.handleCreate} />
        <style jsx>{`
          p {
            margin-top: 15px;
          }
          .form-item {
            margin-top: 1.5em;
          }
          button.remove {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            color: white;
            position: absolute;
            right: 10px;
            top: 10px;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default withRouter(TransactionFormAny);
