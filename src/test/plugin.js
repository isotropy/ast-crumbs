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
    id: "sort",
    name: "sort",
    type: "CallExpression",
    follows: ["root", "filter"],
    builder: (src, args) => ({ ...src, ...args }),
    args: path => ({ slice: true })
  },
];

const analyzer = crumbs(
  nodeDefinitions,
  isRoot
);

export default function getPlugin() {
  let result;
  return {
    plugin: {
      visitor: {
        CallExpression(path) {
          result = analyzer(path, ["filter", "slice", "sort"]);
          if (result) {
            path.skip();
          }
        }
      }
    },
    getResult() {
      return result;
    }
  }
}
