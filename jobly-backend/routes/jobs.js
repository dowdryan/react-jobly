"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { checkForAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const router = express.Router({ mergeParams: true });


/** POST
 * Requires admin authorization
 * Returns: {id, title, salary, equity, companyHandle}
 */
router.post("/", checkForAdmin, async function(req, res, next) {
    try {
        console.log("Request Body:", req.body); // Add this line for logging
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(error => error.stack)
            throw new BadRequestError(errs)
        }
        const job = await Job.create(req.body)
        return res.status(201).json({job})
    } catch(err) {
        console.error("Error in POST /jobs:", err); // Add this line for logging
        return next(err)
    }
})


/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 * Does not require authorization
 * Can Filter for:
    * title
    * minSalary
    * hasEquity
 */
router.get("/", async function(req, res, next) {
    const q = req.query
    if (q.minSalary !== undefined) {
        q.minSalary = +q.minSalary
    }
    q.hasEquity = q.hasEquity === "true";
    try {
        const validator = jsonschema.validate(q, jobSearchSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(error => error.stack)
            throw new BadRequestError(errs)
        }
        const jobs = await Job.findAll()
        return res.json({jobs})
    } catch (err) {
        return next(err)
    }
})


/** GET /[jobId] => { job }
 * Does not require authorization
 * Returns: {id, title, salary, equity, company}
 * where company is {handle, name, description, numEmployees}
 */
router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id)
        return res.json({job})
    } catch(err) {
        return next(err)
    }
})


/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 * Requires admin authorization
 * Data: { title, salary, equity }
 * Returns { id, title, salary, equity, companyHandle }
 */
router.patch("/:id", checkForAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(error => error.stack)
            throw new BadRequestError(errs)
        }
        const job = await Job.update(req.params.id, req.body)
        return res.json({job})
    } catch(err) {
        return next(err)
    }
})


/** DELETE /[handle]  =>  { deleted: id }
 * Requires admin authorization
 */
router.delete("/:id", checkForAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id)
        return res.json({deleted: + req.params.id})
    } catch(err) {
        return next(err)
    }
})

module.exports = router;