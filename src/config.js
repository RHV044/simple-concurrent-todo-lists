class Config {

    constructor() {
        this.isRegistry = false;
    }

    static setIsRegistry(isRegistry) {
        this.isRegistry = isRegistry;
    }
}

module.exports = Config