const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Patient } = require("../Models/Patient");
const { fiche_medical } = require("../Models/Fiche_Medical");
const { Account } = require("../models/Account");
const { dossier_medical } = require("../Models/Dossier_medical");


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

exports.AddPatient = async (req, resp) => {

  let Cab = req.params.id;

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
    
  )

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

   )

   const NewDossierMedical = new dossier_medical(

    new Date(Date.now()),
    ''
   )
  
   const newAccount = new Account(
   
    req.body.login, req.body.password, "Patient"

   )

   try{

    let res = await sqlQuery(
      `SELECT *  FROM Account WHERE Login = '${newAccount.login}'`
    );

    console.log(res);

    if (res.length !== 0) {
      if (res[0].ISVERIFIED) {
        resp.status(201).json({ message: "Nom d'utilisateur déja existant" });
      } else if (!res[0].ISVERIFIED) {
        resp.status(201).json({
          message:
            "Vous devez vérifier votre compte, un email vous a déja été envoyé sur votre adresse",
        });
      }
    } else {
      let res = await sqlQuery(
        `SELECT *  FROM Patient  WHERE Email = '${newPatient.Email}'`
      );

      if (res.length !== 0) {
        resp
          .status(201)
          .json({ message: "Cet email est déja associé à un autre cabinet" });
      } else {
        newAccount.isverified = false;
        newAccount.expirationDat = new Date(Date.now() + 24 * 60 * 60 * 1000);
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

        console.log(newAccount);

        let query = `INSERT INTO Account Set ?`;
        let query1 = `INSERT INTO Patient Set ?`;
        let query2 = `INSERT INTO fiche_medical Set ?`;
        let query3 = `INSERT INTO dossier_medical Set ?`;

        if (sqlQuery(query, newAccount)) {
          let res = await sqlQuery(`SELECT * FROM Account `);
          newPatient.Account = res[res.length - 1].Id;
        
          if (sqlQuery(query1, newPatient)) {
            let result = await sqlQuery(`SELECT * FROM Patient`);
            NewDossierMedical.Patient = result[result.length - 1].Id
           
          }

          SendEmail(userInfo);

          newDoctor.Account = res[res.length - 1].Id;

          let result = await sqlQuery(`SELECT * FROM Cabinet `);

          console.log(newDoctor);
        }
      }
    }


   }catch{err => console.log(err.message)}





 

}
