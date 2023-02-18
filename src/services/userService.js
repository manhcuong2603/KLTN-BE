import db from '../models/index';
import bcrypt from 'bcryptjs';
import allcode from '../models/allcode';
const salt = bcrypt.genSaltSync(10);

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


let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserMail(email);
            if (isExist) {
                //nếu người dùng đã tồn tại 

                let user = await db.User.findOne({  //email 2 là email cta truyền vào   
                    where: { email: email },
                    attributes: ['email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true
                });
                if (user) {
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password); // false
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = `ok`;

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = `Password sai`;
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User không tồn tại`;
                }
            } else {
                //return err
                userData.errCode = 1;
                userData.errMessage = `Email không tồn tại trong hệ thống`;
            }
            resolve(userData);
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserMail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllusers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)

        } catch (e) {
            reject(e)
        }
    })
}
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email
            let check = await checkUserMail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email đã được sử dụng'
                })
            } else {
                let hashPassordFromBcypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPassordFromBcypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })
                resolve({
                    errCode: 0,
                    message: 'OK',
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId }
        })
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: 'User không tồn tại'
            })
        }
        await db.User.destroy({
            where: { id: userId }
        })
        resolve({
            errCode: 0,
            errMessage: 'User đã bị xóa'
        })
    })
}
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log('check nodejs',data);
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.gender;
                if (data.avatar) {
                    user.image = data.avatar;
                }
                await user.save();
                resolve({
                    errCode: 0,
                    message: 'Update user thành công'
                })
                resolve({
                    errCode: 1,
                    message: 'user không tồn tại'
                });
            } else {
                resolve()
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);  //trả về res = data
            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllusers: getAllusers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
}