import crumbs from "../ast-crumbs";

function isRoot(path, state, config) {
  return path.isMemberExpression() && path.get("object").isIdentifier() && path.node.object.name === "db"
}

function getRootArgs(path, state, config) {
  return { db: path.node.object.name, collection: path.node.property.name };
}

const nodeDefinitions = [
  {
    id: "root",
    type: "predicate",
    predicate: isRoot,
    builder: args => ({ ...args }),
    args: getRootArgs
  },
  {
    id: "filter",
    name: "filter",
    type: "CallExpression",
    follows: ["root"],
    builder: (src, args) => ({ ...src, ...args }),
    args: path => ({ filter: true })
  },
  {
    id: "slice",
    name: "slice",
    type: "CallExpression",
    follows: ["root", "filter"],
    builder: (src, args) => ({ ...src, ...args }),
    args: path => ({ slice: true })
  },
  {
    id: "length",
    name: "length",
    type: "MemberExpression",
    follows: ["root", "filter"],
    builder: (src, args) => ({ ...src, length: true })
  }
];

const analyzer = crumbs(
  nodeDefinitions,
  isRoot
);

function analyze(path, result) {
  result.value = analyzer(path, ["filter", "slice", "length", "root"]);
  if (result.value) {
    path.skip();
  }
}

export default function getPlugin() {
  let result = {};
  return {
    plugin: {
      visitor: {
        CallExpression: path => analyze(path, result),
        MemberExpression: path => analyze(path, result)
      }
    },
    getResult() {
      return result;
    }
  }
}
