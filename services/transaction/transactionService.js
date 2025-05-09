var uuid = require("uuid");
const User = require("../../model").User;
const Transaction = require("../../model").Transaction;

const WalletNotEnoughMoneyException = 'WalletNotEnoughMoneyException';
const ChargeAmountInvalidException = "ChargeAmountInvalidException";
const TopupAmountInvalidException = "TopupAmountInvalidException";

class TransactionService {
    constructor() {}

    async getWalletUser(userId, transaction) {
        return await User.findByPk(userId, {
			attributes: ["id", "active", "phone", "totalMoney"],
			lock: true,
			transaction: transaction,
		});    
    }

    async chargeWallet(walletUser, data, transaction, opts) {
        if(!walletUser || !data.amount) return [];
        if(data.amount < 0) throw ChargeAmountInvalidException;
        if(!opts.skipCheckNegative) {
            if((walletUser.totalMoney || 0) < data.amount) throw WalletNotEnoughMoneyException;
        }
        let nAmount = Math.round((walletUser.totalMoney || 0) - data.amount);

        await walletUser.update(
            {
                totalMoney: nAmount,
            },
            {
                transaction
            }
        );

        let built = this.build(data);
        let trans = await Transaction.create(
            {
                ...built,
                add: false,
                ...(opts?.storeId && { storeId: opts.storeId }),
				...(opts?.staffId && { staffId: opts.staffId }),
            },
            {
                transaction,
            }
        );

        return trans;
    }

    async topupWallet(walletUser, data, transaction, opts) {
		if (!walletUser || !data.amount) return [];
		if (data.amount < 0) throw TopupAmountInvalidException;

		let nAmount = Math.round((walletUser.totalMoney || 0) + data.amount);
		await walletUser.update(
			{
				totalMoney: nAmount,
			},
			{
				transaction: transaction,
			},
		);
		
        let built = this.build(data);
        let trans = await Transaction.create(
            {
                ...built,
                money: data.amount,
                totalMoney: nAmount,
                add: true,
                ...(opts?.storeId && { storeId: opts.storeId }),
				...(opts?.staffId && { staffId: opts.staffId }),
            },
            {
                transaction,
            }
        );

		return trans;
	}

    build(data) {
        return {
            code: data.code || uuid.v4(),
            forUserId: data.forUserId,
            content: data.content,
            orderId: data.orderId,
            money: data.amount,
            totalMoney: data.totalMoney,
            userCreate: data.userCreate,
            success: true,
            add: data.add
        }
    }
}

module.exports = {
    TransactionService
}