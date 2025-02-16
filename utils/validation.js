const EmailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const PhoneRegex = /^[+]?[0-9]+$/g;

class Validation {
    constructor() {}

    static checkValidPhoneFormat(phone) {
        if(!phone) return false;
    
        return PhoneRegex.test(phone)
    }

    static checkValidEmailFormat(email) {
        if(!email) return false;

        return EmailRegex.test(email);
    }
}

module.exports = {
    Validation
}