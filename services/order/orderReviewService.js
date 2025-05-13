const { OrderStatusInvalid } = require("../../constants/message");
const { OrderStatus } = require("../../constants/status");
const { NotificationType, NotificationActionType } = require("../../constants/type");
const { CommunicationService } = require("../communication/communicationService");

const Order = require("../../model").Order;
const User = require("../../model").User;
const Staff = require("../../model").Staff;
const Review = require("../../model").Review;

class OrderReviewService {
    communicationService;
    constructor() {
        this.communicationService = new CommunicationService();
    }

    async review(data, orderId) {
        let {order, customerUser, staff} = await this.prepare(orderId);
        if(!await this.validate(order)) return;

        let review = await this.updateReview(order, data);
        await this.updateStaff(data, staff);

        //noti
        this.noti(order, staff);
    }

    async updateStaff(data, staff) {
        let rateAvg = staff.rateAvg || 0;
        let newRate = (rateAvg + data.rate) / ((staff.countReview || 0) + 1);
        await Staff.update(
            {
                rateAvg: newRate,
                countReview: ((staff.countReview || 0) + 1)
            },
            {
                where: {
                    id: staff.id
                }
            }
        )
    }

    async updateReview(order, data) {
        await Review.create(
            {
                customerUserId: order.customerUserId,
                staffId: order.staffId,
                status: 1,
                orderId: order.id,
                rate: data.rate,
                note: data.note,
                storeId: order.storeId
            }
        )
    }

    async prepare(orderId) {
        let order = await Order.findByPk(
            orderId,
            {
                include: [
                    {
                        model: User,
                        as: "customerUser"
                    },
                    {
                        model: Staff,
                        as: "staff"
                    }
                ]
            }
        );

        return {
            order: order,
            customerUser: order.customerUser,
            staff: order.staff
        }
    }

    async validate(order) {
        if(![OrderStatus.Finished].includes(order.status)) throw OrderStatusInvalid;

        return true;
    }

    async noti(order, staff) {
        try {
            await this.communicationService.sendNotificationToUserId(
                staff.userId,
                "Thông báo",
                `Khách hàng đánh giá dịch vụ của bạn.`,
                NotificationType.OrderDetail,
                {
                    actionType: NotificationActionType.OrderDetail.type
                },
                order.id
            );
        }
        catch (err) {
            console.error(err);
        }
        try {
            await this.communicationService.sendMobileNotification(
                staff.userId,
                "Thông báo",
                `Khách hàng đánh giá dịch vụ của bạn.`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    OrderReviewService
}