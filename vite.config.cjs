export default {
  build: {
    target: "es2019",
    minify: "terser",
    lib: {
      entry: __dirname + "/src/d3-dynamic-graph.js",
      name: "DynamicGraph",
      formats: ["es"],
    },
  },
};
