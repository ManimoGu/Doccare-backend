const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Doctor } = require("../models/Doctor");
const { Cabinet } = require("../models/Cabinet");
const { Account } = require("../models/Account");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Access } = require("../Helpers/JwtVerification");

require("dotenv").config();

exports.DoctorProfil = async (req, Resp) => {
  let login = req.params.login;
  let pass = req.params.password;

  try {
    let res = await sqlQuery(`SELECT  * FROM account WHERE Login ='${login}' `);
    if (res.length === 0) {
      Resp.status(201).json({
        message: "Nom d'utilisateur introuvables",
      });
    } else {
      let result = await bcrypt.compare(pass, res[0].Password);
      console.log(result);
      if (!result) Resp.status(201).json({ message: "Mot de passe incorrect" });
      else {
        if (res[0].Fonction === "Docteur") {
          let DoctorInfo = await sqlQuery(
            `SELECT  * FROM docteur WHERE Account ='${res[0].Id}' `
          );

          let CabinetInfo = await sqlQuery(
            `SELECT * FROM cabinet WHERE  Id ='${DoctorInfo[0].Cabinet}' `
          );

          if (DoctorInfo.length === 0 && CabinetInfo.length === 0)
            Resp.status(201).json({ message: "Compte introuvable" });
          else {
            let ACCESS = jwt.sign(CabinetInfo[0].Id, process.env.ACCESS_TOKEN);
            Resp.status(201).json({
              infos: {
                Doctor: DoctorInfo[0],
                AccountInfo: res[0],
                CabinetInfos: CabinetInfo[0],
                Token: ACCESS,
              },
            });
          }
        } else if (res[0].Fonction === "Assistante") {
          let AssistanteInfo = await sqlQuery(
            `SELECT  * FROM  assistante WHERE Account ='${res[0].Id}' `
          );
          console.log(AssistanteInfo);

          let CabinetInfo = await sqlQuery(
            `SELECT * FROM cabinet WHERE  Id ='${AssistanteInfo[0].Cabinet}' `
          );

          if (AssistanteInfo.length === 0)
            Resp.status(201).json({ message: "Compte introuvable" });
          else {
            let ACCESS = jwt.sign(CabinetInfo[0].Id, process.env.ACCESS_TOKEN);
            console.log(ACCESS)
            Resp.status(201).json({
              infos: {
                Assistante: AssistanteInfo[0],
                AccountInfo: res[0],
                CabinetInfos: CabinetInfo[0],
                Token: ACCESS,
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddDoctor = async (req, resp) => {
  let Cab = req.params.cabinet;
  let id = req.user;

  let newDoctor = new Doctor(
    req.body.nom,
    req.body.prenom,
    req.body.specialite,
    req.body.CIN,
    req.body.tel,
    req.body.email
  );

  let newAccount = new Account(req.body.login, req.body.password, "docteur");

  if (validationRegister(newDoctor, newAccount, newCabinet))
    resp
      .status(403)
      .json({ message: validationRegister(newDoctor, newAccount, newCabinet) });
  else {
    try {
      if (id !== Cab)
        resp
          .status(201)
          .json({ message: "Vous ne pouvez effectuer cette operation" });
      else {
        let res = await sqlQuery(
          `SELECT *  FROM account WHERE Login = '${newAccount.login}'`
        );

        console.log(res);

        if (res.length !== 0) {
          if (res[0].ISVERIFIED) {
            resp
              .status(201)
              .json({ message: "Nom d'utilisateur déja existant" });
          } else if (!res[0].ISVERIFIED) {
            resp.status(201).json({
              message:
                "Vous devez vérifier votre compte, un email vous a déja été envoyé sur votre adresse",
            });
          }
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
            newDoctor.email,
            "email verification ✔",
            `<h1>thanks for your registration</h1>
            Click the link below to verify your email
            <a href=${endpoint}>Verify</a>
            the link will be expired after 24 hours 
            `,
            endpoint
          );

          //insert user

          let result = await bcrypt.Sync(newAccount.password, 10);
          newAccount.password = result;

          console.log(newAccount);

          let query = `INSERT INTO account Set ?`;
          let query2 = `INSERT INTO docteur Set ?`;

          if (sqlQuery(query, newAccount)) {
            let res = await sqlQuery(`SELECT * FROM account `);

            newDoctor.Account = res[res.length - 1].Id;
            newDoctor.Cabinet = Cab;

            if (sqlQuery(query2, newDoctor)) {
              SendEmail(userInfo);
            }

            console.log(newDoctor);
          }
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  }
};

exports.DeleteDoctor = async (req, resp) => {
  let IdDoctor = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let res = await sqlQuery(
        `SELECT Account  FROM docteur WHERE Id = '${IdDoctor}'`
      );

      if (sqlQuery(`DELETE FROM docteur WHERE Id ='${IdDoctor}'`)) {
        if (sqlQuery(`DELETE FROM account WHERE Id ='${res[0].Account}'`)) {
          resp
            .status(201)
            .json({ message: "Le docteur a été supprimer avec succés" });
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateDoctor = async (req, resp) => {
  let id = req.user;
  let Cab = req.ID;

  let newDoctor = new Doctor(
    req.body.Doctor_modif.Nom,
    req.body.Doctor_modif.Prénom,
    req.body.Doctor_modif.Spécialité,
    req.body.Doctor_modif.CIN,
    req.body.Doctor_modif.Tel,
    req.body.Doctor_modif.Email
  );

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      if (
        sqlQuery(
          `UPDATE docteur SET Nom = '${newDoctor.nom}', Prénom = '${newDoctor.prénom}', Spécialité = '${newDoctor.spécialité}', CIN =' ${newDoctor.CIN}', Tel = '${newDoctor.tel}', Email = '${newDoctor.email}' WHERE Id ='${req.body.Doctor_modif.Id}'`
        ) &&
        sqlQuery(
          `UPDATE cabinet SET Adresse = '${req.body.Cabinet_modif.Adresse}', Email = '${req.body.Cabinet_modif.Email}', Tel = '${req.body.Cabinet_modif.Tel}' WHERE Id ='${req.body.Cabinet_modif.Id}'`
        )
      ) {
        resp
          .status(201)
          .json({ message: "Les informations ont été modifier avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.DoctorList = async (req, resp) => {
  let Cab = req.params.cabinet;
  let id = req.user;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let res = await sqlQuery(
        `SELECT * FROM docteur WHERE Cabinet = '${Cab}'`
      );

      resp.status(201).json({
        ListDoctor: res,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateAvatarDocteur = async (req, resp) => {
  let IdDocteur = req.params.id;
  let Avatar = req.body.file;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      resp
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query = `UPDATE  docteur Set Avatar = '${Avatar}'  WHERE id = '${IdDocteur}'`;

      if (sqlQuery(query)) {
        resp
          .status(201)
          .json({ message: "Votre photo a été changer avec succés" });
        console.log("hello");
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};
