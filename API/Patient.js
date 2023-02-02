const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Patient } = require("../models/Patient");
const { fiche_medical } = require("../models/Fiche_Medical");
const { Account } = require("../models/Account");
const { dossier_medical } = require("../models/Dossier_medical");
const bcrypt = require("bcryptjs");
const { Email } = require("../models/Email");
const pdfDocument = require("pdfkit");
const fs = require("fs");

exports.PatientDash = async (req, res) => {};

exports.PatientList = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT 
      patient.Id as IdPatient, Nom, Prénom, Civilité, CIN, Date_naissance, Tel , Situation_familiale, Mutuelle, Adresse, Email, Avatar, Account,
      fiche_medical.Id as Fiche, Poids, Taille, Maladie_chronique, Groupe_sanguin, Maladie_infectueuse, Allergie, Habitude_toxique, Chirurgie_antérieure, Maladie_héréditaire, Autre_antécédants,
      dossier_medical.Id as dossier, Date_creation, Maladie_traitée, Cabinet
       FROM patient  JOIN fiche_medical ON patient.Id = fiche_medical.Patient JOIN dossier_medical on patient.id = dossier_medical.Patient WHERE dossier_medical.Cabinet = '${Cab}'`
      );

      resp.status(201).json({
        ListPatient: resp,
        dir: __dirname,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.PatientNbr = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT count(Patient) as nbr FROM dossier_medical WHERE Cabinet = '${Cab}' `
      );

      res.status(201).json({
        NbrPatient: resp[0].nbr,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddPatient = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  const newPatient = new Patient(
    req.body.Nom,
    req.body.prénom,
    req.body.Civilité,
    req.body.CIN,
    req.body.Date_naissance,
    req.body.Tel,
    req.body.Situation_familiale,
    req.body.Adresse,
    req.body.Email,
    req.body.Mutuelle,
    req.body.Avatar
  );

  const newFicheMedical = new fiche_medical(
    req.body.Poids,
    req.body.Taille,
    req.body.Maladie_chronique,
    req.body.Groupe_sanguin,
    req.body.Maladie_infectueuse,
    req.body.Allergie,
    req.body.Habitude_toxique,
    req.body.Chirurgie_antérieure,
    req.body.Maladie_héréditaire,
    req.body.Autre_antécédants
  );

  const NewDossierMedical = new dossier_medical(new Date(Date.now()), "");

  const newAccount = new Account(req.body.CIN, req.body.password, "Patient");

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT *  FROM account WHERE Login = '${newAccount.login}'`
      );

      if (resp.length !== 0) {
        if (resp[0].ISVERIFIED) {
          res.status(201).json({ message: "Nom d'utilisateur déja existant" });
        } else if (!resp[0].ISVERIFIED) {
          res.status(201).json({
            message:
              "Vous devez vérifier votre compte, un email vous a déja été envoyé sur votre adresse",
          });
        }
      } else {
        let resp = await sqlQuery(
          `SELECT *  FROM patient  WHERE Email = '${newPatient.Email}'`
        );

        if (resp.length !== 0) {
          res
            .status(201)
            .json({ message: "Cet email est déja associé à un autre patient" });
        } else {
          let resp = await sqlQuery(
            `SELECT *  FROM patient  WHERE CIN = '${newPatient.CIN}'`
          );

          if (resp.length !== 0) {
            res
              .status(201)
              .json({ message: "Ce CIN est déja associé à un autre patient" });
          } else {
            newAccount.isverified = false;
            newAccount.expirationDat = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            );
            newAccount.token = randomstring.generate({
              length: 4,
              charset: "numeric",
            });

            //create de endpoint of the api
            let endpoint = `http://localhost:9000/api/verify-email/${newAccount.login}/code/${newAccount.token}`;

            //send the mail

            let userInfo = new Email(
              "imane@support.com",
              newPatient.Email,
              "email verification ✔",
              `<h1>thanks for your registration</h1>
          Click the link below to verify your email
          <a href=${endpoint}>Verify</a>
          the link will be expired after 24 hours 
          `,
              endpoint
            );

            //insert user

            let result = await bcrypt.hash(newAccount.password, 10);
            newAccount.password = result;

            let query = `INSERT INTO account Set ?`;
            let query1 = `INSERT INTO patient Set ?`;
            let query2 = `INSERT INTO fiche_medical Set ?`;
            let query3 = `INSERT INTO dossier_medical Set ?`;

            if (sqlQuery(query, newAccount)) {
              let res = await sqlQuery(`SELECT * FROM account `);
              newPatient.Account = resp[resp.length - 1].Id;

              if (sqlQuery(query1, newPatient)) {
                let result = await sqlQuery(`SELECT * FROM patient`);
                NewDossierMedical.Patient = result[result.length - 1].Id;
                NewDossierMedical.Cabinet = Cab;
                newFicheMedical.Patient = result[result.length - 1].Id;

                if (
                  sqlQuery(query2, newFicheMedical) &&
                  sqlQuery(query3, NewDossierMedical)
                ) {
                  console.log("it s done")
                  //SendEmail(userInfo);
                }
              }
            }
          }
        }
      }
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.UpdatePatient = async (req, res) => {
  let pat = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      const newPatient = new Patient(
        req.body.Nom,
        req.body.Prénom,
        req.body.Civilité,
        req.body.CIN,
        req.body.Date_naissance,
        req.body.Tel,
        req.body.Situation_familiale,
        req.body.Adresse,
        req.body.Email,
        req.body.Mutuelle,
        req.body.Avatar
      );

      let resp = await sqlQuery(
        `SELECT Account FROM Patient Where id = '${pat}'`
      );
      console.log(resp);
      newPatient.Account = resp[0].Account;

      const newFicheMedical = new fiche_medical(
        req.body.Poids,
        req.body.Taille,
        req.body.Maladie_chronique,
        req.body.Groupe_sanguin,
        req.body.Maladie_infectueuse,
        req.body.Allergie,
        req.body.Habitude_toxique,
        req.body.Chirurgie_antérieure,
        req.body.Maladie_héréditaire,
        req.body.Autre_antécédants,
        pat
      );

      let query = `UPDATE  Patient Set ? WHERE id = '${pat}'`;
      let query1 = `UPDATE fiche_medical Set ? WHERE Patient = '${pat}'`;

      if (sqlQuery(query, newPatient) && sqlQuery(query1, newFicheMedical)) {
        resp.status(201).json({ message: "Update Success" });
      }
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.DeletePatient = async (req, res) => {
  let pat = req.params.id;
  let Account = req.params.Account;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT * FROM rdv JOIN consultation ON rdv.id = consultation.RDV WHERE rdv.Patient = '${pat}'`
      );

      if (resp.length !== 0) {
        res.status(201).json({
          message:
            "Ce patient a deja un dossier medical remplie vous ne pouvez pas le supprimer",
        });
      } else {
        if (sqlQuery(`DELETE FROM account WHERE Id = '${Account}'`))
          res.status(201).json({ message: "Ce patient a été supprimé" });
      }
    }
  } catch {
    (err) => console.log(err.message);
  }
};

exports.Patient_consultations = async (req, res) => {
  let Cab = req.params.idCabinet;
  let Patient = req.params.idPatient;
  let id = req.user;
  console.log("hello");
  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let List = await sqlQuery(
        `SELECT * FROM rdv JOIN consultation  on rdv.id = consultation.RDV  join fiche_consultation on consultation.id = fiche_consultation.Consultation WHERE rdv.Cabinet = '${Cab}' and rdv.Patient = '${Patient}' ORDER BY rdv.DATE DESC `
      );

      console.log(List);
      res.status(201).json({
        AllFiches: List,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.PatientFiles = async (req, res) => {
  
  const file = req.body.file;
  const Fiche = req.body.Fiche;
  const Type = req.body.type;

  try {
    const patient = await sqlQuery(
      `select * from Patient where id = '${Fiche.Patient}'`
    );

    const FileName = `${Fiche.Id} ${Fiche.Date.split("T")[0]}`;

    var path =
      __dirname +
      `\\Ressources\\Patients\\${patient[0].Nom} ${patient[0].Prénom}\\${FileName}`;

    fs.access(path, (error) => {
      if (error) {
        fs.mkdir(path, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log("New Directory created successfully !!");
          }
        });
      }
    });

    const uptodate = await sqlQuery(
      `UPDATE  Fiche_consultation Set ${Type} = '${Type}.pdf'  WHERE id = '${Fiche.Id}'`
    );

    if (uptodate) {
      const doc = new pdfDocument();

      doc.pipe(fs.createWriteStream(`${path}\\${Type}.pdf`));

      doc.fontSize(27).text(file, 100, 100);

      doc.end();
     
    } else {
      res.send("un probleme est survenu");
    }
  } catch (err) {
    console.log(err.message);
  }
};
