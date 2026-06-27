import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link, renderToBuffer } from '@react-pdf/renderer'
import type { CZODossier, BewijspakketVariant, Zorginstelling, Aandachtspunt } from '@/types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { kvkZoekUrl, bigZoekUrl } from '@/lib/verificatie'

const stijlen = StyleSheet.create({
  pagina: { padding: 48, fontFamily: 'Helvetica', fontSize: 10, color: '#111827' },
  kop: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  sectieKop: { fontSize: 13, fontWeight: 'bold', marginTop: 20, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  rij: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, color: '#6b7280', fontWeight: 'bold' },
  waarde: { flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, fontSize: 9 },
  badgeGroen: { backgroundColor: '#dcfce7', color: '#14532d' },
  badgeOranje: { backgroundColor: '#fef3c7', color: '#78350f' },
  badgeRood: { backgroundColor: '#fee2e2', color: '#7f1d1d' },
  verklaring: { marginTop: 24, padding: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
  tabelKop: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 4, marginBottom: 2 },
  tabelRij: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4 },
  kolom1: { flex: 2 },
  kolom2: { flex: 1 },
  kolom3: { flex: 1 },
  link: { color: '#1d4ed8', textDecoration: 'underline' },
  bronRij: { flexDirection: 'row', marginBottom: 2 },
  bronLabel: { width: 100, color: '#6b7280', fontSize: 9 },
  samenvatting: { marginTop: 24, padding: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  samenvattingKop: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  samenvattingRij: { flexDirection: 'row', marginBottom: 3 },
  samenvattingLabel: { width: 170, color: '#6b7280' },
})

type BadgeStijl = ReturnType<typeof StyleSheet.create>[string]

function statusBadgeStijl(status: string): BadgeStijl {
  if (status === 'GELDIG' || status === 'CONFORM') return stijlen.badgeGroen
  if (status === 'AANDACHT') return stijlen.badgeOranje
  return stijlen.badgeRood
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    GELDIG: 'Geldig', AANDACHT: 'Aandacht', ONTBREEKT: 'Ontbreekt', CONFORM: 'Conform', RISICO: 'Risico',
  }
  return map[status] ?? status
}

function documentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    DIPLOMA: 'Diploma', BIG: 'BIG-registratie', VOG: 'VOG',
    BAV: 'Beroepsaansprakelijkheidsverzekering', AOV: 'Arbeidsongeschiktheidsverzekering',
    WKKGZ: 'Wkkgz-klachtaansluiting', SCHOLING: 'Scholing', KVK: 'KvK-uittreksel',
  }
  return map[type] ?? type
}

function bouwPaginaInhoud(params: {
  zorginstelling: Zorginstelling
  dossiers: CZODossier[]
  variant: BewijspakketVariant
  generatorNaam: string
  gegenereerd: Date
  aandachtspunten: Aandachtspunt[]
}): React.ReactElement[] {
  const { zorginstelling, dossiers, variant, generatorNaam, gegenereerd, aandachtspunten } = params
  const variantLabel = { DBA: 'Belastingdienst (DBA)', KWALITEIT: 'Kwaliteitscontrole', VOLLEDIG: 'Volledig' }[variant]
  const geformatteerdDatum = format(gegenereerd, 'PPPPp', { locale: nl })
  const toonBekwaamheid = variant === 'KWALITEIT' || variant === 'VOLLEDIG'
  const toonOndernemerschap = variant === 'DBA' || variant === 'VOLLEDIG'

  const inhoud: React.ReactElement[] = [
    // Kop
    React.createElement(View, { key: 'kop', style: stijlen.kop },
      React.createElement(Text, { style: stijlen.title }, 'Kwalificatie en ondernemersverklaring — SamenOntzorgen'),
      React.createElement(Text, { style: stijlen.subtitle }, `Opdrachtgever: ${zorginstelling.naam}`),
      React.createElement(Text, { style: stijlen.subtitle }, `Variant: ${variantLabel}`),
      React.createElement(Text, { style: stijlen.subtitle }, `Gegenereerd door: ${generatorNaam}`),
      React.createElement(Text, { style: stijlen.subtitle }, `Datum/tijd: ${geformatteerdDatum}`),
    ),
    // Systeemverklaring
    React.createElement(View, { key: 'verklaring', style: stijlen.verklaring },
      React.createElement(Text, { style: { fontWeight: 'bold', marginBottom: 4 } }, 'Verklaring systeem-compliance'),
      React.createElement(Text, {},
        'De onderstaande CZOs zijn op de hierboven vermelde datum actief als lid van SamenOntzorgen Cooperatie U.A. ' +
        'De ledenadministratie kan een niet-compliant lid technisch niet activeren: pas als alle vereiste documenten zijn ingevoerd en gecontroleerd, ' +
        'wordt een lid als actief geregistreerd. De actieve lidstatus impliceert per definitie volledige compliance op het moment van genereren.'
      ),
    ),
  ]

  for (const dossier of dossiers) {
    inhoud.push(
      React.createElement(View, { key: `czo-${dossier.czo.id}` },
        React.createElement(Text, { style: stijlen.sectieKop },
          dossier.czo.bedrijfsnaam ? `${dossier.czo.bedrijfsnaam} (${dossier.czo.naam})` : dossier.czo.naam
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'Functie:'),
          React.createElement(Text, { style: stijlen.waarde }, dossier.czo.functie ?? '-'),
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'KvK-nummer:'),
          dossier.czo.kvkNummer
            ? React.createElement(Link, { style: [stijlen.waarde, stijlen.link], src: kvkZoekUrl(dossier.czo.kvkNummer) }, `${dossier.czo.kvkNummer} (controleer bij KVK)`)
            : React.createElement(Text, { style: stijlen.waarde }, 'Niet geregistreerd'),
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'BIG-nummer:'),
          dossier.czo.bigNummer
            ? React.createElement(Link, { style: [stijlen.waarde, stijlen.link], src: bigZoekUrl(dossier.czo.bigNummer) }, `${dossier.czo.bigNummer} (controleer bij BIG-register)`)
            : React.createElement(Text, { style: stijlen.waarde }, 'Niet geregistreerd'),
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'Website:'),
          dossier.czo.website
            ? React.createElement(Link, { style: [stijlen.waarde, stijlen.link], src: dossier.czo.website }, dossier.czo.website)
            : React.createElement(Text, { style: stijlen.waarde }, 'Niet geregistreerd'),
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'LinkedIn:'),
          dossier.czo.linkedinUrl
            ? React.createElement(Link, { style: [stijlen.waarde, stijlen.link], src: dossier.czo.linkedinUrl }, dossier.czo.linkedinUrl)
            : React.createElement(Text, { style: stijlen.waarde }, 'Niet geregistreerd'),
        ),
        React.createElement(View, { style: stijlen.rij },
          React.createElement(Text, { style: stijlen.label }, 'Status als lid:'),
          React.createElement(Text, { style: [stijlen.badge, statusBadgeStijl(dossier.czo.status)] }, dossier.czo.status),
        ),

        ...toonBekwaamheid ? [
          React.createElement(Text, { key: 'hdr-bkw', style: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 } }, 'Bekwaamheidsdossier'),
          React.createElement(View, { key: 'hdr-bkw-kop', style: stijlen.tabelKop },
            React.createElement(Text, { style: stijlen.kolom1 }, 'Document'),
            React.createElement(Text, { style: stijlen.kolom2 }, 'Status'),
            React.createElement(Text, { style: stijlen.kolom3 }, 'Geldig t/m'),
          ),
          ...dossier.documenten
            .filter(d => ['DIPLOMA', 'BIG', 'VOG', 'WKKGZ', 'SCHOLING'].includes(d.type))
            .map(doc =>
              React.createElement(View, { key: `bkw-${doc.id}`, style: stijlen.tabelRij },
                React.createElement(Text, { style: stijlen.kolom1 }, documentTypeLabel(doc.type)),
                React.createElement(Text, { style: [stijlen.kolom2, stijlen.badge, statusBadgeStijl(doc.status)] }, statusLabel(doc.status)),
                React.createElement(Text, { style: stijlen.kolom3 }, doc.vervaldatum ? format(new Date(doc.vervaldatum), 'dd-MM-yyyy') : '—'),
              )
            ),
        ] : [],

        ...toonOndernemerschap ? [
          React.createElement(Text, { key: 'hdr-ond', style: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 } }, 'Ondernemerschapsdossier'),
          React.createElement(View, { key: 'ond-tarief', style: stijlen.rij },
            React.createElement(Text, { style: stijlen.label }, 'Eigen tarief:'),
            React.createElement(Text, { style: stijlen.waarde }, dossier.czo.eigenTarief ? `${Number(dossier.czo.eigenTarief)}/uur` : 'Niet geregistreerd'),
          ),
          React.createElement(View, { key: 'ond-count', style: stijlen.rij },
            React.createElement(Text, { style: stijlen.label }, 'Opdrachtgevers:'),
            React.createElement(Text, { style: stijlen.waarde }, `${dossier.opdrachtgeversCount} opdrachtgever${dossier.opdrachtgeversCount !== 1 ? 's' : ''}`),
          ),
          React.createElement(View, { key: 'hdr-ond-kop', style: stijlen.tabelKop },
            React.createElement(Text, { style: stijlen.kolom1 }, 'Verzekering / Document'),
            React.createElement(Text, { style: stijlen.kolom2 }, 'Status'),
            React.createElement(Text, { style: stijlen.kolom3 }, 'Geldig t/m'),
          ),
          ...dossier.documenten
            .filter(d => ['KVK', 'BAV'].includes(d.type))
            .map(doc =>
              React.createElement(View, { key: `ond-${doc.id}`, style: stijlen.tabelRij },
                React.createElement(Text, { style: stijlen.kolom1 }, documentTypeLabel(doc.type)),
                React.createElement(Text, { style: [stijlen.kolom2, stijlen.badge, statusBadgeStijl(doc.status)] }, statusLabel(doc.status)),
                React.createElement(Text, { style: stijlen.kolom3 }, doc.vervaldatum ? format(new Date(doc.vervaldatum), 'dd-MM-yyyy') : '—'),
              )
            ),
        ] : [],
      )
    )
  }

  // Beoordelingssamenvatting / bewijsblok
  const dossierIds = new Set(dossiers.map(d => d.czo.id))
  const relevantePunten = aandachtspunten.filter(p => !p.czoId || dossierIds.has(p.czoId))
  const openPunten = relevantePunten.filter(p => p.status === 'OPEN')
  const gecontroleerdeBronnen = Array.from(new Set([
    'KVK (KvK-nummer)', 'BIG-register (BIG-nummer)',
    ...dossiers.some(d => d.czo.website) ? ['Openbare website'] : [],
    ...dossiers.some(d => d.czo.linkedinUrl) ? ['LinkedIn-profiel'] : [],
    'Interne documentuploads (VOG, BAV, diploma, KvK-uittreksel)',
  ]))

  inhoud.push(
    React.createElement(View, { key: 'samenvatting', style: stijlen.samenvatting },
      React.createElement(Text, { style: stijlen.samenvattingKop }, 'Beoordelingssamenvatting'),
      React.createElement(View, { style: stijlen.samenvattingRij },
        React.createElement(Text, { style: stijlen.samenvattingLabel }, 'Gecontroleerde bronnen:'),
        React.createElement(Text, { style: stijlen.waarde }, gecontroleerdeBronnen.join(', ')),
      ),
      React.createElement(View, { style: stijlen.samenvattingRij },
        React.createElement(Text, { style: stijlen.samenvattingLabel }, 'Open aandachtspunten:'),
        React.createElement(Text, { style: stijlen.waarde }, openPunten.length === 0 ? 'Geen' : `${openPunten.length} openstaand (zie dashboard voor details)`),
      ),
      React.createElement(View, { style: stijlen.samenvattingRij },
        React.createElement(Text, { style: stijlen.samenvattingLabel }, 'Datum laatste controle:'),
        React.createElement(Text, { style: stijlen.waarde }, geformatteerdDatum),
      ),
      React.createElement(Text, { style: { fontSize: 8, color: '#6b7280', marginTop: 8 } },
        'Dit document dient als bewijsrapport van de op de genoemde datum geldende status en bronnen. Het is geen reclame-uiting.'
      ),
    )
  )

  inhoud.push(
    React.createElement(Text, {
      key: 'footer',
      style: stijlen.footer,
    }, `SamenOntzorgen Cooperatie U.A. — Gegenereerd op ${geformatteerdDatum} — Vertrouwelijk`)
  )

  return inhoud
}

export async function genereerBewijspakketPDF(params: {
  zorginstelling: Zorginstelling
  dossiers: CZODossier[]
  variant: BewijspakketVariant
  generatorNaam: string
  aandachtspunten?: Aandachtspunt[]
}): Promise<Buffer> {
  const gegenereerd = new Date()
  const aandachtspunten = params.aandachtspunten ?? []

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: stijlen.pagina },
      ...bouwPaginaInhoud({ ...params, gegenereerd, aandachtspunten })
    )
  )

  return renderToBuffer(doc)
}
