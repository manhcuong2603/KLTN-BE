import db from '../models/index';
import _, { reject } from 'lodash'
require('dotenv').config();
const MAX_NUNBER_SCHEDULE = process.env.MAX_NUNBER_SCHEDULE;
const getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: { //hàm k trả về
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}
const getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: { //hàm k trả về
                    exclude: ['password', 'image']
                },
            })

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}
const saveDetailInforDoctor = (inputData) => {
    console.log('======', inputData)
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.doctorId || !inputData.contentHTML
                || !inputData.contentMarkdown || !inputData.action) {
                // console.log('------------------------', inputData);
                resolve({
                    errCode: 1,
                    errMessage: 'missing required parameter!',
                })

            } else {
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false // sequelize laf 1 obj
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        await doctorMarkdown.save()
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor Doctor success!'
                })

            }
        } catch (e) {
            reject(e)
        }
    })
}
const getDetailDoctorById = (inputId) => {
    // console.log('=======', inputId);
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: -1,
                    errCode: 'missing required parameter!'
                })
            } else {

                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: { //hàm k trả về
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        }, //lấy về
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');

                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
const bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parama'
                })
            } else {
                let schedule = data.arrSchedule
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumBer = MAX_NUNBER_SCHEDULE;
                        return item;
                    })
                }

                //check trùng lịch cùng 1 người
                //get date đã tồn tại
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                });

                //convert lại date
                if (existing && existing.length > 0) {
                    existing = existing.map(item => {
                        item.date = new Date(item.date).getTime();
                        return item
                    })
                }
                //check mảng truyển lên và mảng đã tồn tại
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === b.date;
                });
                //nêu khác thì create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(schedule)
                }
                console.log('check data bluck', schedule);
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
const getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    }
                })
                if (!dataSchedule) dataSchedule = [];
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate
}