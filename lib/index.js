const path = require('path');
const Command = require('./command');

class BookingCommand extends Command {
  constructor(rawArg) {
    super(rawArg);
    this.name = 'booking';
    this.usage = 'Usage: booking [command] [options]';

    this.load(path.join(__dirname, 'cmd'));
  }
}

module.exports = BookingCommand;
