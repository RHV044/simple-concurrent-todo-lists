class Utils {

    static formatString(template, args) {
        return template.replace(
            /{(\w+)}/g,
            (placeholderWithDelimiters, placeholderWithoutDelimiters) => {
                return args.hasOwnProperty(placeholderWithoutDelimiters) ? args[placeholderWithoutDelimiters] : placeholderWithDelimiters;
            }
        );
    }

    static getUrlForPort(port) {
        return Utils.formatString("http://localhost:{port}/node", { port: port });
    }
}

module.exports = Utils