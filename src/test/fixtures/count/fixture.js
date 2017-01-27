async function getAll(who) {
  return db.todos.filter(todo => todo.assignee === who).length;
}
