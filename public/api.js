angular.module('app').factory('api', function ($http) {
    class ApiService {
        scan() {
            return $http.get('/api/scan').then((response) => {
                return response.data;
            });
        }

        connect(ssid, password) {
            return $http.post('/api/connect', undefined, { params: { ssid: ssid, password: password } });
        }

        setPsk(ssid, mac, psk) {
            return $http.post('/api/psk', undefined, { params: { ssid: ssid, mac: mac, psk: psk } });
        }
    }
    return new ApiService();
});
