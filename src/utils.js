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

    /**
     * Receives an array of objects and groups-by a given object key.
     * Returns an new object consisting of the grouped objects.
     *
     * Example of a group-by title:
     * [
     *     {id: 1, title: A},
     *     {id: 2, title: B},
     *     {id: 3, title: A}
     * ]
     *
     * Returns:
     * {
     *     A: [{id: 1, title: A}, {id: 3, title: A}],
     *     B: [{id: 2, title: B}]
     * }
     */
    static groupBy(array, key) {
        return array.reduce((acc, obj) => {
        const property = obj[key];
        acc[property] = acc[property] || [];
        acc[property].push(obj);
        return acc;
        }, {});
    }

    static flatMap(xs, f) {
        return xs.reduce((r, x) => r.concat(f(x)), [])
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