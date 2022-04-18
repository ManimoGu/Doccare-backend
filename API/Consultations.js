const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

exports.DashList = async (req, resp) => {

  let Cab = req.params.id;

  try {

    let List = await sqlQuery(
      `SELECT * FROM Patient join rdv on Patient.Id = rdv.Patient WHERE Cabinet = '${Cab}'`
    );
       

   resp.status(201).json({
     listCons: List
   });
   
  } catch (err) {
    console.log(err.message);
  }
};

exports.ConsultationList = async (req, resp) => {

  let Cab = req.params.id;
 

  try {

    let List = await sqlQuery(
      `SELECT * FROM Consultation join rdv on consultation.Rdv = rdv.id join patient on patient.id = rdv.Patient WHERE Cabinet = '${Cab}'`
    );
       

   resp.status(201).json({
      AllCons: List
   });

 
  } catch (err) {
    console.log(err.message);
  }




};

exports.ConsultationNbr = async (req, resp) => {
  let Cab = req.params.id;
  console.log(Cab)


  try {
    let ConsList = await sqlQuery(
      `SELECT COUNT(*) as nbr FROM consultation  JOIN rdv ON consultation.RDV = rdv.Id WHERE rdv.Cabinet = '${Cab}' `
    );

    resp.status(201).json({
      NbrConsultation: ConsList[0].nbr,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.ConsultationTotal = async (req, resp) => {
  let Cab = req.params.Id;

  try {
    let total = await sqlQuery(
      `SELECT SUM(Montant) as somme FROM consultation JOIN rdv ON consultation.RDV = rdv.Id WHERE rdv.Cabinet = '${Cab}'`
    );

    resp.status(201).json({
      TotalConsultation: total[0].somme,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateConsultation = async (req, resp) => {



console.log(req.body)
 
  try{

  let query1 = `UPDATE consultation Set Description = '${req.body.Description}', Motif = '${req.body.Motif}', Montant = '${req.body.Montant}' WHERE id = '${req.body.Id}'`;
  
  if( sqlQuery(query1)){


    resp
    .status(201)
    .json({ message: "Update Success" });

  }

}catch{(err) => console.log(err.message)}
  

};


