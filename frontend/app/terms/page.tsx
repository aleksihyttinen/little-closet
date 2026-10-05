import LegalPage from "../components/LegalPage";

export const metadata = { title: "Käyttöehdot / Terms of Service" };

const CONTACT = "alehyt@gmail.com";

export default function TermsPage() {
  return (
    <LegalPage
      fi={{
        title: "Käyttöehdot",
        updated: "Päivitetty 5.10.2026",
        sections: [
          {
            heading: "Palvelu",
            body: [
              "Little Closet on vaatekaapin hallintaan ja pukeutumisehdotuksiin tarkoitettu palvelu. Käyttämällä palvelua hyväksyt nämä ehdot.",
            ],
          },
          {
            heading: "Tilisi",
            body: [
              "Vastaat tilisi käytöstä ja siitä, että antamasi tiedot ovat oikeita. Älä käytä palvelua lainvastaiseen tarkoitukseen äläkä yritä päästä muiden tietoihin.",
            ],
          },
          {
            heading: "Tekoälyehdotukset",
            body: [
              "Pukeutumisehdotukset ja kuva-analyysit tuottaa tekoäly, ja ne voivat olla virheellisiä. Käytä niitä ohjeellisina ja tarkista ne itse.",
            ],
          },
          {
            heading: "Vastuu",
            body: [
              "Palvelu tarjotaan sellaisenaan ilman takuita. Emme vastaa palvelun katkoksista tai tietojen menetyksestä siltä osin kuin laki sallii.",
            ],
          },
          {
            heading: "Muutokset ja päättäminen",
            body: [
              "Voimme muuttaa näitä ehtoja tai palvelua. Voit lopettaa käytön milloin tahansa ja pyytää tilisi poistoa.",
            ],
          },
          { heading: "Yhteystiedot", body: [CONTACT] },
        ],
      }}
      en={{
        title: "Terms of Service",
        updated: "Updated 5 October 2026",
        sections: [
          {
            heading: "The service",
            body: [
              "Little Closet is a service for managing your wardrobe and getting outfit suggestions. By using it you agree to these terms.",
            ],
          },
          {
            heading: "Your account",
            body: [
              "You are responsible for your account and for the accuracy of the information you provide. Do not use the service for unlawful purposes or try to access other people's data.",
            ],
          },
          {
            heading: "AI suggestions",
            body: [
              "Outfit suggestions and image analysis are produced by AI and may be wrong. Treat them as guidance and check them yourself.",
            ],
          },
          {
            heading: "Liability",
            body: [
              "The service is provided as is, without warranties. To the extent the law allows, we are not liable for outages or loss of data.",
            ],
          },
          {
            heading: "Changes and ending use",
            body: [
              "We may change these terms or the service. You can stop using it at any time and ask for your account to be deleted.",
            ],
          },
          { heading: "Contact", body: [CONTACT] },
        ],
      }}
    />
  );
}
