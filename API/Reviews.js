const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Response } = require("../Models/Response");

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

exports.ListMessage = async (req, resp) => {
  try {
    let res = await sqlQuery(
      `SELECT feedback.Id as Id, Commentaire, Type, Date, Patient.Id as Patient_Id, Nom, Prénom, Civilité, CIN, Date_naissance, Tel, Situation_familiale, Mutuelle, Adresse, Email, Avatar, Account from feedback join patient on feedback.Patient = patient.Id WHERE Type = 'Message'`
    );
    console.log(res);

    resp.status(201).json({
      ListMessage: res,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddResp = async (req, resp) => {
  let Feed = req.params.id;

  const newResponse = new Response(
    req.body.Message,
    req.body.Date,
    req.body.Heure,
    Feed
  );

  try {
    let query = `UPDATE  Reponse Set ? WHERE Feed = '${Feed}'`;

    if (sqlQuery(query, newResponse)) {
      resp
        .status(201)
        .json({ message: "Les informations ont été modifier avec succés" });
    }
  } catch (err) {
    console.log(err.message);
  }
};
