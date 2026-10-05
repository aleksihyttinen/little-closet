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
          {
            heading: "Googlen käyttäjätiedot",
            body: [
              "Little Closet on vanhemmille tarkoitettu sovellus lasten vaatteiden hallintaan. Jos valitset Google-kirjautumisen, käytämme vain nimeäsi, sähköpostiosoitettasi ja profiilikuvaasi tilin luomiseen ja kirjautumiseen.",
              "Emme pyydä pääsyä Gmailiin, Driveen, yhteystietoihin, kalenteriin tai muihin Google-tietoihin. Googlen API-palveluista saatujen tietojen käyttö noudattaa Google API Services User Data Policy -käytäntöä, mukaan lukien Limited Use -vaatimukset.",
              "Emme jaa Google-tietoja kolmansille osapuolille lukuun ottamatta alla mainittuja palvelun tuottajia, emme käytä niitä mainontaan, eikä kukaan lue niitä muutoin kuin tietoturvan, tuen tai lain vaatimuksesta.",
            ],
          },
          {
            heading: "Evästeet ja tietoturva",
            body: [
              "Käytämme istuntoevästettä ja selaimen paikallista tallennustilaa vain kirjautumisen ja kielivalinnan muistamiseen. Emme käytä mainos- tai seurantaevästeitä. Tiedot siirretään HTTPS-yhteydellä.",
            ],
          },
          {
            heading: "Lapset",
            body: [
              "Palvelu on tarkoitettu aikuisille. Emme kerää henkilötietoja lapsista; vaatemerkinnät kuvaavat vain vaatteita, kuten tyyppiä, kokoa ja vuodenaikaa.",
            ],
          },
          {
            heading: "Muutokset",
            body: ["Voimme päivittää tätä selostetta ja muutamme silloin yllä olevan päivämäärän."],
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
          {
            heading: "Google user data",
            body: [
              "Little Closet is a wardrobe app for parents to keep track of their children's clothes. If you choose Google sign-in, we access only your name, email address and profile picture, solely to create your account and sign you in.",
              "We do not request access to your Gmail, Drive, contacts, calendar or any other Google data. Our use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
              "We do not share Google user data with third parties except the providers listed below that run the service, we do not use it for advertising, and no humans read it except as needed for security, support or legal reasons.",
            ],
          },
          {
            heading: "Cookies and security",
            body: [
              "We use a session cookie and local browser storage only to keep you signed in and remember your language. We do not use advertising or tracking cookies. Data is transmitted over HTTPS and access is restricted to your account.",
            ],
          },
          {
            heading: "Children",
            body: [
              "The service is intended for adults. We do not collect personal data about children; clothing entries describe items only, such as type, size and season.",
            ],
          },
          {
            heading: "Changes",
            body: ["We may update this policy and will change the date above when we do."],
          },
          { heading: "Contact", body: [CONTACT] },
        ],
      }}
    />
  );
}
