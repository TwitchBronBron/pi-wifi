angular.module('app').config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(false)
    $urlRouterProvider.otherwise('/index');
    $stateProvider
        .state({
            name: 'index',
            url: '/index',
            component: 'indexRoute'
        })
})
