const path = require('path');
const fs = require('fs');
const debug = require('debug')('ebook-master');
const memEditor = require('mem-fs-editor');
const memFs = require('mem-fs');

const Command = require('../command');
const BookParser = require('../model/parser');

class ParseCommand extends Command {
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
    this.bookParser = new BookParser(this.ctx);
  }

  get description() {
    return 'Ebook parse command';
  }

  * run(ctx) {
    const {
      cwd,
      argv,
      env,
    } = ctx;
    debug('current dir is [%s], \n argv is [%o], \n env is [%o] \n rawArgv', cwd, argv, env, this.rawArgv);
    // const fsEditor = memEditor.create(memFs.create());
    const books = ctx.books = yield this.bookParser.parse();
    this.log('files: ', books.length, ', files: ', books.slice(0, 5));
    fs.writeFileSync(path.join(cwd, 'files.txt'), books.map(book => book.fileName).join('\r\n'), {
      flag: 'w',
    });

    const subBooks = books.filter(book => book.valid).slice(0, 20);
    yield Promise.all(subBooks.map(book => new Promise((r) => {
      this.bookParser.getBookMeta(book.realpath).then(() => {
        this.log(`${book.fileName} ======== \r\n`);
        r();
      });
    })));
  }
}


module.exports = ParseCommand;
