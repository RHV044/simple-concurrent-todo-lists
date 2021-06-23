class Config {

    constructor() {
        this.isRegistry = false;
        this.selfPort = null;
    }

    static getRegistryPort() {
        return 9000;
    }

    static setIsRegistry(isRegistry) {
        this.isRegistry = isRegistry;
    }

    static setSelfPort(port) {
        this.selfPort = port;
    }

}

module.exports = Config