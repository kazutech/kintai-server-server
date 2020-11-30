const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("user")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.type = data.docs[0].data().type;
      let userId = req.user.uid;
      let additionalClaim;
      switch (req.user.type) {
        case "organization":
          additionalClaim = {
            organization: true
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "group":
          additionalClaim = {
            group: true
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "tenant":
          additionalClaim = {
            tenant: true
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "staff":
          additionalClaim = {
            staff: true
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
      }
    })
    .then(customToken => {
      req.headers.authorization = `Bearer ${customToken}`;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

exports.setCustomToken = (req, res) => {};

/*
req.user = claims;
      if (claims.organization === true) {
        return db.doc(`organization/${req.user.uid}`).get();
      } else if (claims.group === true) {
        return db.doc(`group/${req.user.uid}`).get();
      } else if (claims.tenant === true) {
        return db.doc(`tenant/${req.user.uid}`).get();
      } else if (claims.staff === true) {
        return db.doc(`staff/${req.user.uid}`).get();
      }
    )
    .then(doc => {
      if (doc.data().orgId) {
        req.user.groupIds = doc.data().groupIds;
      } else if (doc.data().groupId) {
        req.user.tenantIds = doc.data().tenantIds;
      } else if (doc.data().tenantId) {
        req.user.staffIds = doc.data().staffIds;
      } else if (doc.data().staffId) {
      }
      return firebase.auth().signInWithCustomToken(idToken);
    })
    .then(() => {
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });

      db.doc(`organization/${req.user.uid}`)
        .get()
        .then(doc => {
          if (doc.exists) {
            firebase.auth().signInWithCustomToken(idToken);
            req.user.handle = doc.data().handle;
          } else {
            return db.doc(`group/${req.user.uid}`).get();
          }
        })
        .then(doc => {
          if (doc.exists) {
            firebase.auth().signInWithCustomToken(idToken);
            req.user.handle = doc.data().handle;
          } else {
            return db.doc(`tenant/${req.user.uid}`).get();
          }
        })
        .then(doc => {
          if (doc.exists) {
            firebase.auth().signInWithCustomToken(idToken);
            req.user.handle = doc.data().handle;
          } else {
            return db.doc(`staff/${req.user.uid}`).get();
          }
        })
        .then(doc => {
          if (doc.exists) {
            firebase.auth().signInWithCustomToken(idToken);
            req.user.handle = doc.data().handle;
          }
        })
        .catch(err => {
          console.error("Something went wrong", err);
        });
    })
    .then(() => {
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
*/
