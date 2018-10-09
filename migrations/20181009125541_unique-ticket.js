const tableName = 'tickets';

exports.up = knex => {
    return knex.schema.table(tableName, table => {
        table.unique('ticket');
    })
};

exports.down = knex => {
    return knex.schema.table(tableName, table => {
        table.dropIndex('ticket');
    })
};
