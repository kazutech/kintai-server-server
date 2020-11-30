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
  /*

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((claims) => {
      req.user = claims;
      if (claims.organization === true) {
        return db
          .collection("organization")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.group === true) {
        return db
          .collection("group")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.tenant === true) {
        return db
          .collection("tenant")
          .where("userID", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.staff === true) {
        return db
          .collection("staff")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      }
    })
    .then((data) => {
      if (req.user.organization === true) {
        req.user.type = "organization";
        req.user.childIds = data.docs[0].data().childIds;

      } else if (req.user.group === true) {
        req.user.type = "group";
        req.user.childIds = data.docs[0].data().childIds;

      } else if (req.user.tenant === true) {
        req.user.type = "tenant";
        req.user.childIds = data.docs[0].data().childIds;

      } else if (req.user.staff === true) {
        req.user.type = "staff";
        
      }
        req.user.userName = data.docs[0].data().userName;
        req.user.email = data.docs[0].data().email;
        req.user.userId = data.docs[0].data().userId;
      return;
    })
    .then(() => {
      return next();
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credantials,please try again" });
    });
  */

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((claims) => {
      req.user = claims;
      if (claims.organization === true) {
        return db
          .collection("organization")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.group === true) {
        return db
          .collection("group")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.tenant === true) {
        return db
          .collection("tenant")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      } else if (claims.staff === true) {
        return db
          .collection("staff")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      }
    })
    .then((data) => {
      if (req.user.organization === true) {
        req.user.type = "organization";
        req.user.email = data.docs[0].data().email;
        req.user.userName = data.docs[0].data().userName;
        req.user.userId = data.docs[0].data().userId;
        req.user.childIds = data.docs[0].data().childIds;
        req.user.address = data.docs[0].data().address;
        req.user.tel = data.docs[0].data().tel;
        req.user.status = data.docs[0].data().status;
        /*
        if (req.user.admin === true) {
          return db.collection;
        }
        */
      } else if (req.user.group === true) {
        req.user.type = "group";
        req.user.email = data.docs[0].data().email;
        req.user.userName = data.docs[0].data().userName;
        req.user.userId = data.docs[0].data().userId;
        req.user.childIds = data.docs[0].data().childIds;
        req.user.address = data.docs[0].data().address;
        req.user.tel = data.docs[0].data().tel;
        req.user.status = data.docs[0].data().status;
      } else if (req.user.tenant === true) {
        req.user.type = "tenant";
        req.user.email = data.docs[0].data().email;
        req.user.userName = data.docs[0].data().userName;
        req.user.userId = data.docs[0].data().userId;
        req.user.childIds = data.docs[0].data().childIds;
        req.user.address = data.docs[0].data().address;
        req.user.tel = data.docs[0].data().tel;
        req.user.status = data.docs[0].data().status;
      } else if (req.user.staff === true) {
        req.user.type = "staff";
        req.user.email = data.docs[0].data().email;
        req.user.userName = data.docs[0].data().userName;
        req.user.userId = data.docs[0].data().userId;
        req.user.address = data.docs[0].data().address;
        req.user.tel = data.docs[0].data().tel;
        req.user.status = data.docs[0].data().status;
      }
      console.log(req.user);
      return;
    })
    .then(() => {
      return next();
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credantials,please try again" });
    });
};

/*
module.exports = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
  let token;
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(data => {
      data;
    })
    .catch();
};
*/
