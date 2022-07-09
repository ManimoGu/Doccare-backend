const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Response } = require("../Models/Response");

exports.ReviewsNbr = async (req, resp) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let res = await sqlQuery(
        `SELECT COUNT(*) as nbr FROM feedback WHERE Cabinet = ${Cab} and type = 'Avis'`
      );

      resp.status(201).json({
        NbrAvis: res[0].nbr,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.ListMessage = async (req, resp) => {
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let res = await sqlQuery(
        `SELECT feedback.Id as Id, Commentaire, Type, Date, Patient.Id as Patient_Id, Nom, Prénom, Civilité, CIN, Date_naissance, Tel, Situation_familiale, Mutuelle, Adresse, Email, Avatar, Account from feedback join patient on feedback.Patient = patient.Id WHERE Type = 'Message'`
      );

      resp.status(201).json({
        ListMessage: res,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddResp = async (req, resp) => {
  let id = req.user;
  let Cab = req.ID;

  const newResponse = new Response(
    req.body.Message,
    req.body.Date,
    req.body.Heure,
    req.body.Feed
  );

  console.log(newResponse);

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query = `INSERT INTO Reponse Set ?`;

      if (sqlQuery(query, newResponse)) {
        resp
          .status(201)
          .json({ message: "Les informations ont été modifier avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.getResponse = async (req, resp) => {
  let Feed = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let res = await sqlQuery(`SELECT * FROM Reponse Where Feed = '${Feed}'`);

      console.log(res);

      resp.status(201).json({
        ListResp: res,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};
