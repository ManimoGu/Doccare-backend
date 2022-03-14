const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.ReviewsNbr = async (req, resp) => {
  let Cab = req.params.id;

  try {
    let res = await sqlQuery(
      `SELECT COUNT(*) as nbr FROM feedback WHERE Cabinet = ${Cab} and type = 'Avis'`
    );
     
    resp.status(201).json({
      NbrAvis: res[0].nbr,
    });
  } catch (err) {
    console.log(err.message);
  }
};
