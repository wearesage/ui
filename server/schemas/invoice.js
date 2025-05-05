export default {
  user: {
    type: 'ObjectId',
    ref: 'User'
  },

  date: {
    type: 'Date',
    default: Date.now
  },

  stripe: {
    type: 'Mixed'
  }
}