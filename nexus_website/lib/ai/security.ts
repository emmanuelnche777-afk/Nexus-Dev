function normalizeSecurityText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const PROMPT_OVERRIDE_PATTERNS = [
  /\bignore\b.{0,50}\b(previous|prior|above|earlier)\b.{0,40}\b(instructions|rules|policies)\b/,
  /\b(forget|discard|ignore|oublie|oubliez)\b.{0,35}\b(all|every|previous|prior|above|your|toutes|tous|precedentes|precedents)?\s*(assistant|system|developer|assistant)?\s*(instructions|rules|policies|consignes|regles)\b/,
  /\b(disregard|forget|override|bypass|disable)\b.{0,50}\b(system|developer|safety|privacy|security|previous|hidden)\b.{0,40}\b(prompt|instructions|rules|restrictions|filters)?\b/,
  /\b(act|respond|behave)\b.{0,40}\b(as|like)\b.{0,20}\b(unrestricted|unfiltered|uncensored|developer|admin)\b/,
  /\b(jailbreak|prompt injection)\b/,
  /\b(ignore|oublie|ignorez)\b.{0,50}\b(instructions|consignes|regles|precedentes|precedents)\b/,
  /\b(revele|affiche|repete|ignore|contourne)\b.{0,60}\b(prompt|instructions|consignes|regles|securite|confidentialite)\b/,
];

const PRIVATE_SUBJECTS = /\b(client|clients|customer|customers|student|students|applicant|applicants|user|users|employee|employees|staff|person|people|clientele|eleve|eleves|etudiant|etudiants|candidat|candidats|utilisateur|utilisateurs|employe|employes)\b/;
const PRIVATE_DATA = /\b(records|record|email|phone|telephone|address|payment|receipt|registration|application|account|profile|contract|conversation|contact|status|dossier|coordonnees|paiement|adresse|telephone|courriel|compte|inscription|candidature)\b/;
const REQUEST_ACTIONS = /\b(show|give|tell|list|reveal|find|lookup|look up|search|retrieve|provide|share|export|dump|send|display|who|what|which|montre|donne|dis|liste|revele|trouve|cherche|recupere|fournis|partage|exporte|envoie|affiche|presente|indique|communique|transmets|qui|quel|quelle)\b/;
const PRIVATE_INFO_ABOUT_SUBJECT = /\b(information|info|details|data|records|record|email|phone|telephone|address|payment|receipt|account|profile|contract|conversation|contact|coordonnees|paiement|adresse|courriel|dossier)\b.{0,80}\b(about|on|of|for|de|des|sur|concernant|pour)\b.{0,60}\b(client|clients|customer|customers|student|students|applicant|applicants|user|users|employee|employees|staff|eleve|eleves|etudiant|etudiants|candidat|candidats|utilisateur|utilisateurs|employe|employes)\b/;
const CLIENT_DIRECTORY_REQUEST = /\b(?:list|export|dump|identify|reveal)\s+(?:(?:all|the|your|our|of|vos|nos|les|des)\s+)*(?:clients?|customers?|users?|students?|applicants?|staff|employees|utilisateurs?|etudiants?|candidats?|employes)\b|\b(?:show|give|tell|provide)\s+(?:(?:me|us|all|the|your|our|of|vos|nos|les|des)\s+)*(?:clients?|customers?|users?|students?|applicants?|staff|employees|utilisateurs?|etudiants?|candidats?|employes)\b|\b(?:who|what)\s+are\s+(?:all\s+|your\s+|our\s+|the\s+)?(?:clients?|customers?|users?|students?|applicants?)\b|\bqui\s+sont\s+(?:tous\s+|vos\s+|nos\s+|les\s+)?(?:clients?|utilisateurs?|etudiants?|candidats?)\b|\b(?:montre|donne|liste|revele|identifie)\s+(?:moi\s+|nous\s+)?(?:la\s+liste\s+)?(?:de\s+|des\s+|les\s+|vos\s+|nos\s+)?(?:clients?|utilisateurs?|etudiants?|candidats?|employes)\b/;
const CLIENT_COUNT_REQUEST = /\bhow many\b.{0,40}\b(clients?|customers?|users?|students?|applicants?)\b|\bcombien\b.{0,40}\b(clients?|utilisateurs?|etudiants?|candidats?)\b|\b(?:number|count|total|nombre|total)\s+(?:of|de|des)?\s*(?:clients?|customers?|users?|students?|applicants?|utilisateurs?|etudiants?|candidats?)\b/;

const SECRET_REQUEST = /\b(api key|api keys|password|passcode|credential|credentials|access token|secret key|private key|database url|connection string|system prompt|developer prompt|hidden prompt|internal document|internal file|financial record|payroll|dossier interne|cle api|mot de passe|identifiants|cle secrete|prompt systeme|document interne|donnees financieres)\b/;

/**
 * Defensive request screening only. The actual privacy boundary is that the
 * public assistant has no tools or queries for private records.
 */
export function isSensitiveAssistantRequest(value: string): boolean {
  const text = normalizeSecurityText(value);
  if (PROMPT_OVERRIDE_PATTERNS.some((pattern) => pattern.test(text))) return true;

  const asksForPrivateDetails = PRIVATE_SUBJECTS.test(text) && PRIVATE_DATA.test(text) && REQUEST_ACTIONS.test(text);
  if (asksForPrivateDetails || PRIVATE_INFO_ABOUT_SUBJECT.test(text) || CLIENT_DIRECTORY_REQUEST.test(text) || CLIENT_COUNT_REQUEST.test(text)) return true;

  return SECRET_REQUEST.test(text) && REQUEST_ACTIONS.test(text);
}

/** Keep obvious PII and credential strings out of assistant context even when
 * an administrator accidentally approves a knowledge-base entry containing it.
 */
export function containsObviousSensitiveKnowledge(value: string): boolean {
  const text = normalizeSecurityText(value);
  const hasEmail = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(value);
  const hasCredentialValue = /\b(api[_ -]?key|password|passcode|secret|access[_ -]?token|private[_ -]?key|database[_ -]?url|connection[_ -]?string)\b\s*[:=]\s*\S+/i.test(value);
  const hasContactNumber = /\b(phone|telephone|mobile|whatsapp|tel)\b\s*[:=]?\s*\+?\d[\d .()-]{7,}\d/i.test(value);
  const hasCameroonMobile = /\+?237[\s().-]*6\d{2}[\s().-]*\d{3}[\s().-]*\d{3}\b/.test(value);
  const hasPrivatePersonField = /\b(client|customer|student|applicant|user|employee|staff)\b.{0,40}\b(name|email|phone|telephone|address|payment|receipt|account|profile|contract|application|registration|status)\b\s*(is|:|=)\s*[\p{L}\p{N}+]/iu.test(text);
  return hasEmail || hasCredentialValue || hasContactNumber || hasCameroonMobile || hasPrivatePersonField;
}
