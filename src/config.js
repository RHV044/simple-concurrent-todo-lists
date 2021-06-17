class Config {

    constructor() {
        this.isRegistry = false;
    }

    static getRegistryPort() {
        return 9000;
    }

    static setIsRegistry(isRegistry) {
        this.isRegistry = isRegistry;
    }
}

module.exports = Config