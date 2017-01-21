async function getTodos(who) {
  return db.todos.filter(todo => todo.assignee === who);
}
