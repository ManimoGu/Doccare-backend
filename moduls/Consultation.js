class Consultation {
  constructor(Motif = "", Description = "", Montant, Status = "", RDV) {
    this.Motif = Motif;
    this.Description = Description;
    this.Montant = Montant;
    this.Status = Status;
    this.RDV = RDV;
  }
}

exports.Consultation = Consultation;
