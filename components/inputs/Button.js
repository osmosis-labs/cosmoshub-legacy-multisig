const Button = (props) => (
  <>
    {props.href ? (
      <a
        className={props.primary ? "primary button" : "button"}
        href={props.href}
        disabled={props.disabled}
        target="_blank"
      >
        {props.label}
      </a>
    ) : (
      <button
        className={props.primary ? "primary button" : "button"}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.label}
      </button>
    )}
    <style jsx>{`
      .button {
        display: block;
        border-radius: 10px;
        background: #0A19C9;
        border: none;
        padding: 12px 0;
        font-size: 1rem;
        color: white;
        
        margin-top: 20px;
        text-decoration: none;
        text-align: center;
      }
      .primary {
        border: 0px solid white;
      }

      button:first-child {
        margin-top: 0;
      }
      button:disabled {
        opacity: 0.5;
        cursor: initial;
      }
    `}</style>
  </>
);

export default Button;
