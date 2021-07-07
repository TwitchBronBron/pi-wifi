
class Util {
    /**
     * @param { {ssid:string; channel:number; mac: string} } cell
     */
    getCellKey(cell) {
        if (cell && cell.ssid && cell.mac && cell.channel) {
            return `${cell.ssid}~${cell.mac}~${cell.channel}`;
        } else {
            return undefined;
        }
    }

    trimLines(text) {
        return text.split(/[\r\n]/g).map(x => x.trim()).join('\n');
    }

}
const util = new Util();
export default util;
