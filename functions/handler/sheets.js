const { db } = require("../util/admin");

exports.getSheets = (req, res) => {
  let userData = {};
  userData.userData = {
    type: req.user.type,
    userName: req.user.userName,
    userId: req.user.userId,
    childIds: req.user.childIds,
    status: req.user.status,
    email: req.user.email
  };
  console.log(userData);
  let childrenType;
  switch (req.user.type) {
    case "organization":
      childrenType = "group";
      break;
    case "group":
      childrenType = "tenant";
      break;
    case "tenant":
      childrenType = "staff";
      break;
    case "staff":
      delete userData.userData.childIds;
      break;
  }
  console.log("hey")
  console.log(req.user);
  userData.children = [];
  req.user.childIds && req.user.childIds.length !== 0 ? db.collection(childrenType)
    .where("userId", "in", req.user.childIds)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      console.log(data);
      data.forEach((doc) => {
        userData.children.push({
          userName: doc.data().userName,
          address: doc.data().address,
          tel: doc.data().tel,
          email: doc.data().email,
          userId: doc.data().userId,
          status: doc.data().status,
          type: doc.data().type,
        });
      }); 
      console.log(userData);
      return res.status(201).json(userData);
    })
    .catch((err) => {
      console.error(err);
    }) : res.status(201).json(userData);
};

exports.getAllChildSheets = (req, res) => {
  let userData = {};
  if (req.user.groupIds) {
    let groupIds = [];
    userData.parent = [];
    userData.parent.push({
      orgName: req.user.orgName,
      orgId: req.user.orgId,
    });
    groupIds = req.user.groupIds;
    console.log(groupIds);
    db.collection("group")
      .where("groupId", "in", groupIds)
      .orderBy("createdAt", "desc")
      .get()
      .then((data) => {
        userData.children = [];
        data.forEach((doc) => {
          userData.children.push({
            groupName: doc.data().groupName,
            address: doc.data().address,
            tel: doc.data().tel,
            email: doc.data().email,
            groupId: doc.data().groupId,
            groupTimeId: doc.data().groupTimeId,
            groupTimePw: doc.data().groupTimePw,
            status: doc.data().status,
          });
        });
        console.log(userData);
        return res.json(userData);
      })
      .catch((err) => {
        console.error(err);
      });
  } else if (req.user.tenantIds) {
    let tenantIds = req.user.ttenantIds;
    db.collection("tenant")
      .where("tenantId", "array-contains-any", tenantIds)
      .orderBy("createdAt", "desc")
      .get()
      .then((data) => {
        let childSheet = [];
        data.forEach((doc) => {
          childSheet.push({
            tenantName: doc.data().tenantName,
            address: doc.data().address,
            tel: doc.data().tel,
            email: doc.data().email,
            tenantId: doc.data().tenantId,
            status: doc.data().status,
          });
        });
        return res.json(childSheet);
      });
  } else if (req.user.staffIds) {
    let staffIds = req.user.staffIds;
    db.collection("staff")
      .where("staffId", "array-contains-any", staffIds)
      .orderBy("createdAt", "desc")
      .get()
      .then((data) => {
        let childSheet = [];
        data.forEach((doc) => {
          childSheet.push({
            staffName: doc.data().staffName,
            address: doc.data().addresss,
            tel: doc.data().tel,
            email: doc.data().email,
            staffId: doc.data().staffId,
            status: doc.data().status,
          });
        });
        return res.json(childSheet);
      });
  }
};

/*
exports.readGroupSheet = (req, res) => {
  let groupIds = req.user.groupIds;
  db.collection("group")
    .where("groupId", "array-contains-any", `${groupIds}`)
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let groupDocs = [];
      data.forEach(doc => {
        groupDocs.push({
          groupName: doc.data().groupName,
          address: doc.data().address,
          tel: doc.data().tel,
          email: doc.data().email
        });
      });
      return res.json(groupDocs);
    });
};

exports.readTenantSheet = (req, res) => {
  let tenantIds = req.user.tenantIds;
  db.collection("tenant")
    .where("tenantId", "array-contains-any", `${tenantIds}`)
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let tenantDocs = [];
      data.forEach(doc => {
        tenantDocs.push({
          tenantName: doc.data().tenantName,
          address: doc.data().address,
          tel: doc.data().tel,
          email: doc.data().email
        });
      });
      return res.json(tenantDocs);
    });
};

exports.readStaffSheet = (req, res) => {
  let staffIds = req.user.staffIds;
  db.collection("staff")
    .where("staffId", "array-contains-any", `${staffIds}`)
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let staffDocs = [];
      data.forEach(doc => {
        staffDocs.push({
          staffName: doc.data().staffName,
          address: doc.data().address,
          tel: doc.data().tel,
          email: doc.data().email
        });
      });
      return res.json(staffDocs);
    });
};
*/
