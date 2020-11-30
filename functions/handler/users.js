const { admin, db } = require("../util/admin");

const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validataSignupData,
  validataSigninData,
} = require("../util/validators");

//Time
/*
let time;
const today =
  String(new Date().getFullYear()) +
  "-" +
  String(
    new Date().getMonth() + 1 < 10
      ? "0".concat(new Date().getMonth() + 1)
      : new Date().getMonth()
  ) +
  "-" +
  String(
    new Date().getDate() + 1 < 10
      ? "0".concat(new Date().getDate() + 1)
      : new Date().getDate()
  );
*/

//signUp&InForAllFunc

exports.signup = (req, res) => {
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

  const newUser = {
    orgName: req.body.orgName,
    email: req.body.email,
    confirmedEmail: req.body.confirmedEmail,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
    address: req.body.address,
    tel: req.body.tel,
  };

  console.log(req.body,newUser)

  const { valid, errors } = validataSignupData(newUser);

  console.log(valid)

  if (!valid) return res.status(400).json(errors);

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      const userData = {
        type: "organization",
        userId: req.user.uid,
      };
      return db.doc(`/user/${req.user.uid}`).set(userData);
    })
    .then(() => {
      const orgData = {
        userName: newUser.orgName,
        email: newUser.email,
        address: newUser.address,
        tel: newUser.tel,
        userId: req.user.uid,
        childIds: [],
        type: "organization",
        status: "inactive",
        createdAt: new Date(
          new Date().toUTCString().split(" GMT")[0].concat(" -0900")
        ).toISOString(),
      };
      return db.doc(`/organization/${req.user.uid}`).set(orgData);
    })
    .then(() => {
      let additionalClaim;
      additionalClaim = {
        organization: true,
      };
      return admin.auth().createCustomToken(req.user.uid, additionalClaim);
    })
    .then((token) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
    });
};

exports.signUpAsChild = (req, res) => {
  const newChild = {
    userName: req.body.childName,
    email: req.body.email,
    address: req.body.address,
    tel: req.body.tel,
    parentId: req.user.userId,
    userId: req.body.userId,
    childIds:[],
    createdAt: new Date(
      new Date().toUTCString().split(" GMT")[0].concat(" -0900")
    ).toISOString(),
    status: "inactive"
  };

  switch (req.user.type) {
    case "organization":
      newChild.type = "group";
      break;
    case "group":
      newChild.type = "tenant";
      break;
    case "tenant":
      newChild.type = "staff";
      break;
  }
  
  db.doc(`/user/${newChild.userId}`).set(newChild) 
    .then(() => {
      return db.doc(`/${newChild.type}/${newChild.userId}`).set(newChild) // group/uid
    })
    .then(() => {
      let timeline = []
      req.user.childIds.length === 0 && db.doc(`/${req.user.type}/${newChild.parentId}/children/${new Date(
        new Date().toUTCString().split(" GMT")[0].concat(" -0900")
        )
        .toISOString() // group/guid/children/2020-11-09/
        .slice(0, 10)}`).create({timeline,thisMonth:new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
        .toISOString()
        .slice(0, 7)})
      return db.doc(`/${newChild.type}/${newChild.userId}/date/${new Date(
        new Date().toUTCString().split(" GMT")[0].concat(" -0900")
        )
        .toISOString() // tenant/tuid/date/2020-11-09/
        .slice(0, 10)}`).create({timeline,thisMonth:new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
        .toISOString()
        .slice(0, 7)}) // group/guid/children/2020-11-09/
    })
    .then(() => {
      return db.doc(`/${req.user.type}/${req.user.userId}`).get()
    })
    .then((doc) => {
      let childIds = doc.data().childIds;
      childIds.push(newChild.userId);
      return doc.ref.update({childIds: childIds});
    })
    .then(() => {
      return res.json({ message: 'newchild successfully created'});
    })
    .catch((err) => {
      console.error(err);
    });
  /*
  firebase
    .auth()
    .createUserWithEmailAndPassword(newChild.email, newChild.password)
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(() => {
      const childCredentials = {
        email: newChild.email,
        address: newChild.address,
        tel: newChild.tel,
        createdAt: new Date(
          new Date().toUTCString().split(" GMT")[0].concat(" -0900")
        ).toISOString(),
      };

      if (req.user.organization === true) {
        (childCredentials.groupName = newChild.childName),
          (childCredentials.groupId = userId);
        db.doc(`/user/${childCredentials.groupId}`)
          .set({ type: "group", userId: childCredentials.groupId })
          .then(() => {
            return db
              .doc(`/group/${childCredentials.groupId}`)
              .set(childCredentials);
          })
          .then(() => {
            let additionalClaim;
            additionalClaim = {
              group: true,
            };
            return admin.auth().createCustomToken(userId, additionalClaim);
          })
          .then((token) => {
            return res.status(201).json({ token });
          });
      } else if (req.user.group === true) {
        (childCredentials.tenantName = newChild.childName),
          (childCredentials.tenantId = userId);
        db.doc(`/user/${childCredentials.tenantId}`)
          .set({ type: "tenant", userId: childCredentials.tenantId })
          .then(() => {
            return db
              .doc(`/tenant/${childCredentials.tenantId}`)
              .set(childCredentials);
          })
          .then(() => {
            let additionalClaim;
            additionalClaim = {
              tenant: true,
            };
            return admin.auth().createCustomToken(userId, additionalClaim);
          })
          .then((token) => {
            return res.status(201).json({ token });
          });
      } else if (req.user.tenant === true) {
        (childCredentials.staffName = newChild.childName),
          (childCredentials.staffId = userId);
        db.doc(`/user/${childCredentials.staffId}`)
          .set({ type: "staff", userId: childCredentials.staffId })
          .then(() => {
            return db
              .doc(`/staff/${childCredentials.staffId}`)
              .set(childCredentials);
          })
          .then(() => {
            let additionalClaim;
            additionalClaim = {
              staff: true,
            };
            return admin.auth().createCustomToken(userId, additionalClaim);
          })
          .then((token) => {
            return res.status(201).json({ token });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      if (err.code == "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({
          general: "Something went wrong, please try again",
        });
      }
    });
    */
};

exports.signInWithCT = (req, res) => {
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
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credantials,please try again" });
    });
};

/*
    case "staff":
      firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
          if (
            db
              .doc(`/staff/${data.user.uid}`)
              .get()
              .then(doc => {
                if (doc.exists) {
                  return true;
                } else {
                  return false;
                }
              })
          ) {
            let staffId = data.user.uid;
            let additionalClaims = {
              staff: true
            };
            admin
              .auth()
              .createCustomToken(staffId, additionalClaims)
              .then(customToken => {
                token = customToken;
                const userCredentials = {
                  handle: newUser.handle,
                  email: newUser.email,
                  createdAt: new Date().toISOString(),
                  imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
                  staffId
                };
                db.doc(`/staff/${req.params.staffId}`).set(userCredentials);
              });
          }
          return;
        })
        .then(token => {
          return firebase.auth().signInWithCustomToken(token);
        })
        .then(token => {
          return res.status(201).json({ token });
        })
        .catch(err => {
          console.error(err);
          if (err.code == "auth/email-already-in-use") {
            return res.status(400).json({ email: "Email is already in use" });
          } else {
            return res.status(500).json({
              general: "Something went wrong, please try again"
            });
          }
        });
      break;
    default:
      return;
  }
  */

/* 
diff btn => same login func => push diff link => thr dff mdwr
*/
/*
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      // auth/wrong-password
      // auth/user-not-user
      return res
        .status(403)
        .json({ general: "Wrong credantials,please try again" });
    });
};
*/
exports.signin = (req, res) => {
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
    .then((decodedToken) => {
      console.log(decodedToken);
      req.user = decodedToken;
      return db.collection("user").where("userId", "==", req.user.uid).get();
    })
    .then((data) => {
      req.user.type = data.docs[0].data().type;
      let userId = req.user.uid;
      let additionalClaim;
      switch (req.user.type) {
        case "organization":
          additionalClaim = {
            organization: true,
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "group":
          additionalClaim = {
            group: true,
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "tenant":
          additionalClaim = {
            tenant: true,
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
        case "staff":
          additionalClaim = {
            staff: true,
          };
          return admin.auth().createCustomToken(userId, additionalClaim);
      }
    })
    .then((token) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
    });
};

exports.setAdmin = (req, res) => {
  let adminUser;
  admin
    .auth()
    .setCustomUserClaims(req.user.uid, { admin: true })
    .then(() => {
      adminUser.authenticated = true;
      return db
        .collection(`${req.user.type}`)
        .doc(`${req.user.uid}`)
        .collection("admin")
        .doc("data")
        .set({ authenticated: true });
    })
    .then(() => {
      return;
    })
    .catch((err) => {
      console.error(err);
    });
};
/*
switch (user.type) {
    case "organization":
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          let orgId = data.user.uid;
          let additionalClaims = {
            organization: true
          };
          return admin.auth().createCustomToken(orgId, additionalClaims);
        })
        .then(token => {
          return firebase.auth().signInWithCustomToken(token);
        })
        .then(token => {
          return res.json({ token });
        })
        .catch(err => {
          console.error(err);
          return res
            .status(403)
            .json({ general: "Wrong credantials,please try again" });
        });
    case "group":
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          let groupId = data.user.uid;
          let additionalClaims = {
            group: true
          };
          return admin.auth().createCustomToken(groupId, additionalClaims);
        })
        .then(token => {
          return firebase.auth().signInWithCustomToken(token);
        })
        .then(token => {
          return res.json({ token });
        })
        .catch(err => {
          console.error(err);
          return res
            .status(403)
            .json({ general: "Wrong credantials,please try again" });
        });
    case "tenant":
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          let tenantId = data.user.uid;
          let additionalClaims = {
            tenant: true
          };
          return admin.auth().createCustomToken(tenantId, additionalClaims);
        })
        .then(token => {
          return firebase.auth().signInWithCustomToken(token);
        })
        .then(token => {
          return res.json({ token });
        })
        .catch(err => {
          console.error(err);
          return res
            .status(403)
            .json({ general: "Wrong credantials,please try again" });
        });
    case "staff":
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          let staffId = data.user.uid;
          let additionalClaims = {
            staff: true
          };
          return admin.auth().createCustomToken(staffId, additionalClaims);
        })
        .then(token => {
          return firebase.auth().signInWithCustomToken(token);
        })
        .then(token => {
          return res.json({ token });
        })
        .catch(err => {
          console.error(err);
          return res
            .status(403)
            .json({ general: "Wrong credantials,please try again" });
        });
*/

//makeChildFunc

exports.submitTime = (req, res) => {
  const submitForm = {
    submitTime: req.body.submitTime,
    submitStatus: req.body.submitStatus,
    type: req.body.type,
    userName: req.body.userName,
    userId: req.body.userId
  };
  console.log("hello")
  console.log(req.body);
  console.log(submitForm);
  db.collection(`${req.body.type}`)
    .doc(`/${req.body.userId}`)
    .collection("date")
    .doc(
      `/${new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
        .toISOString()
        .slice(0, 10)}`
    )
    .get()
    .then((doc) => {
      timeline = [];
      if (!doc.exists) {
        timeline.push(submitForm);
        db.collection(`${req.body.type}`)
          .doc(`${req.body.userId}`)
          .update({status: submitForm.submitStatus})
        db.collection(`${req.user.type}`)
          .doc(`${req.user.userId}`)
          .collection("children")
          .doc(`${new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
          .toISOString()
          .slice(0, 10)}`)
          .get()
          .then((doc) => {
            if(!doc.exists) {
              doc.ref.create({timeline,thisMonth:new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
              .toISOString()
              .slice(0, 7)})
            } else {
              return
            }
          })
          .catch((err) => { console.error(err)  })
        return doc.ref.create({ timeline });
      } else {
        timeline = doc.data().timeline;
        timeline.push(submitForm);
        return doc.ref.update({ timeline });
      }
    })
    .then(() => {
      return res.json({ message: "successfully submitted" });
    })
    .catch((err) => {
      console.error(err);
    });
};

/*

exports.makeStaffAsTenant = (req, res) => {
  const newStaff = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    staffHandle: req.body.staffHandle,
  };
  firebase
    .auth()
    .createUserWithEmailAndPassword(newStaff.email, newStaff.password)
    .then((data) => {
      staffId = data.user.uid;
      const userCredentials = {
        staffHandle: newStaff.staffHandle,
        email: newStaff.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
        staffId,
      };
      db.doc(`/staff/${req.params.staffId}`).set(userCredentials);
      db.doc(`/tenant/${req.user.tenantId}`)
        .get(staff)
        .then((doc) => {
          let staff = [];
          if (doc.exists) {
            staff = doc.data().staff;
          }
          staff.push({ tenantId: true });
          doc.ref.update(staff);
        });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};



exports.makeTenantAsGroup = (req, res) => {
  const newTenant = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    tenantHandle: req.body.tenentHandle,
  };
  firebase
    .auth()
    .createUserWithEmailAndPassword(newTenant.email, newTenant.password)
    .then((data) => {
      tenantId = data.user.uid;
      const userCredentials = {
        tenantHandle: newStaff.tenantHandle,
        email: newStaff.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
        tenantId,
      };
      db.doc(`/tenant/${req.params.tenantId}`).set(userCredentials);
      db.doc(`/group/${req.user.groupId}`)
        .get(tenant)
        .then((doc) => {
          let tenant = [];
          if (doc.exists) {
            tenant = doc.data().tenant;
          }
          tenant.push({ tenantId: true });
          doc.ref.update(tenant);
        });
      return;
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.makeGroupAsOrganization = (req, res) => {
  const newGroup = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    groupName: req.body.groupName,
    address: req.body.address,
    tel: req.body.tel,
    orgId: req.user.orgId,
    createdAt: req.body.createdAt,
  };
  db.collection("group")
    .where(`${newGroup.groupName}`)
    .limit(1)
    .get()
    .then((data) => {
      if (!data.docs[0].exists) {
        return;
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newGroup.email, newGroup.password);
      }
    })
    .then((data) => {
      let groupId = data.user.uid;
      const userCredentials = {
        type: "group",
        createdAt: new Date().toISOString(),
        userId: groupId,
      };
      const groupCredentials = {
        email: newGroup.email,
        groupName: newGroup.groupName,
        groupId: groupId,
        address: newGroup.address,
        tel: newGroup.tel,
        orgId: newGroup.orgId,
        createdAt: new Date().toISOString(),
        isWork: "offWork",
        lastTime,
      };
      let batch = db.batch();
      const userRef = db.doc(`/user/${req.params.groupId}`);
      const groupRef = db.doc(`/user/${req.params.groupId}`);
      batch.set(userRef, userCredentials);
      batch.set(groupRef, groupCredentials);
      return batch.commit();
    })
    .then((res) => {
      return res.json({ message: "sucessfullycreated" });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

*/

//submitTimeFunc

exports.staffSubmitInTenant = (req, res) => {
  const staff = {
    submitTime: req.body.submitTime,
    email: req.body.email,
    password: req.body.password,
    submitStatus: req.body.submitStatus,
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(staff.email, staff.password)
    .then((data) => {
      staffId = data.user.uid;
      db.doc(`/staff/${req.params.staffId}`)
        .get(timestamp)
        .then((doc) => {
          let timestamp = [];
          if (doc.exists) {
            timestamp = doc.data().timestamp;
          }
          timestamp.push({
            time: new Date().toISOString(),
            type: staff.submitStatus,
          });
          doc.ref.update({ timestamp });
        });
      return;
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.tenantSubmitInGroup = (req, res) => {
  const tenant = {
    submitTime: req.body.submitTime,
    email: req.body.email,
    password: req.body.password,
    submitStatus: req.body.submitStatus,
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(tenant.email, tenant.password)
    .then((data) => {
      tenantId = data.user.uid;
      db.doc(`/tenant/${req.params.tenantId}`)
        .get(timestamp)
        .then((doc) => {
          let timestamp = [];
          if (doc.exists) {
            timestamp = doc.data().timestamp;
          }
          timestamp.push({
            time: new Date().toISOString(),
            type: tenant.submitStatus,
          });
          doc.ref.update({ timestamp });
        });
      return;
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.groupSubmitInOrg = (req, res) => {
  const group = {
    submitTime: req.body.submitTime,
    email: req.body.email,
    password: req.body.password,
    submitStatus: req.body.submitStatus,
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(group.email, group.password)
    .then((data) => {
      groupId = data.user.uid;
      db.doc(`/group/${req.params.groupId}`)
        .get(timestamp)
        .then((doc) => {
          let timestamp = [];
          if (doc.exists) {
            timestamp = doc.data().timestamp;
          }
          timestamp.push({
            time: new Date().toISOString(),
            type: group.submitStatus,
          });
          doc.ref.update({ timestamp });
        });
      return;
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};
/*
exports.orgSubmit = (req, res) => {
  const organization = {
    submitTime: req.body.submitTime,
    email: req.body.email,
    password: req.body.password,
    submitStatus: req.body.submitType
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(organization.email, organization.password)
    .then(data => {
      orgId = data.user.uid;
      db.doc(`/organization/${req.params.orgId}`)
        .get(timestamp)
        .then(doc => {
          let timestamp = [];
          if (doc.exists) {
            timestamp = doc.data().timestamp;
          }
          timestamp.push({
            time: new Date().toISOString(),
            type: organization.submitType
          });
          doc.ref.update({ timestamp });
        });
      return;
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};
*/
//16:46Unaduki
