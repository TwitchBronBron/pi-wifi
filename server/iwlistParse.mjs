export function iwlistParse(str) {
    var out = str.replace(/^\s+/mg, '');
    out = out.split('\n');
    var cells = [];
    var line;
    var info = {};
    var fields = {
        mac: /^Cell \d+ - Address: (.*)/,
        ssid: /^ESSID:"(.*)"/,
        protocol: /^Protocol:(.*)/,
        mode: /^Mode:(.*)/,
        frequency: /^Frequency:(.*)/,
        encryptionKey: /Encryption key:(.*)/,
        bitrates: /Bit Rates:(.*)/,
        quality: /Quality(?:=|\:)([^\s]+)/,
        signalLevel: /Signal level(?:=|\:)([^\s]+)/
    };

    for (var i = 0, l = out.length; i < l; i++) {
        line = out[i].trim();

        if (!line.length) {
            continue;
        }
        if (line.match("Scan completed :$")) {
            continue;
        }
        if (line.match("Interface doesn't support scanning.$")) {
            continue;
        }

        if (line.match(fields.mac)) {
            cells.push(info);
            info = {};
        }

        for (var field in fields) {
            if (line.match(fields[field])) {
                info[field] = (fields[field].exec(line)[1]).trim();
            }
        }
    }
    cells.push(info);
    cells = cells.filter(x => {
        if (!x.ssid || !x.ssid?.trim() || x.ssid?.toString().includes('\x00')) {
            return false;
        } else {
            return true;
        }
    });

    cells.forEach((cell) => {
        cell.isSecure = cell.encryptionKey?.toLowerCase() === 'on';
    });
    return cells;
}
