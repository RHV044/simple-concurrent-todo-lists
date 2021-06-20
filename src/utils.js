class Utils {

    static formatString(template, args) {
        return template.replace(
            /{(\w+)}/g,
            (placeholderWithDelimiters, placeholderWithoutDelimiters) => {
                return args.hasOwnProperty(placeholderWithoutDelimiters) ? args[placeholderWithoutDelimiters] : placeholderWithDelimiters;
            }
        );
    }

    static getNodeUrlForPort(port) {
        return `${this.getBaseUrlForPort(port)}/node`
    }

    static getBaseUrlForPort(port) {
        return Utils.formatString("http://localhost:{port}", { port: port });
    }
}

module.exports = Utils