class IndexRoute {
    constructor(api, $scope, $interval) {
        this.api = api;
        this.$scope = $scope;
        this.isLoading = false;
        //refresh the page regularly to get latest scan data
        $interval(() => {
            this.load();
        }, 5000);
        this.load();
    }

    handleError = (err) => {
        this.error = err?.data ?? e;
    };

    average(values) {
        var total = 0;
        for (var i = 0; i < values.length; i++) {
            total += values[i];
        }
        return total / values.length;
    }

    load() {
        delete this.error;
        this.isLoading = true;
        this.api.getScans().then((cells) => {
            this.cells = cells;
            for (const cell of this.cells) {
                cell.scanCount = cell.signalLevel.length;
                cell.signalLevel = parseInt(this.average(cell.signalLevel));
                cell.quality = parseInt(this.average(cell.quality));
            }
        }).catch(this.handleError).then(() => this.isLoading = false);
    }

    connect(cell) {
        delete this.error;
        if (cell.isSecure) {
            var password = prompt('Please enter the password for this secure wifi network');
        }
        this.api.connect(cell.ssid, password).catch(this.handleError);
    }

    setPsk(cell) {
        delete this.error;
        if (cell.isSecure) {
            var psk = prompt('Please enter the wifi password (leave empty to delete)');
            return this.api.setPsk(cell.ssid, cell.mac, psk).then(() => {
                cell.psk = psk;
            }).catch(this.handleError);
        }
    }

    clearScans() {
        delete this.error;
        this.api.clearScans().catch(this.handleError).then(() => {
            this.load();
        });
    }
}

angular.module('app').component('indexRoute', {
    controller: IndexRoute,
    templateUrl: '/routes/index/indexRoute.html',
    controllerAs: 'vm'
});
