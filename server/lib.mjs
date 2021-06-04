import { networkInterfaces } from 'os';
import childProcess from 'child_process';
import { iwlistParse } from './iwlistParse.mjs';
import fsExtra from 'fs-extra';
import nodeUtil from 'util';
import state from './state.mjs';
import { config } from 'node:process';
import util from './util.mjs';

const exec = nodeUtil.promisify(childProcess.exec);

class Lib {
    /**
     * Get the list of IP addresses for this server
     */
    getIpAddresses() {
        const nets = networkInterfaces();
        const results = {};

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        return results;
    }

    async scan(iface) {
        console.log("iface!!!!!!!", iface);
        const result = await exec(`sudo iwlist ${iface} scan`);
        const cells = iwlistParse(result.stdout);
        await state.addScan(cells);
        // // const config = state.get();

        // //hydrate the cells with additional info
        // // for (const cell of cells) {
        // //     cell.psk = await state.getPsk(cell.ssid, cell.mac);
        // //     cell.isActive = cell.ssid === config.activeSSID;
        // // }
        // cells.sort((a, b) => a.ssid.localeCompare(b.ssid));
        // return cells;
    }

    async getScans() {
        return state.getScans();

        // // hydrate the cells with additional info
        // for (const cell of cells) {
        //     cell.psk = await state.getPsk(cell.ssid, cell.mac);
        //     cell.isActive = cell.ssid === config.activeSSID;
        // }
        // cells.sort((a, b) => a.ssid.localeCompare(b.ssid));
    }

    async testAll(iface) {
        //find all wifi and keep only the open ones
        var cells = await this.scan();
        var openCells = cells.filter(x => x.encryptionKey.toLowerCase() === 'off');
        this.test(iface, openCells[0].ssid);
    }

    /**
     * Connect to and test the wifi speed for the given ssid
     */
    async test(iface, ssid) {
        //connect the interface to the ssid
        await this.connect(iface, ssid);
        //run a speed test
    }

    /**
     * Connect a network interface to an ssid
     */
    async connect(iface, { ssid, password }) {
        //if there's no password, set key management to "none"
        if (!password) {
            var passwordLines = 'key_mgmt=NONE';
        } else {
            //set the wifi password if we have it
            var passwordLines = `psk="${password}"`;
        }
        state.set('activeSSID', ssid);
        await fsExtra.outputFile(`/etc/wpa_supplicant/wpa_supplicant-${iface}.conf`,
            util.trimLines(`
                ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
                update_config=1
                country=US
                network={
                    ssid="${ssid}"
                    ${passwordLines}
                }
            `)
        );
        //reload the wifi
        await exec(`wpa_cli -i ${iface} reconfigure || ( systemctl restart dhcpcd; wpa_cli -i ${iface} reconfigure; )`);
        return 'done';
    }
}
const lib = new Lib();
export default lib;
