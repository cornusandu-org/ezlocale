export function format(msg, format = undefined, ...fmt) {
    let i = 0;

    let str1 = String(msg).replace(/%[sdihf%]/g, token => {
        if (token === "%%") return "%";
        const arg = fmt[i++];

        switch (token) {
            case "%s": return String(arg);
            case "%d":
            case "%i": return Number.parseInt(arg, 10);
            case "%h": return "0x" + Number.parseInt(arg, 10).toString(16);
            case "%f": return Number.parseFloat(arg);
            default:
                return token;
        }
    });

    if (i < fmt.length) {
        str1 = str1 + " " + fmt.slice(i).join(" ");  // concatenate remaining arguments to the formatted string (if any; seperated by spaces)
    }

    let str2 = str1;

    if (format === undefined) return str2;

    for (const [key, value] of Object.entries(format)) {
        if (key === null || key === undefined) continue;
        str2 = str2.replaceAll(`{{${String(key)}}}`, String(value));
    }

    return str2;
}
