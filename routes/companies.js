const express = require("express");
const slugify = require('slugify')
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")

console.log(slugify('hello there'))


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({ companies : results.rows})
    } catch (e){
        return next(e);
    }
    })


    router.get('/:code', async (req, res, next) => {
        try {
            const { code } = req.params;
            const results = await db.query('SELECT * FROM companies WHERE code = $1', [code])
            if(results.rows.length === 0){
                throw new ExpressError(`Can't find user with id of ${id}`, 404)
            }
            
            
            return res.send({user : results.rows[0]})  
    
        } catch (e) {
            return next(e)
        }
    })


    router.post("/", async function (req, res, next) {
        try {
          const { code, name, description } = req.body;

          let sCode = slugify(name)
      
          const result = await db.query(
                `INSERT INTO companies ( code, name, description ) 
                 VALUES ($1, $2, $3)
                 RETURNING code, name, description`,
              [sCode, name, description]
          );
      
          return res.status(201).json(result.rows[0]);
        }
      
        catch (err) {
          return next(err);
        }
      });


      router.put('/:code', async (req, res, next) => {
        try {
            const { code } = req.params;
            
            const { name, description } = req.body;
            const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', 
            [name, description, code])
            
            return res.send(results.rows[0])  
    
        } catch (e) {
            return next(e)
        }
    })


    router.delete('/:code', async (req, res, next) => {
        try {
            const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
            res.send({msg: "DELETED"})
        } catch (e) {
            return next(e)
        }
    })


module.exports = router;