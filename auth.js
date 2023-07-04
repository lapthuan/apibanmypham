var GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("./models/userModel");
module.exports = (passport) => {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    UserModel.findById(id, function (err, user) {
      done(err, user);
    });
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(accessToken);
        console.log(profile);
        UserModel.findOne({ googleId: profile.id }, async function (err, user) {
          if (user) {
            const updatedUser = {
              firstname: profile.familyName,
              lastname: profile.givenName,
              email: profile.emails[0].value,
              // pic: profile.photos[0].value,
              refreshToken,
            };
            await UserModel.findOneAndUpdate(
              { _id: user.id },
              { $set: updatedUser },
              { new: true }
            ).then((result) => {
              return cb(err, result);
            });
          } else {
            const newUser = new UserModel({
              // googleId: profile.id,
              firstname: profile.familyName,
              lastname: profile.givenName,
              email: profile.emails[0].value,
              // pic: profile.photos[0].value,
              refreshToken,
            });
            newUser.save().then((result) => {
              return cb(err, result);
            });
          }
        });
      }
    )
  );
};
