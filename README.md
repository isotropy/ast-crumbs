AST Crumbs
==========

Builds a data structure by traversing the AST (based on rules) of Fluent-style method invocations.

It can, for instance, analyze the AST similar to

```javascript
db.products.filter(u => u.buyer === "jeswin").slice(0, 10);
```

Traversal rules, aka nodeDefinitions

```javascript
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
```

In the above example, builder is invoked when a node matching a specific node-definition is found.
The follows fields specifies acceptable parent node types.

After defining the rules (nodeDefinitions), the analyzer can be constructed for use in a babel plugin

```javascript
const analyzer = crumbs(
  nodeDefinitions,
  isRoot
);

return {
  visitor: {
    CallExpression: path => analyzer(path, ["filter", "slice"]),
  }
}
```
