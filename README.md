# Veiligheidsdashboard — SamenOntzorgen

Compliance- en veiligheidsdashboard voor zorginstellingen. Hiermee kan een instelling met één druk op de knop aantonen dat de zelfstandige zorgprofessionals (CZO's) waarmee zij werkt aantoonbaar bevoegd én aantoonbaar zelfstandig zijn.

## Functionaliteit

- **Instelling-overzicht**: actieve CZO's met statuskleur, metric-cards en kwartaalaudit-signaal
- **CZO-dossier**: twee gescheiden secties (Bekwaamheid en Ondernemerschap)
- **Negen gezichtspunten**: gewogen beoordeling op basis van het Deliveroo/Uber-arrest
- **Bewijspakket-generator**: gedateerd PDF in drie varianten (DBA, Kwaliteit, Volledig)
- **Aandachtspunten**: roostervervanging-signaal, alleen-via-SO-signaal, auditmelding
- **Toegangslog**: AVG-conforme registratie van elke inzage en PDF-generatie
- **Data-adapter**: schakelbaar tussen mock-data (nu) en APM-koppeling (fase 2)

## Lokaal draaien

### Met mock-data (geen database nodig)

```bash
cp .env.example .env
# Zet DATA_ADAPTER=mock in .env (dit is de standaard)
npm install
npm run dev
```

Ga naar http://localhost:3000

Demo-accounts:
- `inkoop@delinden.nl` / `linden123` — Zorginkoper (Thuiszorg De Linden)
- `beheerder@samenontzorgen.nl` / `beheerder123` — SamenOntzorgen beheerder

### Met database (docker-compose)

```bash
cp .env.example .env
docker-compose up --build
```

Dit start de app op http://localhost:3000 met een PostgreSQL-database.

## Deployen op Railway

### Configuratie in Railway

| Instelling | Waarde |
|---|---|
| Root Directory | `/` (repo-root) |
| Build Command | *(leeg — Dockerfile wordt gebruikt)* |
| Start Command | *(leeg — Dockerfile CMD wordt gebruikt)* |
| Dockerfile | `./Dockerfile` |

### Omgevingsvariabelen in Railway

```
DATABASE_URL=         # PostgreSQL connection string van Railway
NEXTAUTH_SECRET=      # Lang willekeurig geheim (bijv. `openssl rand -base64 32`)
NEXTAUTH_URL=         # Volledige URL van de deployment (bijv. https://dashboard.samenontzorgen.nl)
DATA_ADAPTER=         # 'mock' voor fase 1, 'apm' voor productie
PORT=                 # Wordt automatisch door Railway ingesteld
```

### Database migratie

Na eerste deploy:
```bash
railway run npx prisma db push
```

## Testen

```bash
npm test
```

22 tests voor kernlogica: scoping (toegangscontrole), gezichtspuntenscoring (gewogen), signalen (aandachtspunten).

## Fasering

- **Fase 1 (nu)**: volledig werkend op mock/seed-data
- **Fase 2**: echte APM-adapter — vul `src/lib/adapters/apm.ts` in
- **Fase 3**: live KvK- en BIG-API-verificatie

## Privacy / AVG

- Scoping wordt op API-niveau afgedwongen (niet alleen UI)
- Toegangslog registreert elke inzage en PDF-generatie
- VOG wordt als bijzonder persoonsgegeven geflagd in de log
- Verwerkersovereenkomst vereist per zorginstelling (juridisch — zie `src/lib/adapters/interface.ts`)
