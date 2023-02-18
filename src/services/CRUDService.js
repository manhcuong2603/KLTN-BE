
import bcrypt from 'bcryptjs';
import db from '../models/index';
const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassordFromBcypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPassordFromBcypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })

            resolve('ok create new user ')

        } catch (e) {
            reject(e);
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassord = await bcrypt.hashSync(password, salt);
            resolve(hashPassord);
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = () => {
    return new Promise((resolve, reject) => {  //Promise:đợi resolve:đồng ý  , reject:từ chối
        try {
            let users = db.User.findAll({
                raw: true,
            });
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}
let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: true,
            })

            if (user) {
                resolve(user)
            } else {
                resolve({})
            }
        } catch (e) {
            reject(e);
        }
    })
}
let updateUserData = (data) => {  //update db
    // console.log('data form service');
    // console.log(data);
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: data.id }

            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();

                let allUsser = await db.User.findAll();
                resolve(allUsser);
            } else {
                resolve()
            }
        } catch (e) {
            console.log(e);
        }
    })
}
let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if (user) {
                await user.destroy();
            }

            resolve();
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    createNewUser: createNewUser,
    getAllUsers: getAllUsers,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById,
}