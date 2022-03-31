const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.PatientDash = async (req, resp) => {};

exports.PatientList = async (req, resp) => {

  let Cab = req.params.id;

  try {
    let res = await sqlQuery(`SELECT * FROM Patient JOIN fiche_medical ON Patient.Id = fiche_medical.Id JOIN dossier_medical on Patient.id = dossier_medical.Patient WHERE Cabinet = '${Cab}'`);
    console.log(res)
    resp.status(201).json({
      ListPatient: res
    });
    
  } catch (err) {
    console.log(err.message);
  }
};

exports.PatientNbr = async (req, resp) => {
  let Cab = req.params.Id;

  try {
    let res = await sqlQuery(
      `SELECT count(Patient) as nbr FROM dossier_medical WHERE Cabinet = '${Cab}' `
    );

    resp.status(201).json({
      NbrPatient: res[0].nbr,
    });
  } catch (err) {
    console.log(err.message);
  }
};
