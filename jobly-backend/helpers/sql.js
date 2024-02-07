const { BadRequestError } = require("../expressError");


/** This function takes 2 parameters
 * It attempts retrieve the keys (property names) of the dataToUpdate object.
 * Attempts to create an array by mapping each key in the dataToUpdate object to a string
 * Returns an object with 2 properties:
    * setCols: A string that contains the comma-separated list of column-value pairs for the SET clause in a SQL UPDATE statement.
    * values: An array containing the updated values extracted from the dataToUpdate object.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
