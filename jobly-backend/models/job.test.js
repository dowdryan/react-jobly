"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */
describe("create", function() {
    let testJob = {
        title: "Test_Job",
        salary: 100,
        equity: "0.1",
        compHandle: "c1"
    }
    test("works", async function() {
        let job = await Job.create(testJob)
        expect(job).toEqual({
            ...testJob,
            id: expect.any(Number),
        })
    })
})


/************************************** findAll */
describe("findAll", function() {
    test("works: no filters", async function() {
        let jobs = await Job.findAll()
        expect(jobs).toEqual([
          {
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            compHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[1],
            title: "Job2",
            salary: 200,
            equity: "0.2",
            compHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[2],
            title: "Job3",
            salary: 300,
            equity: "0",
            compHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[3],
            title: "Job4",
            salary: null,
            equity: null,
            compHandle: "c1",
            companyName: "C1",
          },
        ]);
    })

    test("works: title", async function() {
      let jobs = await Job.findAll({title: "ob3"})
      expect(jobs).toEqual([
        {
          id: testJobIds[2],
          title: "Job3",
          salary: 300,
          equity: "0",
          compHandle: "c1",
          companyName: "C1",
        },
      ]);
    })

    test("works: minSalary", async function() {
        let jobs = await Job.findAll({ minSalary: 250 })
        expect(jobs).toEqual([
          {
              id: testJobIds[2],
              title: "Job3",
              salary: 300,
              equity: "0",
              compHandle: "c1",
              companyName: "C1",
          },
        ])
    })

    test("works: hasEquity", async function() {
      let jobs = await Job.findAll({hasEquity: true})
      expect(jobs).toEqual([
        {
          id: testJobIds[0],
          title: "Job1",
          salary: 100,
          equity: "0.1",
          compHandle: "c1",
          companyName: "C1",
        },
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 200,
          equity: "0.2",
          compHandle: "c1",
          companyName: "C1",
        },
      ])
    })

    test("works: minSalary & hasEquity", async function() {
      let jobs = await Job.findAll({minSalary: 125, hasEquity: true})
      expect(jobs).toEqual([
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 200,
          equity: "0.2",
          compHandle: "c1",
          companyName: "C1",
        },
      ]);
    })

    test("works: all filters", async function() {
      let jobs = await Job.findAll({title: "ob2", minSalary: 125, hasEquity: true})
      expect(jobs).toEqual([
        {
          id: testJobIds[1],
          title: "Job2",
          salary: 200,
          equity: "0.2",
          compHandle: "c1",
          companyName: "C1",
        },
      ]);
    })
})


/************************************** get */
describe("get", function() {
  test("works", async function() {
    let job = await Job.get(testJobIds[0])
    expect(job).toEqual({
      id: testJobIds[0],
      title: "Job1",
      salary: 100,
      equity: "0.1",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    })
  })

  test("not found if no such job", async function() {
    try {
      await Job.get(0)
      fail()
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/************************************** update */
describe("update", function() {
  let data = {
    title: "Test_Job",
    salary: 1000,
    equity: "0.9",
  }
  test("works", async function() {
    let job = await Job.update(testJobIds[0], data)
    expect(job).toEqual({
      id: testJobIds[0],
      compHandle: "c1",
      ...data,
    })
  })

  test("not found if no such job", async function() {
    try {
      await Job.update(0, {
        title: "test",
      })
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("bad request with no data", async function() {
    try {
      await Job.update(testJobIds[0], {})
      fail()
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})


/************************************** remove */
describe("remove", function() {
  test("works", async function() {
    await Job.remove(testJobIds[0])
    const res = await db.query(
      "SELECT id FROM jobs WHERE id = $1", [testJobIds[0]])
    expect(res.rows.length).toEqual(0)
  })

  test("not found if no such job", async function() {
    try {
      await Job.remove(0)
      fail()
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})