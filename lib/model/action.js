class Action {
  constructor({
    book,
    handler,
    type,
  }) {
    this.book = book;
    this.type = type;
    this.handler = handler;
  }

  toString() {
    return `Action{type: ${this.type}, book: ${this.book.realpath}}`;
  }
}

Action.TYPES = {
  RENAME: 'RENAME',
  DELETE: 'DELETE',
  FORMAT: 'FORMAT',
};

module.exports = Action;
