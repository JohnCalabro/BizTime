const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json({ invoices : results.rows})
    } catch (e){
        return next(e);
    }
    })



    router.get('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const results = await db.query('SELECT * FROM invoices WHERE id = $1', [id])
            if(results.rows.length === 0){
                throw new ExpressError(`Can't find user with id of ${id}`, 404)
            }
            
            
            return res.send({invoice : results.rows[0]})  
    
        } catch (e) {
            return next(e)
        }
    })


    router.post("/", async function (req, res, next) {
        try {
          const { comp_code, amt, paid, add_date, paid_date } = req.body;
      
          const result = await db.query(
                `INSERT INTO invoices ( comp_code, amt, paid, add_date, paid_date ) 
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING comp_code, amt, paid, add_date, paid_date`,
              [comp_code, amt, paid, add_date, paid_date]
          );
      
          return res.status(201).json(result.rows[0]);
        }
      
        catch (err) {  
          return next(err);
        }
      });



    router.put('/:id', async (req, res, next) => {
        try {
            
            const { id } = req.params;
            let payDay;
            const { comp_code, amt, paid, add_date, paid_date } = req.body;

            const current = await db.query(
                `SELECT paid
                 FROM invoices
                 WHERE id = $1`,
              [id]);

              if (current.rows.length === 0) {
                throw new ExpressError(`No such invoice: ${id}`, 404);
              }

              const paidDateToday = current.rows[0].paid_date;

              if(!paidDateToday && paid){
                payDay = new Date() 
              } else if(!paid){
                payDay = '';
              } else {
                payDay = current;
              }



            const results = await db.query('UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id=$6 RETURNING *', 
            [comp_code, amt, paid, add_date, paid_date, id])
            
            return res.send(results.rows[0])  
    
        } catch (e) {
            return next(e)
        }
    })

    router.delete('/:id', async (req, res, next) => {
        try {
            const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
            res.send({msg: "DELETED"})
        } catch (e) {
            return next(e)
        }
    })

module.exports = router;