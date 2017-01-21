function isRoot(path, state, config) {
  return path.isMemberExpression() && path.get("object").isIdentifier() ?
    config.identifiers.includes(path.node.object.name) :
    false;
}

function getRootArgs(path, state, config) {
  return { db: path.node.object.name, collection: path.node.property.name };
}

const nodeDefinitions = [
  {
    id: "root",
    type: "predicate",
    predicate: rootAnalyzer.isRoot,
    builder: collection => { collection },
    args: getRootArgs
  },
  {
    id: "filter",
    name: "filter",
    type: "CallExpression",
    follows: ["root", "sort"],
    builder: dbStatements.filter,
    args: getFilterArgs
  },
  {
    id: "slice",
    name: "slice",
    type: "CallExpression",
    follows: ["root", "filter", "sort", "map"],
    builder: dbStatements.slice,
    args: getSliceArgs,
  },
];

const plugin = {
  visitor: {
    CallExpression(path) {
      
    }
  }
}



export default function(opts) {
  let _analysis;
  let _state;

  const transformers = {
    read: {
      transformCallExpression(path, analysis, state) {
        _analysis = analysis;
        _state = state;
      },
      transformMemberExpression(path, analysis, state) {
        _analysis = analysis;
        _state = state;
      }
    },
    write: {
      transformAssignmentExpression(path, analysis, state) {
        _analysis = analysis;
        _state = state;
      }
    }
  }

  return {
    plugin: parserDb(
      transformers,
      opts.simple ?
        { identifiers: ["db"] } :
        { clientPackageName: 'isotropy-mongodb-client' }
      ),
    getResult: () => {
      return { analysis: _analysis, state: _state };
    }
  }
}
