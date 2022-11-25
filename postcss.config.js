import nesting from "postcss-nesting";

export default {
  plugins: [
    // Some plugins, like postcss-nested, need to run before Tailwind
    nesting(),
  ],
};
