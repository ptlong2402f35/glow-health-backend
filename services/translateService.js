const DefaultErrorMessage = require("../resources/translation.json").message.error.UpdateFailMessage?.["vi"];
const DefaultSuccessMessage = require("../resources/translation.json").message.done.UpdateDoneMessage?.["vi"];

class TranslateService {
    lang;
    constructor(req) {
        this.lang = req?.header("lang") || "vi"; 
    }
    translateMessage(message, isSuccess) {
        try {
            return message?.[this.lang || "vi"] ? message?.[this.lang || "vi"] : (isSuccess ? DefaultSuccessMessage : DefaultErrorMessage);
        }
        catch (err) {
            console.error(err);
            return message;
        }
    }
}

module.exports = {
    TranslateService
}