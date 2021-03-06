/**
 * 图书搜索命令
 */

const Command = require('../command');

class SearchCommand extends Command {
  constructor(rawArg) {
    super(rawArg);

    this.name = 'booking-parser';
    this.usage = 'Usage: booking parse [dir] [options]';
    this.options = {
      dir: {
        type: 'string',
        desc: 'ebook storage dir',
      },
    };
  }

  get description() {
    return 'Ebook parse command';
  }

  * run(ctx) {
  }
}

module.exports = SearchCommand;
