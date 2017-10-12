const fs = require('fs');
const path = require('path');
const glob = require('glob');
const helper = require('common-bin/lib/helper');

const Book = require('../model/book');

const VALID_EXTS = ['.awz3', '.mobi', '.epub'];

class BookParser {
  constructor(ctx) {
    this.ctx = ctx;
    this.helper = helper;
    this.filters = [
      file => VALID_EXTS.indexOf(path.extname(file)) !== -1,
    ];
  }

  * parse() {
    const ebookDir = yield this.findEbookDir();
    const books = yield this.findBooks(ebookDir);
    return books;
  }

  * findBooks(ebookDir) {
    const files = glob.sync('**/*', {
      cwd: ebookDir,
      dot: true,
      nodir: false,
    });

    const [filterFiles, invalidFiles] = this.filterFiles(files.sort());
    const books = filterFiles.map(file => new Book(ebookDir, file));
    return books.concat(invalidFiles.map(file => new Book(ebookDir, file, { valid: false })));
  }

  filterFiles(files) {
    const invalidFiles = [];
    const filtedFiles = files.filter((file) => {
      const filtered = this.filters.some((filter) => {
        if (typeof filter === 'function') {
          return filter(file);
        } else if (typeof filter === 'string') {
          return file !== filter;
        } else if (''.toString.call(filter) === '[object RegExp]') {
          return !filter.test(file);
        }
        return true;
      });
      if (!filtered) invalidFiles.push(file);
      return filtered;
    });
    return [filtedFiles, invalidFiles];
  }

  getBookMeta(file) {
    return this.helper.spawn('ebook-meta', [file], {
      cwd: this.ctx.cwd,
      stdio: 'inherit',
    });
  }

  * findEbookDir() {
    const {
      argv,
      cwd,
    } = this.ctx;
    const dir = argv._[0] || argv.dir || '';
    const ebookDir = path.resolve(cwd, dir);
    if (!fs.existsSync(ebookDir)) {
      this.log(`${ebookDir} dir not exists!`);
      return this.exit();
    }
    if (fs.statSync(ebookDir).isFile()) {
      this.log(`${ebookDir} is a file, not a directory!`);
      return this.exit();
    }
    return ebookDir;
  }

  log(...args) {
    args[0] = `[${this.name}]`.blue + args[0];
    console.log(...args);
  }
}

module.exports = BookParser;
