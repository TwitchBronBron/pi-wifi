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

        setPskForMacAddress(macAddress, psk) {
            return $http.post('/api/config/psk', undefined, { params: { macAddress: macAddress, psk: psk } });
        }
    }
    return new ApiService();
});
