import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';
import lib from './lib.mjs';
import state from './state.mjs';

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
const ifaces = {
    persistent: 'wlan0',
    scan: 'wlan1',
    hotspot: 'wlan2'
};

const app = fastify({ logger: false });

//serve the public folder
app.register(fastifyStatic, {
    root: path.join(__dirname, '../public')
});

app.get('/api/info', async () => {
    return lib.getIpAddresses();
});

app.get('/api/scan', async () => {
    return await lib.scan(ifaces.scan);
});

app.post('/api/connect', async (request) => {
    return await lib.connect(ifaces.persistent, request.query);
});

app.post('/api/config/psk', async (request) => {
    return await state.setPskForMacAddress(request.macAddress, request.psk);
});

app.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err;
})
