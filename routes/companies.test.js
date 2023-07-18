process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code ,name, description) VALUES ('kc', 'Kaiba Corp', 'gaming')
    RETURNING code, name, description`)
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})


describe("GET /companies", () => {
    test("Get a list of companies", async () => {
        const result = await request(app).get('/companies')
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({companies: [testCompany]})
    })
})


describe("GET /companies/:code", () => {
    test("Fetches a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)  
        
        expect(res.body).toEqual({company: testCompany})  // why does it insist it must have user as a key and fail?
    })

    // test("Responds with 404 for invalid id", async () => {
    //     const res = await request(app).get(`/companies/0`)
    //     expect(res.statusCode).toBe(404)
    // })
})


describe("POST /companies", () => {
    test("Bestows upon us a single company", async () => {
        const res = await request(app).post('/companies').send({ name : 'BanditKeithIndustries', description : 'Machine company'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
           "company": {
            code: "bk",  
            name: "BanditKeithIndustries",
            description: "Machine company"
           }   // should work but refuses to, gives a 500 status for some reason,
          // probably missing a component
        })
    })
})



