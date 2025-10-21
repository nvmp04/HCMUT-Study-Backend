import { accountClient, studentClient, tutorClient } from "../config/db.js";

export class AccountService{
    async banUser(id){
        await accountClient.findOneAndUpdate({id},{
            $set: {banned: true}
        })
        return;
    }
    async unbanUser(id){
        await accountClient.findOneAndUpdate({id},{
            $set: {banned: false}
        })
        return;
    }
}
export const accountService = new AccountService();