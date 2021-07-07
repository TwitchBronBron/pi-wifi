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

app.get('/api/scans', async () => {
    return await lib.getScans();
});

app.delete('/api/scans', async () => {
    await state.clearScans();
    return 'ok';
});

app.post('/api/connect', async (request) => {
    await lib.connect(ifaces.persistent, request.query);
    return 'ok';
});

app.post('/api/psk', async (request) => {
    await state.setPsk(request.query.ssid, request.query.mac, request.query.psk);
    return 'ok';
});

app.listen(80, '0.0.0.0', (err, address) => {
    //run scans at regular interval to get a better long-term picture of network quality
    setInterval(async () => {
        console.log('starting scan');
        await lib.scan(ifaces.scan);
        console.log('Scan complete');
    }, 5000);
    lib.scan(ifaces.scan);

    if (err) throw err;
})
