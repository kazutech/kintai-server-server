const { db } = require("../util/admin");

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

exports.validataSignupData = (data) => {
  let errors = {};
  const {
    email,
    password,
    confirmedEmail,
    confirmedPassword,
    address,
    tel,
    orgName,
  } = data;

  console.log(
    email,
    password,
    confirmedEmail,
    confirmedPassword,)

  // check email
  if (isEmpty(email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(email)) {
    errors.email = "Must be a valid confirmedEmail address";
  } else if (email != confirmedEmail) {
    errors.email = "Email and confirmedEmail is not same";
  }
  // check password
  if (isEmpty(password)) {
    errors.password = "Must not be empty";
  } else if (password != confirmedPassword) {
    errors.password = "Email and confirmedEmail is not same";
  }

  // check address
  if (isEmpty(address)) {
    errors.address = "Must not be empty";
  }
  // check address
  if (isEmpty(tel)) {
    errors.tel = "Must not be empty";
  }
  // check orgName
  if (isEmpty(orgName)) {
    errors.orgName = "Must not be empty";
  } else
    db.collection("organization")
      .where("orgName", "==", orgName)
      .get()
      .then((data) => {
        if (!data.empty) {
          return (errors.orgName = "The orgName is already taken");
        } else return true;
      })
      .catch(() => {
        return (errors.orgName = "Something went wrong");
      });
  console.log(errors);
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validataSigninData = (data) => {
  let errors = {};
  const { email, password, confirmedEmail, confirmedPassword } = data;

  // check email
  if (isEmpty(email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(email)) {
    errors.email = "Must be a valid email address";
  } else if (email !== confirmedEmail) {
    errors.email = "Email and confirmedEmail is not same";
  }
  // check password
  if (isEmpty(password)) {
    errors.password = "Must not be empty";
  } else if (password !== confirmedPassword) {
    errors.password = "Email and confirmedEmail is not same";
  } 
  console.log(errors);
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
