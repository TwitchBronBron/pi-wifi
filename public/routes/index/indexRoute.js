class IndexRoute {
    constructor(api, $scope) {
        this.api = api;
        this.$scope = $scope;
        this.load();
    }

    load() {
        this.api.scan().then((cells) => {
            this.cells = cells;
        });
    }

    connect(cell) {
        delete this.error;
        if (cell.isSecure) {
            var password = prompt('Please enter the password for this secure wifi network');
        }
        this.api.connect(cell.ssid, password).catch((e) => {
            this.error = e.data ?? e;
        });
    }
}

angular.module('app').component('indexRoute', {
    controller: IndexRoute,
    templateUrl: '/routes/index/indexRoute.html',
    controllerAs: 'vm'
});
