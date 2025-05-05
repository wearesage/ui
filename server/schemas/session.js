export default {
  user: {
    type: 'ObjectId',
    ref: 'User',
  },

  date: {
    type: 'Date',
    default: Date.now,
  },

  location: {
    type: 'Mixed',
  },

  userAgent: {
    type: 'String',
  },

  ip: {
    type: 'String',
  },
};
