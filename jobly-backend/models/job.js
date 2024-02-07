"use strict";

const db = require("../db");
const {NotFoundError} = require("../expressError")
const {sqlForPartialUpdate} = require("../helpers/sql")


class Job {
    /** Creates a brand new job. (from data), update db, return new job data.
    * { title, salary, equity, companyHandle }
    * Returns { id, title, salary, equity, companyHandle }
    **/
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs(title,
                              salary,
                              equity,
                              company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "compHandle"`,
             [
                data.title,
                data.salary,
                data.equity,
                data.compHandle
             ])
        let job = result.rows[0]
        return job
    }


    /** Finds every single existing job.
    * searchFilters (all optional):
    * - title
    * - minSalary
    * - hasEquity 
    *
    * Returns [{id, title, salary, equity, companyHandle, companyName}]
    * */
    static async findAll({title, minSalary, hasEquity} = {}) {
        let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "compHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let expressions = []
        let values = []
        if (title !== undefined) {
            values.push(`%${title}%`)
            expressions.push(`title ILIKE $${values.length}`)
        }
        if (minSalary !== undefined) {
            values.push(minSalary)
            expressions.push(`salary >= $${values.length}`)
        }
        if (hasEquity === true) {
            expressions.push(`equity > 0`)
        }
        if (expressions.length > 0) {
            query += " WHERE " + expressions.join(" AND ")
        }
        query += " ORDER BY title";
        const jobsRes = await db.query(query, values);
        return jobsRes.rows;
    }

 
    /** Returns data about a job based on the given ID.
    * Returns { id, title, salary, equity, companyHandle, company }
    *   where company is { handle, name, description, numEmployees, logoUrl }
    * Throws NotFoundError if nothing is found.
    **/
    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "compHandle"
             FROM jobs
             WHERE id = $1`, [id])
        const job = jobRes.rows[0]
        if (!job) throw new NotFoundError(`No job: ${id}`)
        const compRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.compHandle])
        delete job.compHandle
        job.company = compRes.rows[0]
        return job
    } 


    /** Updates a specific job's data
     * Some fields are optional
     * Returns { id, title, salary, equity, companyHandle }
     * Throws NotFoundError if nothing is found.
     */
    static async update(id, data) {
        const {setCols, values} = sqlForPartialUpdate(data, {})
        const idVarIdx = "$" + (values.length + 1)
        const query = `UPDATE jobs
                       SET ${setCols}
                       WHERE id = ${idVarIdx}
                       RETURNING id, 
                                 title,
                                 salary,
                                 equity,
                                 company_handle AS "compHandle"`
        const res = await db.query(query, [...values, id])
        const job = res.rows[0]
        if (!job) throw new NotFoundError(`No job: ${id}`)
        return job
    }


    /** Deletes an existing job and all of it's data.
     * Returns Undefined
     * Throws NotFoundError if a company is not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`, [id])
        const job = result.rows[0]
        if (!job) throw new NotFoundError(`No job: ${id}`)
    }
}

module.exports = Job;