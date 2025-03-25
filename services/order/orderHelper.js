const ScheduleOrderTimer = process.env.SCHEDULE_ORDER_TIMER || 1000 * 60 * 30; // 30 minutes

class OrderHelper {
    constructor() {}

    async scheduleChecker(timerTime) {
        try {
            let current = new Date();
            let time = !(timerTime instanceof Date) ? new Date(timerTime) : timerTime;
            if(!time) return false;
            if(time && time < new Date(current.getTime() + ScheduleOrderTimer)) return false;

            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
}

module.exports = {
    OrderHelper
}