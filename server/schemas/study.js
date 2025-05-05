export default {
  author: {
    type: 'ObjectId',
    ref: 'User',
  },

  iterations: [
    {
      type: 'ObjectId',
      ref: 'Iteration',
    },
  ],

  public: {
    type: 'Boolean',
    default: false,
  },

  created: {
    type: 'Date',
    default: Date.now,
  },

  updated: {
    type: 'Date',
    default: Date.now,
  },
};
