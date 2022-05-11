class FicheConsultation {

    constructor(Observation='', Ordonnance='', Certificat='', Analyse='', Autre='', Date_création= new Date(), Dossier_medical, Consultation ){

         this.Observation = Observation;
         this.Ordonnance = Ordonnance;
         this.Certificat = Certificat;
         this.Analyse = Analyse;
         this.Autre = Autre;
         this.Date_création = Date_création;
         this.Dossier_medical = Dossier_medical;
         this.Consultation = Consultation;
    
    }
}

exports.FicheConsultation = FicheConsultation;