npm run build;
sed '/Cannot create Schema containing two/ d' ./dist/dynamicgraph.js > ./dist/dynamicgraph.es.js
