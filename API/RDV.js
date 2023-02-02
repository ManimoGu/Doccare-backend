const { sqlQuery } = require("../Helpers/Promise");
const { RDV } = require("../models/RDV");
const { Consultation } = require("../models/Consultation");
const { FicheConsultation } = require("../models/FicheConsultation");

exports.ADDRDV = async (req, res) => {
  let Cab = req.params.id;
  let name = req.body.name;
  let id = req.user;

  let Name = name[0].split(" ");
  let Date = req.body.Date[0].split("T");

  const newrdv = new RDV(Date[0], Date[1], req.body.Type, "en cours");

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let List = await sqlQuery(
        ` SELECT Id FROM patient WHERE (Nom = '${Name[0]}' && Prénom = '${Name[1]}') ||  (Nom = '${Name[1]}' && Prénom = '${Name[0]}') `
      );

      if (List.length === 0) {
        res.status(201).json({ message: "Ce patient n'existe pas" });
      } else {
        let resp = await sqlQuery(
          ` SELECT * FROM rdv WHERE Patient = '${List[0].Id}' and Etat = 'en cours' `
        );

        console.log(resp);

        if (resp.length !== 0)
          res
            .status(201)
            .json({ message: "Ce patient a deja un rendez vous en cours" });
        else {
          newrdv.Cabinet = Cab;
          newrdv.Patient = List[0].Id;

          let query = `INSERT INTO rdv Set ?`;

          if (sqlQuery(query, newrdv)) {
            res.status(201).json({ message: "Rdv added succesfully" });
          }
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.RDVList = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let List = await sqlQuery(
        `SELECT * FROM patient join rdv on patient.Id = rdv.Patient WHERE Cabinet = '${Cab}'`
      );

      res.status(201).json({ listCons: List });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.DeleteRDV = async (req, res) => {
  let RDV = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      if (sqlQuery(`DELETE FROM rdv WHERE Id = '${RDV}'`))
        res.status(201).json({ message: "RDV supprimer avec success" });
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.UpdateRDV = async (req, res) => {
  let RDV = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  let Date = req.body.Date[0].split("T");

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query1 = `UPDATE rdv Set Date = '${Date[0]}', Heure = '${Date[1]}', Type = '${req.body.Type}' WHERE id = '${RDV}'`;

      if (sqlQuery(query1)) {
        res.status(201).json({ message: "Update Success" });
      }
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.RDVNbr = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let ConsList = await sqlQuery(
        `SELECT COUNT(*) as nbr FROM rdv WHERE rdv.Cabinet = '${Cab}' `
      );

      res.status(201).json({
        NbrRDV: ConsList[0].nbr,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.TypeUpdate = async (req, res) => {
  let RDV = req.params.id;
  let Patient = req.params.Patient;
  let id = req.user;
  console.log(Patient + " " + id);
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let consult = await sqlQuery(
        `SELECT * FROM consultation WHERE RDV = '${RDV}'`
      );
      console.log(consult);
      if (consult.length !== 0) {
        res.status(201).json({
          message:
            "Il y a deja une consultation qui correspond a ce rendez-vous",
        });
      } else {
        let result = await sqlQuery(
          `UPDATE rdv SET  Etat = 'Traité' WHERE Id = '${RDV}'`
        );

        let newconsultation = new Consultation("", "", 0, "", RDV);

        let newFichConsultation = new FicheConsultation(
          "",
          "",
          "",
          "",
          "",
          new Date(Date.now())
        );

        let query = `INSERT INTO consultation Set ?`;
        let query1 = `INSERT INTO fiche_consultation Set ?`;

        if (sqlQuery(query, newconsultation)) {
          let resp = await sqlQuery(`SELECT * FROM consultation`);

          let dossier = await sqlQuery(
            `SELECT Id FROM dossier_medical WHERE Patient = '${Patient}'`
          );

          newFichConsultation.Consultation = resp[resp.length - 1].Id;
          newFichConsultation.Dossier_medical = dossier[0].Id;
          if (sqlQuery(query1, newFichConsultation)) {
            res.status(201).json({ message: "Traitement validé" });
          }
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};
