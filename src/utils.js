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

    static groupBy(array, key) {
        return array.reduce((acc, obj) => {
        const property = obj[key];
        acc[property] = acc[property] || [];
        acc[property].push(obj);
        return acc;
        }, {});
    }
}

module.exports = Utils