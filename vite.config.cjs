export default {
  build: {
    target: "es2019",
    minify: "terser",
    lib: {
      entry: __dirname + "/src/dynamicgraph.js",
      name: "DynamicGraph",
      formats: ["es"],
    },
  },
};
