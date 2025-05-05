import { addDays } from 'date-fns';

export default {
  user: {
    type: 'ObjectId',
    ref: 'User'
  },
  
  active: {
    type: 'Boolean',
    default: true
  },

  started: {
    type: 'Date',
    default: Date.now
  },

  ended: {
    type: 'Date',
    default: null
  },

  validThru: {
    type: 'Date',
    default () {
      return addDays(new Date(), 30)
    }
  },

  invoices: [{
    type: 'ObjectId',
    ref: 'Invoice'
  }],
}