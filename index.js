

const express = require("express")
const cors = require("cors")
const {DB} = require('./Config/mysql');
const bodyparser = require("body-parser")
const { register, verify, Signin, resend, forgot, resetPass} = require("./API/auth");
const { API_URL } = require("./config/api");
const { DoctorProfil, AddDoctor, DeleteDoctor, UpdateDoctor, DoctorList } = require("./API/doctor");
const { AddAssistante, DeleteAssistante, UpdateAssistante, AssistanteList } = require("./API/Assistante");
const { PatientNbr, PatientList, AddPatient, UpdatePatient, DeletePatient } = require("./API/Patient");
const { ReviewsNbr, ListMessage, AddResp, getResponse } = require("./API/Reviews");
const { ConsultationNbr, ConsultationTotal, DashList, ConsultationList, UpdateConsultation } = require("./API/Consultations");
const { ADDRDV, RDVList, DeleteRDV, UpdateRDV, RDVNbr } = require("./API/RDV");

//create an app 

const app = express();

//enable Listening http server

app.listen("9000", (req, resp) => {
    console.log("Server is runing on port 9000...");
  });

  app.use(bodyparser.urlencoded({extended : true}))

//looks at requests where the content-type : application-json (header).
  app.use(bodyparser.json())

  app.use(cors())


  // Signin API

  app.post("/api/auth/register", register);

  app.get("/api/verify-email/:login/code/:token", verify);

  app.post("/api/Signin/:login/pass/:password", Signin);

  app.get("/api/resend/:login/code/:token", resend);

  app.post("/api/fogot_password/:login",forgot)

  app.post("/api/resetpassword/:login/code/:token", resetPass)

  // Doctors API 

  app.get("/api/Doctor/DoctorProfil/:login/password/:password", DoctorProfil);

  app.get("/api/Doctor/AddDoctor/:cabinet", AddDoctor);

  app.get("/api/Doctor/DeleteDoctor/:Id", DeleteDoctor);
  
  app.get("/api/Doctor/UpdateDoctor/:Id", UpdateDoctor);

  app.get("/api/Doctor/DoctorList", DoctorList);


  // Assistante API 

  app.post("/api/Doctor/AddAssistante/id/:cabinet", AddAssistante);

  app.delete("/api/Doctor/DeleteAssistante/id/:id", DeleteAssistante);
  
  app.put("/api/Doctor/UpdateAssistante/id/:id",UpdateAssistante);

  app.get("/api/Doctor/AssistanteList/id/:id", AssistanteList);

  // Patient API 

  app.get("/api/Doctor/NombredePatient/id/:id", PatientNbr);
  app.get("/api/Doctor/DashboardList/id/:id", DashList);
  app.get("/api/Doctor/PatientsList/id/:id", PatientList);
  app.post("/api/Doctor/AddPatient/id/:id", AddPatient);
  app.put("/api/Doctor/UpdatePatient/id/:id", UpdatePatient);
  app.put("/api/Doctor/DeletePatient/id/:id", DeletePatient);



  // Feedback API

  app.get("/api/Doctor/NombredAvis/id/:id", ReviewsNbr);
  app.get("/api/Doctor/ListMessage/id/:id", ListMessage);
  app.post ("/api/Doctor/AddResponse/id/:id", AddResp);
  app.get ("/api/Doctor/GetResponse/id/:id", getResponse);


  // Consultation API 


app.get("/api/Doctor/NombreConsultation/id/:id", ConsultationNbr);
app.get("/api/Doctor/TotalConsultation/id/:id", ConsultationTotal);
app.get("/api/Doctor/ListConsultation/id/:id", ConsultationList);
app.put("/api/Doctor/UpdateConsultation/id", UpdateConsultation);


  // RVD API 

  app.put("/api/DoctorAssistante/AddRDV/id/:id", ADDRDV);
  app.get("/api/DoctorAssistante/ListRDV/id/:id", RDVList);
  app.delete("/api/DoctorAssistante/DeleteRDV/id/:id", DeleteRDV);
  app.put("/api/DoctorAssistante/UpdateRDV/id/:id", UpdateRDV);
  app.get("/api/DoctorAssistante/NBRRDV/id/:id", RDVNbr);



