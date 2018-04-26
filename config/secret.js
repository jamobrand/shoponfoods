module.exports = {

  database: 'mongodb://127.0.0.1:27017/shoponfoods',
  secret: "wacha2343k?,",

  facebook: {
    clientID: process.env.FACEBOOK_ID || '172851270015757',
    clientSecret: process.env.FACEBOOK_SECRET || '98025d0e4a3753e19b0e9db29603d5ed',
    profileFields: ['id', 'displayName', 'emails'],
    callbackURL: 'http://localhost:8000/auth/facebook/callback'
  },

  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '159726856122-ffkfrt7ql8chsqfgr573sbejci5nu8jv.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'N3AnNsnffOkxwumzNBAYOR2t',
    profileFields: ['id', 'displayName', 'emails'],
    callbackURL: 'http://localhost:8000/auth/google/callback'
  }


}
