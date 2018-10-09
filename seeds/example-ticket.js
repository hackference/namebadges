const uuid = require('uuid/v4');

const tableName = 'tickets';
exports.seed = knex => {
  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      // Inserts seed entries
      return knex(tableName).insert([
        {
          id: uuid(),
          ticket: 'h4ck',
          email: 'mike@hackference.co.uk',
          fullname: 'Mike Elsmore',
          company: 'BuiltByMe'
        },
      ]);
    });
};