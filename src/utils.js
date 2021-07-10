var crypto = require('crypto');
class Utils {

    static getUrlForPort(port) {
        return `http://localhost:${port}`;
    }

    static getCurrentTime() {
        const date = new Date();
        return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
    }

    static log(message) {
        console.log(`${Utils.getCurrentTime()} >> ${message}`)
    }

    static generateListHash(list) {
        const stringList = JSON.stringify(list);
        var listHash = 0, i, char;

        for (i = 0; i < stringList.length; i++) {
          char = stringList.charCodeAt(i);
          listHash = ((listHash << 5) - listHash) + char;
          listHash |= 0; // Convert to 32bit integer
        }
        return listHash;
    }
}

module.exports = Utils