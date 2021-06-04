import fsExtra from 'fs-extra';
import path from 'path';
const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
const configPath = `${__dirname}/config.json`;
class State {
    async save() {
        return fsExtra.outputJson(configPath, this.config);
    }

    async load() {
        if (!this.config) {
            if (!await fsExtra.pathExists(configPath)) {
                this.config = {};
            } else {
                this.config = await fsExtra.readJson(configPath);
            }
        }
        return this.config;
    }

    async get() {
        return this.load();
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
}

const state = new State();
export default state;
