const EmailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PhoneNumberRegex = /^[0-9]+$/;
const HideNumberPercent = 0.7;

class DataMasking {
    constructor() {}

    process(input) {
        if(!input || !input?.length) return input;
        if(EmailRegex.test(input)) {
            let parts = input.split("@");
            let ret = [];
            let index = 0;
            for(let item of parts) {
                let hiddenStr = "";
                for(let i = 0; i < Math.round(item.length * HideNumberPercent); i++) {
                    hiddenStr += "*";
                }
                if(index % 2 === 0)
                {
                    ret.push(item.slice(0, Math.round(item.length * (1 - HideNumberPercent))) + hiddenStr);
                    index++;
                    continue;
                }
                index++;
                ret.push(hiddenStr + item.slice(Math.round(item.length * (1 - HideNumberPercent), item.length)));
            }

            return ret.join("@");
        }
        let hiddenStr = "";
        for(let i = 0; i < Math.round(input.length * HideNumberPercent); i++) {
            hiddenStr += "*";
        }
        console.log("input", input);
        return hiddenStr + input.slice(Math.round(input.length * (HideNumberPercent)), input.length);
    }
}

module.exports = {
    DataMasking
}