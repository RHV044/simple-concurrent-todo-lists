class ClusterPortsRepository {

    constructor() {
        this.ports = [];
    }

    list() {
        return this.ports;
    }

    add(port) {
        if (this.exists(port)) return
        this.ports.push(port)
    }

    remove(port) {
        if (!this.exists(port)) return
        let index = this.ports.indexOf(port)
        this.ports.splice(index, 1)
    }

    exists(port) {
        return this.ports.indexOf(port) >= 0
    }
}

module.exports = ClusterPortsRepository