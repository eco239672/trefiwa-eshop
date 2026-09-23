/** Public operator information. Keep it centralized so legal and commercial UI cannot drift. */
export const companyConfig = {
  legalName: "Titan Construct engineering s.r.o.",
  ico: "45243051",
  dic: "2022916808",
  vatId: "SK2022916808",
  legalForm: "spoločnosť s ručením obmedzeným",
  address: {
    street: "Komenského 1723/8",
    postalCode: "927 05",
    city: "Šaľa",
    country: "Slovenská republika",
  },
  registry: "Obchodný register Okresného súdu Trnava, oddiel Sro, vložka č. 24589/T",
  email: "eco239672@gmail.com",
  // Preserved from the existing public Header contact strip; it was not invented here.
  phone: "+421 905 572 393",
} as const;

export function companyAddressLines() {
  return [companyConfig.address.street, `${companyConfig.address.postalCode} ${companyConfig.address.city}`, companyConfig.address.country];
}
