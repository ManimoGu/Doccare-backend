const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.ReviewsNbr = async (req, resp) =>{

    let Cab = req.params.Id;

    try{
    
    let res = sqlQuery(`SELECT couunt (*) FROM feedback WHERE Cabinet = ${Cab} and type = 'Avis'`)

    resp.status(201).json({
        NbrAvis: res,
      });

    }catch(err){console.log(err.message)}


}
