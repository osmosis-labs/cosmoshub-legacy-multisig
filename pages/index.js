import FindMultisigForm from "../components/forms/FindMultisigForm";
import Page from "../components/layout/Page";
import StackableContainer from "../components/layout/StackableContainer";

export default () => (
  <Page>
    <StackableContainer base>
      <StackableContainer lessPadding>
        <h1 className="title">{process.env.NEXT_PUBLIC_CHAIN_NAME.charAt(0).toUpperCase() + process.env.NEXT_PUBLIC_CHAIN_NAME.toLowerCase().slice(1)} Multisig Manager</h1>
      </StackableContainer>
        <FindMultisigForm />
    </StackableContainer>
  </Page>
);
