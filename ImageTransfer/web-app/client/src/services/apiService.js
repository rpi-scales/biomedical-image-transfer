import Api from '@/services/api'

export default {
    updateImageKey(userId, picked, imgKey) {
        return Api().post('updateImageKey', {       
        userId: userId,
        picked: picked,
        imgKey: imgKey
        })
    },
    queryAll() {
        return Api().get('queryAll')
    },
    queryByDoctor() {
        return Api().get('queryByDoctor')
    },
    registerUser(userId, firstName, lastName, type) {
        return Api().post('registerUser', {
        userId:userId,
        firstName:firstName,
        lastName:lastName,
        type:type
        })
    },
    validateUser(userId) {
        return Api().post('validateUser', {
        userId:userId
        })
    },
    decryptContent(userId, patientId, encrypted) { // doctor; encrypted imgKey
        return Api().post('decryptContent', {
        userId: userId,
        patientId: patientId,
        encrypted: encrypted
        })
    },
    encryptContent(userId, picked, buffer) {
        return Api().post('encryptContent', {
        userId: userId,
        picked: picked, 
        buffer: buffer
        })
    },
    giveAccessTo(userId, picked) {
        return Api().post('giveAccessTo', {
        userId: userId,
        picked: picked
        })
    },
    queryPatients(doctorId) {
        return Api().post('queryPatients', {
        doctorId: doctorId
        })
    },
    fetchRecord(doctorId, patientId) {
        return Api().post('fetchRecord', {
        doctorId:doctorId,
        patientId: patientId
        })
    },
    shareInfowith(userId, doctorId, patientId) {
        return Api().post('shareInfowith', {
        userId: userId,
        doctorId: doctorId,
        patientId: patientId
        })
    }
}