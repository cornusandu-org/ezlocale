export function format(msg, ...args) {
    let i = 0;

    const str = String(msg).replace(/%[sdihf%]/g, token => {
        if (token === "%%") return "%";
        const arg = args[i++];

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

    if (i < args.length) {
        return str + " " + args.slice(i).join(" ");  // concatenate remaining arguments to the formatted string (if any; seperated by spaces)
    }

    return str;
}
