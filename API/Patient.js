const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.PatientDash = async (req, resp) => {};

exports.PatientList = async (req, resp) => {};

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
