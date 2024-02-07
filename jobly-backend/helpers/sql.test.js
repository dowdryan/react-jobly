const assert = require('assert');
const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe("sqlForPartialUpdate", function() {
    test('generate SQL for partial update', function() {
        const dataToUpdate = {
            firstName: 'Aliya',
            age: 32,
        };
        const jsToSql = {
            firstName: "first_name",
            age: "age",
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        const expectedColumns = '"first_name"=$1, "age"=$2'
        const expectedValues = ['Aliya', 32]

        assert.strictEqual(result.setCols, expectedColumns)
        assert.deepStrictEqual(result.values, expectedValues)
    })
    test('throws BadRequestError for empty data', function() {
        const dataToUpdate = {}
        const jsToSql = {}
        assert.throws(function() {
            sqlForPartialUpdate(dataToUpdate, jsToSql)
        }, BadRequestError)
    })
})