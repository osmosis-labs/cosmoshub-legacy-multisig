import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";
import Input from "../inputs/Input";
import {checkAddressOsmoValid} from "../../lib/txCheck";
import util from "util";

class FindMultisigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      keyError: "",
      processing: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSearch = async () => {
    this.setState({ processing: true });

    //basic check
    if(!checkAddressOsmoValid(this.state.address)){
      window.alert(util.format("Invalid %s address format", process.env.NEXT_PUBLIC_CHAIN_NAME.toLowerCase()));
      this.state.address = "";
      this.setState({ processing: false });
      return null;
    }

    this.props.router.push(`/multi/${this.state.address}`);
  };

  render() {
    return (
      <StackableContainer>
        <StackableContainer lessPadding>
          <p>
            Already have a multisig address? Enter it below. If it’s a valid
            address, you will be able to view its transactions and create new
            ones.
          </p>
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
          <Input
            onChange={this.handleChange}
            value={this.state.address}
            label="Multisig Address"
            name="address"
            placeholder="osmo1ya403hmh5ehj2qp6uf0pa672ynjguc7aea4mpk"
          />
          <Button
            label="Use this Multisig"
            onClick={this.handleSearch}
            primary
          />
        </StackableContainer>
        <StackableContainer lessPadding>
          <p className="create-help">Don't have a multisig?</p>
          <Button
            label="Create New Multisig"
            onClick={() => this.props.router.push("create")}
          />
        </StackableContainer>
        <style jsx>{`
          .multisig-form {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .error {
            color: coral;
            font-size: 0.8em;
            text-align: left;
            margin: 0.5em 0;
          }
          .create-help {
            text-align: center;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default withRouter(FindMultisigForm);
