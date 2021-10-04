const colors = require('colors');

/**
 * Logger class, used to log information throughout the module, 
 * in favour of repeated formatted console.log() statements.
 */
class Log {

  static Info(message) {
    console.log("[" + "PageBlocks".yellow + "] - " + message);
  }

  static Progress(message) {
    console.log("[" + "PageBlocks".cyan + "] - " + message);
  }

  static Success(message) {
    console.log("[" + "PageBlocks".green + "] - " + message);
  }
  
  static Error(message) {
    console.log("[" + "PageBlocks".red + "] - " + message);
  }

}

colors.enable();
module.exports = Log;