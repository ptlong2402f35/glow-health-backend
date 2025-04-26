
//Common
const UpdateDoneMessage = "UpdateDoneMessage";
const UpdateFailMessage = "UpdateFailMessage";
//Empty Info
const EmailEmpty = "EmailEmpty";
const UserPhoneEmpty = "UserPhoneEmpty";
const PasswordEmpty = "PasswordEmpty";
const PasswordNotMatch = "PasswordNotMatch";
const ConfirmPasswordNotMatch = "ConfirmPasswordNotMatch";
const InputInfoEmpty = "InputInfoEmpty";
//Existed Message
const ExistedEmail = "ExistedEmail";
const ExistedPhone = "ExistedPhone";
//Not Found Message
const UserNotFound = "UserNotFound";
const CustomerNotFound = "CustomerNotFound";
const PartnerNotFound = "PartnerNotFound";
const FormNotFound = "FormNotFound";
const OrderNotFound = "OrderNotFound";
const StaffNotFound = "StaffNotFound";

const TransactionNotFound = "TransactionNotFound";
const ProgramNotFound = "ProgramNotFound";

//Validate
const ClassStatusInvalid = "ClassStatusInvalid";
const OrderStatusInvalid = "OrderStatusInvalid";
const OrderTimerInvalid = "OrderTimerInvalid";
const EmailFormatNotValid = "EmailFormatNotValid";
const PhoneFormatNotValid = "PhoneFormatNotValid";
const AdminOrderCannotPaid = "AdminOrderCannotPaid";
const TimeExpiredAction = "TimeExpiredAction";
const ExpiredResetKey = "ExpiredResetKey";
const StaffBusy = "StaffBusy";

const NotConnectParent = "NotConnectParent";

const NotEnoughPermission = "NotEnoughPermission";
const NotOwnerOrder = "NotOwnerOrder";
const AdminOnly = "AdminOnly";

//active 
const UserNotActive = "UserNotActive";
const TeacherNotActive = "TeacherNotActive";
const ClassNotActive = "ClassNotActive";

//Payment
const PaymentMethodNotValid = "PaymentMethodNotValid";


//Trans
const TotalMoneyIsOver = "TotalMoneyIsOver";

module.exports = {
    UpdateDoneMessage,
    UpdateFailMessage,
    EmailEmpty,
    UserPhoneEmpty,
    PasswordEmpty,
    PasswordNotMatch,
    ConfirmPasswordNotMatch,
    InputInfoEmpty,
    ExistedEmail,
    ExistedPhone,
    UserNotFound,
    CustomerNotFound,
    StaffNotFound,
    FormNotFound,
    OrderNotFound,
    OrderStatusInvalid,
    OrderTimerInvalid,
    EmailFormatNotValid,
    PhoneFormatNotValid,
    AdminOrderCannotPaid,
    TimeExpiredAction,
    NotEnoughPermission,
    NotOwnerOrder,
    ExpiredResetKey,
    UserNotActive,

    AdminOnly,

    TransactionNotFound,
    TotalMoneyIsOver,
    ProgramNotFound,
    PaymentMethodNotValid,
    StaffBusy
}
