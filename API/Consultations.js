const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.DashList = async (req, resp) => {};

exports.ConsultationList = async (req, resp) => {};

exports.ConsultationNbr = async (req, resp) => {
  let Cab = req.params.Id;

  try {
    let ConsList = await sqlQuery(
      `SELECT COUNT(*) as nbr FROM consultation  JOIN rdv ON consultation.RDV = rdv.Id WHERE rdv.Cabinet = '${Cab}' `
    );

    resp.status(201).json({
      NbrConsultation: ConsList[0].nbr,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.ConsultationTotal = async (req, resp) => {

  let Cab = req.params.Id;

  try{
  let total = sqlQuery(`SELECT SUM(Montant) FROM consultation JOIN rdv ON consultation.RDV = rdv.Id WHERE rdv.Cabinet = '${Cab}'`)
  
  resp.status(201).json({
    TotalConsultation: total,
  });
  }catch(err){console.log(err.message)}

};
