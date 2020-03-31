import Api from '@/services/api'

export default {
  selectDoctor(userId, picked, imgKey) {
    return Api().post('selectDoctor', {       
      userId: userId,
      picked: picked,
      imgKey: imgKey
    })
  },
  queryAll() {
    return Api().get('queryAll')
  },
  queryByPatient() {
    return Api().get('queryByPatient')
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
  decryptContent(patientId, encrypted) { // doctor; encrypted imgKey
    return Api().post('decryptContent', {
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
  }
}