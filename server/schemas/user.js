const location = {
  country: {
    type: 'String',
    default: null,
  },
  region: {
    type: 'String',
    default: null,
  },
  eu: {
    type: 'String',
    default: null,
  },
  timezone: {
    type: 'String',
    default: null,
  },
  city: {
    type: 'String',
    default: null,
  },
  ll: {
    type: ['Number', 'Number'],
    default: null,
  },
  metro: {
    type: 'Number',
    default: null,
  },
  area: {
    type: 'Number',
    default: null,
  },
};

const spotify = {
  country: {
    type: 'String',
    default: null,
  },
  display_name: {
    type: 'String',
    default: null,
  },
  email: {
    type: 'String',
    default: null,
  },
  explicit_content: {
    type: 'Mixed',
    default: null,
  },
  external_urls: {
    type: 'Mixed',
    default: null,
  },
  followers: {
    type: 'Mixed',
    default: null,
  },
  href: {
    type: 'String',
    default: null,
  },
  id: {
    type: 'String',
    default: null,
  },
  images: {
    type: 'Mixed',
    default: null,
  },
  product: {
    type: 'String',
    default: null,
  },
  type: {
    type: 'String',
    default: null,
  },
  uri: {
    type: 'String',
    default: null,
  },
  accessToken: {
    type: 'String',
    default: null,
  },
  refreshToken: {
    type: 'String',
    default: null,
  },
};

const visualizer = {
  alwaysShowAlbumArtwork: {
    type: 'Boolean',
    default: false,
  },
  alwaysShowTrackInfo: {
    type: 'Boolean',
    default: false,
  },
  alwaysShowPlayerControls: {
    type: 'Boolean',
    default: false,
  },
  shuffleDesigns: {
    type: 'Boolean',
    default: true,
  },
  infinitePlay: {
    type: 'Boolean',
    default: true,
  },
  reduceFlashing: {
    type: 'Boolean',
    default: false,
  },
  volumeSensitivity: {
    type: 'Number',
    default: 1,
  },
  speed: {
    type: 'String',
    default: 'normal',
  },
  neon: {
    type: 'Boolean',
    default: false,
  },
  shuffleInterval: {
    minutes: {
      type: 'Number',
      default: 5,
    },
    tracks: {
      type: 'Number',
      default: 2,
    },
  },
  resolution: {
    type: 'String',
    default: 'auto'
  },
  retina: {
    type: 'Boolean',
    default: false,
  },
  resumeLastAudioSource: {
    type: 'Boolean',
    default: true,
  },
  lastAudioSource: {
    type: 'Mixed',
    default: null,
  },
};

const stripe = {
  paymentMethod: {
    type: 'Mixed',
    default: null,
  },

  customer: {
    type: 'Mixed',
    default: null,
  },
};

export default {
  joined: {
    type: 'Date',
    default: Date.now,
  },

  lastSeen: {
    type: 'Date',
    default: Date.now,
  },

  sessions: {
    type: 'Number',
    default: 1
  },

  phone: {
    type: 'String',
    default: null,
  },

  email: {
    type: 'String',
    default: null,
  },

  password: {
    type: 'String',
    default: null,
  },

  passwordResetCode: {
    type: 'String',
    default: null
  },

  tokens: {
    type: 'Mixed',
    default: () => {}
  },

  subscription: {
    type: 'ObjectId',
    ref: 'Subscription',
    default: null,
  },

  stripe,
  location,
  spotify,
  visualizer,
};
