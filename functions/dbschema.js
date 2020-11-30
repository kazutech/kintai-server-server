const dayjs = require("dayjs")

//submitTime
exports.submitTime = (req,res) => {
  const staffId = req.body.staffId;
  const staffPw = req.body.staffPw;
  const comfirmedTime = req.body.time;

db.doc(`/staff/${req.params.tenantId}`) // app.get("/staff/:tenantId",submitTime)
  .collection("credentials")
  .where("uniqueId")
  .limit(1)
  .get()
  .then(doc => {
    if(doc.exists){
      if(staffId === doc.data().staffId && staffPw === doc.data().staffPw){
        db.doc(`/staff/${req.params.tenantId}`)
        .collection("staffData")
        .where("staffId")
        .limit(1)
        .update({createdAt:`${comfirmedTime}`})
      } else {
        return res.json({ message: "staffId or staffPw might be wrong"})
      }
    } else {
    return res.status(404).json({ error: "staffCD not found"})
    }
  })
  .then(res => {
    return res.json({message: "sucessfully submited"})
  })
  .catch(err => {
     console.error(err);
     return res.status(500).json({ error: err.code });
  })
}

exports.makeStaff = (req, res) => {
  const newStaff = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    nickname: req.body.nickname,
  }
  firebase.auth().createUserWithEmailAndPassword(newStaff.email,newStaff.password)
  .then(data => {
    staffId = data.user.uid;
    const userCredentials = {
      nickname: newStaff.nickname,
      email: newStaff.email,
      createdAt: dayjs().format("YYYY-MM-DD"),
      imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
      staffId
      };
    db.doc(`/staff/${req.params.staffId}`).set(userCredentials);
    return db.doc(`/tenant/${req.user.tenantId}`).set({staff: staffId});
  })
  .then(() => {
    return res.status(201).json({ token });
  })
  .catch(err => {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json( { email: 'Email is already in use' });
    } else {
    return res.status(500).json({ general: 'Something went wrong, please try again' });
    }
  })
};

exports.submitAsStaff = (req, res) => {
  const staff = {
    submittedTime: req.body.submittedTime,
    email: req.body.email,
    password: req.body.password,
    type: req.body.type
  }
  firebase.auth().signInWithEmailAndPassword(newStaff.email,newStaff.password)
  .then(data => {
    staffId = data.user.uid
    db.doc(`/staff/${req.params.staffId}`).get(timestamp)
    .then(doc => {
    let timestamp = [];
    if(doc.exists) {
      timestamp = doc.data().timestamp;
    }
    timestamp.push({time: dayjs().format("YYYY-MM-DD"),type: staff.type})
    doc.ref.update({timestamp})
    })
    return
  })
  .catch(err => {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json( { email: 'Email is already in use' });
    } else {
    return res.status(500).json({ general: 'Something went wrong, please try again' });
    }
  })
};



exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    handle: req.body.handle,
    type: req.body.type
  };
  //set radio form to make user choose their type like staff,tenant,group,org
  switch (newUser.type) {
    case organization:
      firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
       .then(data => {
         let orgId = data.user.uid;
         let additionalClaims = {
           organization : true
         };
         admin.auth().createCustomToken(orgId,additionalClaims)
         .then(customToken => {
           token = customToken;
           const userCredentials = {
             handle: newUser.handle,
             email: newUser.email,
             createdAt: dayjs().format("YYYY-MM-DD"),
             imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
             orgId 
            }
            db.doc(`/organization/${req.params.orgId}`).set(userCredentials)
          })
         return token
       })
       .then((token) => {
         firebase.auth().signInWithCustomToken(token)
       })
       .then((token) => {
         return res.status(201).json({ token })
       })
       .catch(err => {
         console.error(err);
         if(err.code == "auth/email-already-in-use"){
           return res.status(400).json({email:"Email is already in use"})
         } else {
           return res,status(500).jsdon({general:"Something went wrong, please try again"})
         }
       })
    case group:
      firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
       .then(data => {
         let groupId = data.user.uid;
         let additionalClaims = {
           group : true
         };
         admin.auth().createCustomToken(groupId,additionalClaims)
         .then(customToken => {
           token = customToken;
           const userCredentials = {
             handle: newUser.handle,
             email: newUser.email,
             createdAt: dayjs().format("YYYY-MM-DD"),
             imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
             groupId 
            }
            db.doc(`/group/${req.params.groupId}`).set(userCredentials)
          })
         return token
       })
       .then((token) => {
         firebase.auth().signInWithCustomToken(token)
       })
       .then((token) => {
         return res.status(201).json({ token })
       })
       .catch(err => {
         console.error(err);
         if(err.code == "auth/email-already-in-use"){
           return res.status(400).json({email:"Email is already in use"})
         } else {
           return res,status(500).jsdon({general:"Something went wrong, please try again"})
         }
       })
    case tenant:
      firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
       .then(data => {
         let tenantId = data.user.uid;
         let additionalClaims = {
           tenant : true
         };
         admin.auth().createCustomToken(tenantId,additionalClaims)
         .then(customToken => {
           token = customToken;
           const userCredentials = {
             handle: newUser.handle,
             email: newUser.email,
             createdAt: dayjs().format("YYYY-MM-DD"),
             imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
             tenantId 
            }
            db.doc(`/tenant/${req.params.tenantId}`).set(userCredentials)
          })
         return token
       })
       .then((token) => {
         firebase.auth().signInWithCustomToken(token)
       })
       .then((token) => {
         return res.status(201).json({ token })
       })
       .catch(err => {
         console.error(err);
         if(err.code == "auth/email-already-in-use"){
           return res.status(400).json({email:"Email is already in use"})
         } else {
           return res.status(500).json({general:"Something went wrong, please try again"})
         }
       })
    case staff:
      firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
       .then(data => {
         let staffId = data.user.uid;
         let additionalClaims = {
           tenant : true
         };
         admin.auth().createCustomToken(staffId,additionalClaims)
         .then(customToken => {
           token = customToken;
           const userCredentials = {
             handle: newUser.handle,
             email: newUser.email,
             createdAt: dayjs().format("YYYY-MM-DD"),
             imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}$alt=media`,
             staffId 
            }
            db.doc(`/staff/${req.params.staffId}`).set(userCredentials)
          })
         return token
       })
       .then((token) => {
         firebase.auth().signInWithCustomToken(token)
       })
       .then((token) => {
         return res.status(201).json({ token })
       })
       .catch(err => {
         console.error(err);
         if(err.code == "auth/email-already-in-use"){
           return res.status(400).json({email:"Email is already in use"})
         } else {
           return res,status(500).jsdon({general:"Something went wrong, please try again"})
         }
       })
    default:
      return
  }
}

exports.login = (req, res) => {
  user = {
    email: req.body.email,
    password: req.body.password,
    type: req.body.type
  };
  switch(user.type){
    case organization:
      firebase.auth().signInWithEmailAndPassword(user.email,user.password)
      .then((data) => {
        let orgId = data.user.uid;
        let additionalClaims = {
           organization : true
        }
        let token
        admin.auth().createCustomToken(orgId,additionalClaims)
        .then(customToken => {
          token = customToken;
        })
        return token
      })
      .then((token) => {
        firebase.auth().signInWithCustomToken(token)
        return
      })
      .then((token) => {
        return res.json({ token })
      })
      .catch((err) => {
        console.error(err);
        return res.status(403).json({ general: "Wrong credantials,please try again"})
      })
    case group:
      firebase.auth().signInWithEmailAndPassword(user.email,user.password)
      .then((data) => {
        let groupId = data.user.uid;
        let additionalClaims = {
           group : true
        }
        let token
        admin.auth().createCustomToken(groupId,additionalClaims)
        .then(customToken => {
          token = customToken;
        })
        return token
      })
      .then((token) => {
        firebase.auth().signInWithCustomToken(token)
        return
      })
      .then((token) => {
        return res.json({ token })
      })
      .catch((err) => {
        console.error(err);
        return res.status(403).json({ general: "Wrong credantials,please try again"})
      })
    case tenant:
      firebase.auth().signInWithEmailAndPassword(user.email,user.password)
      .then((data) => {
        let tenantId = data.user.uid;
        let additionalClaims = {
           tenant : true
        }
        let token
        admin.auth().createCustomToken(tenantId,additionalClaims)
        .then(customToken => {
          token = customToken;
        })
        return token
      })
      .then((token) => {
        firebase.auth().signInWithCustomToken(token)
        return
      })
      .then((token) => {
        return res.json({ token })
      })
      .catch((err) => {
        console.error(err);
        return res.status(403).json({ general: "Wrong credantials,please try again"})
      })
    case staff:
      firebase.auth().signInWithEmailAndPassword(user.email,user.password)
      .then((data) => {
        let staffId = data.user.uid;
        let additionalClaims = {
           staff : true
        }
        let token
        admin.auth().createCustomToken(staffId,additionalClaims)
        .then(customToken => {
          token = customToken;
        })
        return token
      })
      .then((token) => {
        firebase.auth().signInWithCustomToken(token)
        return
      })
      .then((token) => {
        return res.json({ token })
      })
      .catch((err) => {
        console.error(err);
        return res.status(403).json({ general: "Wrong credantials,please try again"})
      })
  }
}

// token
module.exports = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized"})
  }

  admin.auth().verifyIdToken(idToken)
    .then((claims) => {
      if(claims.staff === true) {
        admin.auth().verifyIdToken(idToken).then(decodedToken => {
          req.staff = decodedToken;
          return db
            .collection("staff")
            .where("staffId","==",req.staff.uid)
            .limit(1)
            .get();
        })
        .then(data => {
          req.staff.handle = data.docs[0].data().handle;
          req.staff.imageUrl = data.docs[0].data().imageUrl;
          return next();
        })
        .catch(err => {
          console.error("Error while verifying token", err);
          eturn res.status(403).json(err);
        })
      } else if(claims.tenant === true) {
        admin.auth().verifyIdToken(idToken).then(decodedToken => {
          req.tenant = decodedToken;
          return db
            .collection("tenant")
            .where("tenantId","==",req.tenant.uid)
            .limit(1)
            .get();
        })
        .then(data => {
          req.tenant.handle = data.docs[0].data().handle;
          req.tenant.imageUrl = data.docs[0].data().imageUrl;
          return next();
        })
        .catch(err => {
          console.error("Error while verifying token", err);
          return res.status(403).json(err);
        })
      } else if(claims.organization === true) {
        admin.auth().verifyIdToken(idToken).then(decodedToken => {
          req.organization = decodedToken;
          return db
            .collection("organization")
            .where("organizationId","==",req.organization.uid)
            .limit(1)
            .get();
        })
        .then(data => {
          req.organization.handle = data.docs[0].data().handle;
          req.organization.imageUrl = data.docs[0].data().imageUrl;
          return next();
        })
        .catch(err => {
          console.error("Error while verifying token", err);
          return res.status(403).json(err);
        })
      }
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    })
}



// db schema
/*
let db = [
  list: [
    Information: {
      staffInfo: [
        {
        staffName:"Yamamoto Yaro",
        shift:"09:00-12:00",
        }
      ],
      tenantInfo: {
        tenantName: "Kurobe",
        address:"Japan,Tokyo,Shinjuku"
      },
      groupInfo: {
        groupName: "Marugame"
      },
      orgInfo: {
        orgName: "Toridoll"
      }
    }
  ],
  staff: [
    staff0000001: {
      staffData0000001: {
        staffName: "YamamotoTaro",
        address:"Japan,Tokyo,Shinjuku",
        tel:"012-3456-7890",
        email: "staff@email.com",
        shift:"09:00-12:00",
        tenant: { tenantData0000001: true },
        group: { groupData0000001: true },
        organization: { orgData0000001: true }
      },
      credentials: {
        staffId: "staff@email.com", //false
        staffPw: "123456", //false
      }
    }
],
  tenant: [
      tenant0000001: {
          tenantData0000001: {
              tenantName: "Kurobe",
              address:"Japan,Tokyo,Shinjuku",
              tel:"012-3456-7890",
              email: "tenant@email.com",
              member: {
                member0000001: "staff0000001",
                member0000002: "staff0000002"
              },
              group: { gruopData0000001: true},
              organization: { orgData0000001: true}
          },
          credentials: {
            tenantId: "tenant@email.com",
            tenantPw: "123456"
          }
      }
],
  group: [
    group0000001: {
        groupData0000001: {
            groupName: "YamamotoTaro",
            address:"Japan,Tokyo,Shinjuku",
            tel:"012-3456-7890",
            email: "group@email.com",
            organization: { orgData0000001: true },
            team: {
                team0000001: "tenant0000001",
                team0000002: "tenant0000002"
            }
        },
        credentials: {
          groupId: "group@email.com", //false
          groupPw: "123456", //false
        }
    }
],
  organization0000001: [
    organization0000001: {
      orgData0000001:{
        organizationName: "YamamotoTaro",
        address:"Japan,Tokyo,Shinjuku",
        tel:"012-3456-7890",
        email: "organization@email.com",
        business: {
          business0000001: "group0000001",
          business0000002: "group0000002"
        }
      },
      credentials: {
        organizationId: "business@email.com", //false
        organizationPw: "123456", //false
      }
    }
  ]
];
// security rules
{
    "rules": {
        "staff":{
            "$staff_id": {
                "$staffData_id": {
                    ".read" : "staffId" === "auth.uid" || "tenantId" === "auth.uid" || "groupId" === "auth.uid",
                    ".write" : "tenantId" === "auth.uid"
                },
                "staffId": { ".read" : "staffId" === "auth.uid", ".write" : "staffId" === "auth.uid"},
                "staffPw": { ".read" : "staffPw" === "auth.uid", ".write" : "staffPw" === "auth.uid"}
            }
        },
        "tenant": {
            "$tenant_id": {
                "$tenantData_id": {
                    ".read" : "tenantId" === "auth.uid" || "groupId" === "auth.uid",
                    ".write" : "groupId" === "auth.uid"
                },
                "tenantId": { ".read" : "tenantId" === "auth.uid", ".write" : "tenantId" === "auth.uid"},
                "tenantPw": { ".read" : "tenantPw" === "auth.uid", ".write" : "tenantPw" === "auth.uid"}
            }
        }
        "group": {
            "$group_id": {
                "$groupData_id": {
                    ".read" : "groupId" === "auth.uid" || "orgId" === "auth.uid",
                    ".write" : "orgId" === "auth.uid"
                },
                "groupId": {".read" : "groupId" === "auth.uid", ".write" : "groupId" === "auth.uid"},
                "groupPw": {".read" : "groupPw" === "auth.uid", ".write" : "groupPw" === "auth.uid"}
            }
        },
        "organization": {
            "$org_id": {
                "$orgData_id": {
                    ".read" : "orgId" === "auth.uid",
                    ".write" : "orgId" === "auth.uid"
                },
                "orgId": { ".read" : "orgId" === "auth.uid", ".write" : "orgId" === "auth.uid"},
                "orgPw": { ".read" : "$orgPw" === "auth.uid", ".write" : "$orgPw" === "auth.uid"}
            }
        }
    }
}



service cloud.firestore {
  match /database/{database}/documents {
    match /list/{list_id}/ {
      allow read write: if request.auth == tenantId
    },
    match /staff/{staff_id}/ {
      allow read write: if request.auth == tenantId
      ,
      match credentials/{credentials_id} {
        allow read: if request.auth == tenantId || request.auth == gropuId
        allow write: if request.auth == tenantId
      }
    },
    match /tenant/{tenant_id}/ {
      allow read: if request.auth == staffId || request.auth == tenantId,
      allow write: if request.auth == tenantId
      ,
      match /credentials/{credentials_id} {
        allow read: if request.auth == tenantId,
        allow write: if request.auth == tenantId
      }
    },
    match /group/{group_id}/ {
      allow read: if request.auth == tenantId || request.auth == groupId,
      allow write: if request.auth == groupId
      ,
      match /credentials/{credentials_id} {
        allow read: if request.auth == groupId,
        allow write: if request.auth == groupId
      }
    },
    match /organization/{org_id}/ {
      allow read: if request.auth == groupId || request.auth == orgId,
      allow write: if request.auth == orgId
      ,
      match /credentials/{credentials_id} {
        allow read: if request.auth == orgId,
        allow write: if request.auth == orgId
      }
    },
}
*/
//{orgName}{teamName}{shopName}
//state.staff