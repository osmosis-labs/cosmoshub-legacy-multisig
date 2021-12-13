import StackableContainer from "../layout/StackableContainer";

const MultisigHoldings = (props) => {
  const uatomToAtom = (uosmo) => {
    if (uosmo === 0) return 0;
    return uosmo / 1000000;
  };

  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        <span>{props.holdings} OSMO </span>
      </StackableContainer>
      <style jsx>{`
        span {
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};
export default MultisigHoldings;
