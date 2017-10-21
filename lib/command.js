const BaseCommand = require('common-bin/lib/command');

require('colors');

const util = require('./utils/util');
const helper = require('./utils/helper');

class Command extends BaseCommand {
  constructor(rawArg) {
    super(rawArg);

    this.name = 'booking';
    this.parseOptions = {
      execArgv: true,
      removeAlias: true,
    };

    this.log = this.log.bind(this);
    Object.assign(this.helper, helper, util);
  }

  get ctx() {
    const ctx = super.context;
    ctx.argv.$0 = undefined;
    return ctx;
  }

  * run(ctx) {
    ctx.ebookDir = yield this.findEbookDir();
    ctx.books = yield this.findBooks(ctx.ebookDir);
  }

  log(...args) {
    args[0] = `[${this.name}]`.blue + args[0];
    console.log(...args);
  }

  exit() {
    process.exit(-1);
  }
}

module.exports = Command;
