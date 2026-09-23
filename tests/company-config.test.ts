import { describe, expect, it } from "vitest";
import { companyConfig, companyAddressLines } from "../lib/company/config";

describe("public company configuration", () => {
  it("contains the supplied operator identification in one shared source", () => {
    expect(companyConfig).toMatchObject({ legalName: "Titan Construct engineering s.r.o.", ico: "45243051", dic: "2022916808", vatId: "SK2022916808", email: "eco239672@gmail.com", phone: "+421 905 572 393" });
    expect(companyAddressLines()).toEqual(["Komenského 1723/8", "927 05 Šaľa", "Slovenská republika"]);
  });
});
