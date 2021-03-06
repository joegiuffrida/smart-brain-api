export const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      // Store hash in your password DB.
      const hashed = hash;
      db.transaction((trx) => {
        trx
          .insert({
            hash: hashed,
            email: email,
          })
          .into('login')
          .returning('email')
          .then((loginEmail) => {
            return trx('users')
              .returning('*')
              .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date(),
              })
              .then((user) => {
                res.json(user[0]);
              });
          })
          .then(trx.commit)
          .catch(trx.rollback);
      }).catch((err) => res.status(400).json('unable to register'));
    });
  });
};
