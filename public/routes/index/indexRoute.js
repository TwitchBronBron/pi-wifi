class IndexRoute {
    constructor(api, $scope, $interval) {
        this.api = api;
        this.$scope = $scope;
        //refresh the page regularly to get latest scan data
        $interval(() => {
            this.load();
        }, 1000);
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
        this.api.getScans().then((cells) => {
            this.cells = cells;
            for (const cell of this.cells) {
                cell.signalLevel = parseInt(this.average(cell.signalLevel));
                cell.quality = parseInt(this.average(cell.quality));
            }
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
