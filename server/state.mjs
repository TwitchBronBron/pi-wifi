import fsExtra from 'fs-extra';
import path from 'path';
const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
const configPath = `${__dirname}/config.json`;
class State {
    async set(config) {
        return fsExtra.outputJson(configPath, config);
    }

    async get() {
        if (!await fsExtra.pathExists(configPath)) {
            return {};
        } else {
            return fsExtra.readJson(configPath);
        }
    }

    async setPskForMacAddress(macAddress, psk) {
        const config = await this.get();
        config.pskMap = config.pskMap ?? {};
        if (psk) {
            //store the psk
            config.pskMap[macAddress] = psk;
        } else {
            //remove the psk and mac entry
            delete config.pskMap[macAddress];
        }
        this.set(config);
    }
}

const state = new State();
export default state;
