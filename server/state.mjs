import fsExtra from 'fs-extra';
import path from 'path';
import util from './util.mjs';

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
const configPath = `${__dirname}/config.json`;
class State {
    async save() {
        await fsExtra.outputJson(configPath, this.config);
    }

    async load() {
        try {
            this.config = await fsExtra.readJson(configPath);
        } catch (e) {
            //if the loading fails for any reason, log the error and start from scratch
            console.error(e);
            this.config = {};
        }
        return this.config;
    }

    async get() {
        return this.load();
    }

    async set(key, value) {
        await this.load();
        if (value === undefined) {
            delete this.config[key];
        } else {
            this.config[key] = value;
        }
        this.save();
    }

    async setPsk(ssid, mac, psk) {
        console.log('setPsk', ssid, mac, psk);
        await this.load();
        this.config.passwords = this.config.passwords ?? {};
        const key = ssid && mac ? `${ssid}/${mac}` : undefined;
        if (!key) {
            throw new Error('ssid and mac are required');
        }
        if (psk) {
            //store the psk
            this.config.passwords[key] = psk;
        } else {
            //remove the entry
            delete this.config.passwords[key];
        }
        await this.save();
    }

    async getPsk(ssid, mac) {
        const key = ssid && mac ? `${ssid}/${mac}` : undefined;
        await this.load();
        const result = this.config.passwords?.[key];
        return result;
    }

    async clearScans() {
        await this.load();
        this.config.scans = undefined;
        // await this.save();
    }

    async addScan(cells) {
        await this.load();
        this.config.scans = this.config.scans ?? {};
        for (const cell of cells) {
            const key = util.getCellKey(cell);
            const scan = this.config.scans[key] ?? {
                ...cell,
                signalLevel: [],
                quality: []
            };
            scan.signalLevel.push(cell.signalLevel);
            scan.quality.push(cell.quality);

            this.config.scans[key] = scan;
        }
        this.save();
    }

    async getScans() {
        await this.load();
        return Object.values(this.config.scans ?? {});
    }

    async clearScans() {
        if (this.config) {
            this.config.scans = {};
        }
        await this.save();
    }
}

const state = new State();
export default state;
