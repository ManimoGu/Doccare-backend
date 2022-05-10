const { sqlQuery } = require("../Helpers/Promise");
const { RDV } = require("../Models/RDV");
const { Consultation } = require("../Models/Consultation");
const { FicheConsultation } = require("../Models/FicheConsultation");

exports.ADDRDV = async (req, resp) => {
  let Cab = req.params.id;
  let name = req.body.name;

  let Name = name[0].split(" ");
  let Date = req.body.Date[0].split("T");
  console.log(Date);

  console.log(Name);

  const newrdv = new RDV(Date[0], Date[1], req.body.Type, "en cours");

  try {
    let List = await sqlQuery(
      ` SELECT Id FROM Patient WHERE (Nom = '${Name[0]}' && Prénom = '${Name[1]}') ||  (Nom = '${Name[1]}' && Prénom = '${Name[0]}') `
    );

    if (List.length === 0) {
      resp.status(201).json({ message: "Ce patient n'existe pas" });
    } else {
      let res = await sqlQuery(
        ` SELECT * FROM rdv WHERE Patient = '${List[0].Id}' and Etat = 'en cours' `
      );

      console.log(res);

      if (res.length !== 0)
        resp
          .status(201)
          .json({ message: "Ce patient a deja un rendez vous en cours" });
      else {
        newrdv.Cabinet = Cab;
        newrdv.Patient = List[0].Id;

        let query = `INSERT INTO rdv Set ?`;

        if (sqlQuery(query, newrdv)) {
          resp.status(201).json({ message: "Rdv added succesfully" });
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.RDVList = async (req, resp) => {
  let Cab = req.params.id;

  try {
    let List = await sqlQuery(
      `SELECT * FROM Patient join rdv on Patient.Id = rdv.Patient WHERE Cabinet = '${Cab}'`
    );

    resp.status(201).json({
      listCons: List,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.DeleteRDV = async (req, resp) => {
  let RDV = req.params.id;

  try {
    if (sqlQuery(`DELETE FROM rdv WHERE Id = '${RDV}'`))
      resp.status(201).json({ message: "RDV supprimer avec success" });
  } catch {
    (err) => console.log(err.message);
  }
};

exports.UpdateRDV = async (req, resp) => {
  let RDV = req.params.id;

  let Date = req.body.Date[0].split("T");

  try {
    let query1 = `UPDATE rdv Set Date = '${Date[0]}', Heure = '${Date[1]}', Type = '${req.body.Type}' WHERE id = '${RDV}'`;

    if (sqlQuery(query1)) {
      resp.status(201).json({ message: "Update Success" });
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.RDVNbr = async (req, resp) => {
  let Cab = req.params.id;
  console.log(Cab);

  try {
    let ConsList = await sqlQuery(
      `SELECT COUNT(*) as nbr FROM rdv WHERE rdv.Cabinet = '${Cab}' `
    );

    resp.status(201).json({
      NbrRDV: ConsList[0].nbr,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.TypeUpdate = async (req, resp) => {
  let RDV = req.params.id;

  try {
    if (sqlQuery(`UPDATE rdv SET  Etat = 'Traité' WHERE Id = '${RDV}'`))
      resp.status(201).json({ message: "Update Success" });

    let newconsultation = new Consultation("", "", 0, "", RDV);

    let newFichConsultation = new FicheConsultation(
      "",
      "",
      "",
      "",
      "",
      Date.now(),
      0,
      0
    );

    let query = `INSERT INTO consultation Set ?`;
    let query1 = `INSERT INTO fiche_consultation Set ?`

    if (sqlQuery(query, newconsultation)) {
      let res = sqlQuery(`SELECT * FROM consultation`)
      newFichConsultation.Consultation = res[res.length - 1].Id
      if (sqlQuery(query1, newFichConsultation)) {
        resp.status(201).json({ message: "Traitement validé" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};
