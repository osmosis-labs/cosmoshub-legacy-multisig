import axios from "axios";
import { coins } from "@cosmjs/launchpad";
import React from "react";
import { withRouter } from "next/router";

import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import {checkAddressOsmoValid} from "../../lib/txCheck";

class TransactionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: 0,
      memo: "",
      gas: 200000,
      processing: false,
      addressError: "",
      fee : 0,

    };
  }

  handleChange = (e) => {
    this.setState({ processing: false });

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  createTransaction = (toAddress, amount, gas) => {
    const msgSend = {
      fromAddress: this.props.address,
      toAddress: toAddress,
      amount: coins(amount * 1000000, process.env.NEXT_PUBLIC_DENOM),
    };
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
    const gasLimit = gas;
    const fee = {
      amount: coins(parseInt(this.state.fee), process.env.NEXT_PUBLIC_DENOM),
      gas: gasLimit.toString(),
    };

    console.log(this.props)

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
    console.log(this.props.accountOnChain)
    if(!this.props.accountOnChain){
      window.alert(`Account with address : ${this.props.address} haven't been in chain yet, can't create Transaction!`);
      return null;
    }

    if (this.state.processing == true) {
      console.log("loading")
      window.alert("Processing");
      return null;
    }

    if (checkAddressOsmoValid(this.state.toAddress)) {
      this.setState({ processing: true });
      const tx = this.createTransaction(
        this.state.toAddress,
        this.state.amount,
        this.state.gas
      );
      console.log(tx);
      const dataJSON = JSON.stringify(tx);
      const res = await axios.post("/api/transaction", { dataJSON });
      const { transactionID } = res.data;
      this.props.router.push(
        `${this.props.address}/transaction/${transactionID}`
      );
    } else {
      this.setState({ addressError: util.format("Invalid %s address format", process.env.NEXT_PUBLIC_CHAIN_NAME.toLowerCase()) });
    }
  };

  render() {
    return (
      <StackableContainer lessPadding>
        <button className="remove" onClick={this.props.closeForm}>
          ✕
        </button>
        <h2>Create New Send transaction</h2>
        <div className="form-item">
          <Input
            label="To Address"
            name="toAddress"
            value={this.state.toAddress}
            onChange={this.handleChange}
            error={this.state.addressError}
            placeholder="osmo1ya403hmh5ehj2qp6uf0pa672ynjguc7aea4mpk"
          />
        </div>
        <div className="form-item">
          <Input
            label="Amount (OSMO)"
            name="amount"
            type="number"
            value={this.state.amount}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Gas Limit (UOSMO)"
            name="gas"
            type="number"
            value={this.state.gas}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Fee (UOSMO)"
            name="fee"
            type="number"
            value={this.state.fee}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Memo"
            name="memo"
            type="text"
            value={this.state.memo}
            onChange={this.handleChange}
          />
        </div>
        <Button label="Create Transaction" onClick={this.handleCreate}  />
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

export default withRouter(TransactionForm);
