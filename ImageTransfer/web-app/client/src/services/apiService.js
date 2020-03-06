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
  queryDocRecord(userId, imgKey) { // doctor; encrypted imgKey
    return Api().post('queryDocRecord', {
      userId:userId,
      imgKey:imgKey
    })
  }
}