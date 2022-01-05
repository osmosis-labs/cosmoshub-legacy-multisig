const addressAmino = ["validator_address", "delegator_address", "from_address", "to_address", "validator_src_address", "validator_dst_address"]
const addressConversion = ["validatorAddress", "delegatorAddress", "fromAddress", "toAddress", "validatorSrcAddress", "validatorDstAddress"]

/**
 * check if address is valid
 * @param {String} address 
 */
const checkAddressOsmoValid = (address) => {
    // check prefix of address
    let prefix = process.env.NEXT_PUBLIC_PREFIX + 1;
    if(address.includes(prefix)){
      return true;
    }

    return false;
}

/**
 * check if validator address is valid
 * @param {String} address 
 */
const checkValidatorAddressOsmoValid = (address) => {
    // check prefix of address
    let prefix = process.env.NEXT_PUBLIC_PREFIX + "valoper1";
    if(address.includes(prefix)){
      return true;
    }

    return false;
}

const checkMsg = (msgValue) => {
    // check batch address to see if they are legit
    for (const address of addressAmino) {
        if(!(address in msgValue)) continue;
  
        if(address.includes("validator"))
          if(!checkValidatorAddressOsmoValid(msgValue[address])){
            throw new Error("Invalid field " + address + ". Please Check Again!");
          }else{
            continue;
          }
  
  
        if(!checkAddressOsmoValid(msgValue[address])){
          //pop up invalid form to user
          throw new Error("Invalid field " + address + ". Please Check Again!");
        }
    }
}

export {
    checkAddressOsmoValid, 
    checkValidatorAddressOsmoValid, 
    checkMsg,
    addressAmino,
    addressConversion,
}