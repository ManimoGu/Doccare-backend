const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Response } = require("../models/Response");

exports.ReviewsNbr = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT COUNT(*) as nbr FROM feedback WHERE Cabinet = ${Cab} and type = 'Avis'`
      );

      res.status(201).json({
        NbrAvis: resp[0].nbr,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.ListMessage = async (req, res) => {
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT feedback.Id as Id, Commentaire, Type, Date, patient.Id as Patient_Id, Nom, Prénom, Civilité, CIN, Date_naissance, Tel, Situation_familiale, Mutuelle, Adresse, Email, Avatar, Account from feedback join patient on feedback.Patient = patient.Id WHERE Type = 'Message'`
      );
      
      console.log(resp)
      res.status(201).json({
        ListMessage: resp,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddResp = async (req, res) => {
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
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query = `INSERT INTO reponse Set ?`;

      if (sqlQuery(query, newResponse)) {
        res
          .status(201)
          .json({ message: "Les informations ont été modifier avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.getResponse = async (req, res) => {
  let Feed = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(`SELECT * FROM reponse Where Feed = '${Feed}'`);

      console.log(resp);

      res.status(201).json({
        ListResp: resp,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};
