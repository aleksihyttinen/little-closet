import LegalPage from "../components/LegalPage";

export const metadata = { title: "Tietosuojaseloste / Privacy Policy" };

const CONTACT = "alehyt@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPage
      fi={{
        title: "Tietosuojaseloste",
        updated: "Päivitetty 5.10.2026",
        sections: [
          {
            heading: "Mitä tietoja keräämme",
            body: [
              "Kirjautuessasi Google-tilillä tai sähköpostilla tallennamme nimesi, sähköpostiosoitteesi ja kirjautumiseen tarvittavat tiedot. Google-kirjautumisesta saamme vain nämä perustiedot.",
              "Tallennamme lisäämäsi vaatteet, kategoriat ja koot. Ne näkyvät vain sinulle.",
            ],
          },
          {
            heading: "Miten käytämme tietoja",
            body: [
              "Käytämme tietoja palvelun tarjoamiseen: kirjautumiseen, vaatekaapin näyttämiseen ja pukeutumisehdotusten luomiseen. Emme myy tietoja emmekä käytä niitä mainontaan.",
              "Pukeutumisehdotusta varten sijaintisi (pyöristettynä) lähetetään Open-Meteo-säätietopalveluun ja vaatekaappisi sisältö tekoälypalveluun ehdotuksen muodostamiseksi. Vaatteen kuvaa analysoidessa kuva lähetetään tekoälypalveluun, eikä sitä tallenneta.",
            ],
          },
          {
            heading: "Palveluntarjoajat",
            body: [
              "Tietoja käsittelevät Neon (tietokanta ja kirjautuminen), Render (palvelun ylläpito), Google (kirjautuminen), Open-Meteo (sää) ja tekoälypalvelun tarjoaja.",
            ],
          },
          {
            heading: "Säilytys ja oikeutesi",
            body: [
              "Säilytämme tietoja niin kauan kuin tilisi on olemassa. Voit pyytää tietojesi katsomista, korjaamista tai poistamista ottamalla yhteyttä alla olevaan osoitteeseen.",
            ],
          },
          { heading: "Yhteystiedot", body: [CONTACT] },
        ],
      }}
      en={{
        title: "Privacy Policy",
        updated: "Updated 5 October 2026",
        sections: [
          {
            heading: "What we collect",
            body: [
              "When you sign in with Google or email, we store your name, email address and the data needed to sign you in. From Google we only receive these basic profile details.",
              "We store the clothing items, categories and sizes you add. They are visible only to you.",
            ],
          },
          {
            heading: "How we use it",
            body: [
              "We use the data to run the service: signing you in, showing your wardrobe and generating outfit suggestions. We do not sell your data or use it for advertising.",
              "To suggest an outfit, your approximate location is sent to the Open-Meteo weather service and your wardrobe contents are sent to an AI service. When you analyze a clothing photo, the image is sent to an AI service and is not stored.",
            ],
          },
          {
            heading: "Service providers",
            body: [
              "Data is processed by Neon (database and sign-in), Render (hosting), Google (sign-in), Open-Meteo (weather) and the AI service provider.",
            ],
          },
          {
            heading: "Retention and your rights",
            body: [
              "We keep your data as long as your account exists. You can ask to see, correct or delete your data by contacting the address below.",
            ],
          },
          { heading: "Contact", body: [CONTACT] },
        ],
      }}
    />
  );
}
