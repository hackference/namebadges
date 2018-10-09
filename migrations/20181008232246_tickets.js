const tableName = 'tickets';

exports.up = knex => {
    return knex.schema.createTable(tableName, table => {
        table.uuid('id').primary()
        table.string('ticket');
        table.string('email');
        table.string('fullname');
        table.string('company');
        table.timestamps();
    });
};

exports.down = knex => {
    return knex.schema.dropTable(tableName);
};
