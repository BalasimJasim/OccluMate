export const COMMON_MEDICATIONS = [
  {
    name: 'Amoxicillin',
    commonDosages: ['250mg', '500mg'],
    commonFrequencies: ['Every 8 hours', 'Every 12 hours'],
    type: 'antibiotic'
  },
  {
    name: 'Ibuprofen',
    commonDosages: ['200mg', '400mg', '600mg'],
    commonFrequencies: ['Every 4-6 hours', 'Every 8 hours'],
    type: 'pain-relief'
  },
  // Add more medications
];

export const MEDICATION_CATEGORIES = {
  antibiotics: ['Amoxicillin', 'Clindamycin', 'Metronidazole'],
  painRelievers: ['Ibuprofen', 'Acetaminophen', 'Naproxen'],
  anesthetics: ['Lidocaine', 'Benzocaine'],
  // Add more categories
}; 