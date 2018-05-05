module.exports = {

  database: 'mongodb://127.0.0.1:27017/shoponfoods',
  secret: "wacha2343k?,",

  facebook: {
    clientID: process.env.FACEBOOK_ID || '',
    clientSecret: process.env.FACEBOOK_SECRET || '',
    profileFields: ['id', 'displayName', 'emails'],
    callbackURL: 'http://localhost:8000/auth/facebook/callback'
  },

  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    profileFields: ['id', 'displayName', 'emails'],
    callbackURL: 'http://localhost:8000/auth/google/callback'
  }


}
