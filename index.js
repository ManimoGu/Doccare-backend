

const express = require("express")
const cors = require("cors")
const {DB} = require('./Config/mysql');
const bodyparser = require("body-parser")
const { register, verify, Signin, resend, forgot, resetPass} = require("./API/auth");
const { API_URL } = require("./config/api");
const { DoctorProfil, AddDoctor, DeleteDoctor, UpdateDoctor, DoctorList } = require("./API/doctor");
const { AddAssistante, DeleteAssistante, UpdateAssistante, AssistanteList } = require("./API/Assistante");
const { PatientNbr, PatientList, AddPatient } = require("./API/Patient");
const { ReviewsNbr } = require("./API/Reviews");
const { ConsultationNbr, ConsultationTotal, DashList, ConsultationList } = require("./API/Consultations");

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

  app.get("/api/Doctor/AddAssistante/:cabinet", AddAssistante);

  app.get("/api/Doctor/DeleteAssistante/:id", DeleteAssistante);
  
  app.get("/api/Doctor/UpdateAssistante/:id",UpdateAssistante);

  app.get("/api/Doctor/AssistanteList/id/:id", AssistanteList);

  // Patient API 

  app.get("/api/Doctor/NombredePatient/id/:id", PatientNbr);
  app.get("/api/Doctor/DashboardList/id/:id", DashList);
  app.get("/api/Doctor/PatientsList/id/:id", PatientList);
  app.post("/api/Doctor/AddPatient/id/:id", AddPatient);



  // Feedback API

  app.get("/api/Doctor/NombredAvis/id/:id", ReviewsNbr);


  // Consultation API 


app.get("/api/Doctor/NombreConsultation/id/:id", ConsultationNbr);
app.get("/api/Doctor/TotalConsultation/id/:id", ConsultationTotal);
app.get("/api/Doctor/ListConsultation/id/:id", ConsultationList);


