class ClusterPortsRepository {

    constructor() {
        this.ports = [];
    }

    list() {
        return this.ports;
    }

    add(port) {
        if (this.exists(port)) return;
        this.ports.push(port);
    }

    addAll(ports) {
        this.ports = this.ports.concat(ports);
    }

    remove(port) {
        if (!this.exists(port)) return;
        let index = this.ports.indexOf(port);
        this.ports.splice(index, 1)
    }

    exists(port) {
        return this.ports.indexOf(port) >= 0;
    }

    static getInstance() {
        if (!ClusterPortsRepository.instance) {
            ClusterPortsRepository.instance = new ClusterPortsRepository();
        }
        return ClusterPortsRepository.instance;
    }
}

module.exports = ClusterPortsRepository;