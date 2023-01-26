

const express = require("express")
const cors = require("cors")
const bodyparser = require("body-parser")
const { register, verify, Signin, resend, forgot, resetPass, reseSettingtPass, UploadFile} = require("./API/auth");
const { API_URL } = require("./config/api");
const { DoctorProfil, AddDoctor, DeleteDoctor, UpdateDoctor, DoctorList, UpdateAvatarDocteur } = require("./API/doctor");
const { AddAssistante, DeleteAssistante, UpdateAssistante, AssistanteList, UpdateAvatarAssistante } = require("./API/Assistante");
const { PatientNbr, PatientList, AddPatient, UpdatePatient, DeletePatient, Patient_consultations, PatientFiles } = require("./API/Patient");
const { ReviewsNbr, ListMessage, AddResp, getResponse } = require("./API/Reviews");
const { ConsultationNbr, ConsultationTotal, DashList, ConsultationList, UpdateConsultation } = require("./API/Consultations");
const { ADDRDV, RDVList, DeleteRDV, UpdateRDV, RDVNbr, TypeUpdate} = require("./API/RDV");
const fileupload = require("express-fileupload");
const path = require('path')
const JWT = require("jsonwebtoken");
const { Access } = require("./Helpers/JwtVerification");
//create an app 

const app = express();

app.use(fileupload());

app.use(express.json())


//enable Listening http server

app.listen("9000", (req, resp) => {
    console.log("Server is runing on port 9000..." + __dirname);
  });

  app.use(bodyparser.urlencoded({limit: "50mb", extended : true, parameterLimit : 50000}))

//looks at requests where the content-type : application-json (header).
  app.use(bodyparser.json())

  app.use(cors({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }))

  app.use(express.static('API'))


  // Signin API

  app.post("/api/auth/register", register);

  app.get("/api/verify-email/:login/code/:token", verify);

  app.get("/api/Signin/:login/pass/:password", DoctorProfil);

  app.get("/api/resend/:login/code/:token", resend);

  app.post("/api/fogot_password/:login",forgot)

  app.post("/api/resetpassword/:login/code/:token", resetPass)

  app.post("/api/resetpasswordSetting/:login/code/:password",Access, reseSettingtPass)

  app.post("/api/UploadFile/Nom/:Nom/Prenom/:Prenom/type/:type",Access, UploadFile)

  // Doctors API 

  app.get("/api/Doctor/DoctorProfil/:login/password/:password", DoctorProfil);

  app.get("/api/Doctor/AddDoctor/:cabinet",Access, AddDoctor);

  app.get("/api/Doctor/DeleteDoctor/:Id",Access, DeleteDoctor);
  
  app.post("/api/Doctor/UpdateDoctorCabinet",Access, UpdateDoctor);

  app.get("/api/Doctor/DoctorList/id/:id",Access, DoctorList);


  app.put("/api/Doctor/DoctorList/UpdatePic/id/:id",Access, UpdateAvatarDocteur);


  // Assistante API 

  app.post("/api/Doctor/AddAssistante/id/:cabinet",Access, AddAssistante);

  app.delete("/api/Doctor/DeleteAssistante/id/:id",Access, DeleteAssistante);
  
  app.put("/api/Doctor/UpdateAssistante/id/:id",Access,UpdateAssistante);

  app.get("/api/Doctor/AssistanteList/id/:id",Access, AssistanteList);

  app.put("/api/Doctor/AssistanteList/ChangePic/id/:id",Access, UpdateAvatarAssistante);


  // Patient API 

  app.get("/api/Doctor/NombredePatient/id/:id",Access, PatientNbr);
  app.get("/api/Doctor/DashboardList/id/:id",Access, DashList);
  app.get("/api/Doctor/PatientsList/id/:id",Access,PatientList);
  app.post("/api/Doctor/AddPatient/id/:id",Access, AddPatient);
  app.put("/api/Doctor/UpdatePatient/id/:id",Access, UpdatePatient);
  app.put("/api/Doctor/DeletePatient/id/:id/:Account",Access, DeletePatient);
  app.get("/api/Doctor/Patient_fiche_consultation/Cabinet/:idCabinet/Patient/:idPatient",Access, Patient_consultations);
  app.put("/api/Doctor/Patient_fiche_consultation/AddFile/idFiche/:idFiche", PatientFiles)



  // Feedback API

  app.get("/api/Doctor/NombredAvis/id/:id",Access, ReviewsNbr);
  app.get("/api/Doctor/ListMessage/id/:id",Access, ListMessage);
  app.post ("/api/Doctor/AddResponse/id/:id",Access, AddResp);
  app.get ("/api/Doctor/GetResponse/id/:id",Access, getResponse);



  // Consultation API 


app.get("/api/Doctor/NombreConsultation/id/:id",Access, ConsultationNbr);
app.get("/api/Doctor/TotalConsultation/id/:id",Access,ConsultationTotal);
app.get("/api/Doctor/ListConsultation/id/:id",Access, ConsultationList);
app.put("/api/Doctor/UpdateConsultation/id",Access, UpdateConsultation);
 

  // RVD API 

  app.put("/api/DoctorAssistante/AddRDV/id/:id",Access, ADDRDV);
  app.get("/api/DoctorAssistante/ListRDV/id/:id",Access, RDVList);
  app.delete("/api/DoctorAssistante/DeleteRDV/id/:id",Access, DeleteRDV);
  app.put("/api/DoctorAssistante/UpdateRDV/id/:id",Access, UpdateRDV);
  app.get("/api/DoctorAssistante/NBRRDV/id/:id",Access, RDVNbr);
  app.get("/api/DoctorAssistante/UpdateType/id/:id/Patient/:Patient",Access, TypeUpdate);





