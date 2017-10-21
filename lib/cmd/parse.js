const path = require('path');
const fs = require('mz/fs');
const debug = require('debug')('ebook-master');
const memEditor = require('mem-fs-editor');
const memFs = require('mem-fs');
const md5 = require('md5');

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
    this.writeFileNameTask(cwd, books);
    // yield this.logBookMeta(books);
    yield this.writeDuplicateBooks(cwd, books);
  }

  * writeDuplicateBooks(cwd, books) {
    const bucket = {};
    books.forEach((book) => {
      const {
        size,
      } = book;
      if (!bucket[size]) bucket[size] = [];
      bucket[size].push(book);
    });
    const duplicatedSizes = Object.keys(bucket).filter(size => bucket[size].length > 1);
    fs.writeFileSync(path.join(cwd, './duplicate.txt'), `total: ${duplicatedSizes.length} \r\n${duplicatedSizes.map((size, index) => {
      const items = bucket[size].map(book => book.fileName);
      return items.reduce((acc, item) => {
        acc += ` -- ${item}\r\n`;
        return acc;
      }, ` [$ {
      index
    }]\ r\ n `);
    })}`, {
      flag: 'w',
    });
  }

  * logBookMeta(books) {
    const subBooks = books.filter(book => book.valid).slice(0, 20);
    yield Promise.all(subBooks.map(book => new Promise((r) => {
      this.bookParser.getBookMeta(book.realpath).then(() => {
        this.log(`${book.fileName} ======== \r\n`);
        r();
      });
    })));
  }

  writeFileNameTask(cwd, books) {
    this.log('files: ', books.length);
    for (let i = 2042; i < books.length; i += 10) {
      this.log(`process ${i}-${i + 10} files....`);
      fs.writeFileSync(path.join(cwd, 'files.txt'), books.slice(i, i + 10).map((book, index) => {
        const {
          realpath,
          fileName,
          extname,
          size,
        } = book;
        const hash = size > 100000000 ? 'hash' : md5(fs.readFileSync(realpath));
        this.log(` -- complete process ${index} file`.green);
        return `${fileName}|${extname}|${size}|${hash}|${realpath}`;
      }).join('\r\n'), {
        flag: 'a',
      });
    }
  }
}


module.exports = ParseCommand;
