const tableName = 'tickets';

exports.up = knex => {
    return knex.schema.table(tableName, table => {
        table.date('uploaded');
    })
};

exports.down = knex => {
    return knex.schema.table(tableName, table => {
        table.dropColumn('uploaded');
    })
};
