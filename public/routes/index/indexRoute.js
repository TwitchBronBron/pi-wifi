class IndexRoute {
    constructor(api, $scope) {
        this.api = api;
        this.$scope = $scope;
        this.load();
    }

    handleError = (err) => {
        this.error = err?.data ?? e;
    };

    load() {
        delete this.error;
        this.api.scan().then((cells) => {
            this.cells = cells;
        }).catch(this.handleError);
    }

    connect(cell) {
        delete this.error;
        if (cell.isSecure) {
            var password = prompt('Please enter the password for this secure wifi network');
        }
        this.api.connect(cell.ssid, password).catch(this.handleError);
    }

    async setPsk(cell) {
        delete this.error;
        if (cell.isSecure) {
            var psk = prompt('Please enter the wifi password (leave empty to delete)');
            return this.api.setPsk(cell.ssid, cell.mac, psk).then(() => {
                cell.psk = psk;
            }).catch(this.handleError);
        }
    }
}

angular.module('app').component('indexRoute', {
    controller: IndexRoute,
    templateUrl: '/routes/index/indexRoute.html',
    controllerAs: 'vm'
});
