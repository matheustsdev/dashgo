const faker = require('faker') 

module.exports = (req, res) => {


  let data = {users: []};
  let i = 0;

  for (i = 0; i < 200; i++) {
    const newUser = {
      user: `User ${i + 1}`,
      email:  faker.internet.email().toLowerCase(),
      createdAt: faker.date.recent(10),
        
      }
    

    data.users.push(newUser);
  }

  return data


//src/services/server/index.js


}

