const path = require('path');
const util = require('../utils/util');
const Action = require('./action');

module.exports = class Book {
  constructor(dir, file, {
    valid = true,
  } = {}) {
    this.realpath = path.join(dir, file);
    this.fileName = file;
    this.dirname = dir;
    this.extname = path.extname(file).slice(1);
    this.fileNameNoExt = path.basename(file, path.extname(file));
    this.valid = valid;
    this.actions = [];
    if (valid) {
      this.actionLocked = false;
      this.hash = util.md5(this.realpath);
    } else {
      this.addAction(new Action({
        book: this,
        type: Action.TYPES.DELETE,
        handler: editor => editor.delete(this.realpath),
      }));
      this.actionLocked = true;
    }
  }

  addAction(action) {
    !this.actionLocked && this.actions.push(action);
  }

  clearActions() {
    !this.actionLocked && this.actions.clear();
  }
};
