import NextHead from "next/head";
import { string } from "prop-types";
import util from "util";

const defaultDescription =
  util.format("*:;;;:*:;;;:**:;;;:*:;;;:*%s MULTISIGN*:;;;:*:;;;:**:;;;:*:;;;:*", process.env.NEXT_PUBLIC_CHAIN_NAME.toUpperCase());
const defaultOGURL = "";
const defaultOGImage = "";

const Head = (props) => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>{props.title || ""}</title>
    <meta
      name="description"
      content={props.description || defaultDescription}
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:url" content={props.url || defaultOGURL} />
    <meta property="og:title" content={props.title || ""} />
    <meta
      property="og:description"
      content={props.description || defaultDescription}
    />
  </NextHead>
);

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  ogImage: string,
};

export default Head;
