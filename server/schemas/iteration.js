export default {
  study: {
    type: 'ObjectId',
    ref: 'Study',
  },

  author: {
    type: 'ObjectId',
    ref: 'User',
  },

  shader: {
    type: 'String',
    required: true,
  },

  variants: [
    {
      type: 'Mixed',
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
