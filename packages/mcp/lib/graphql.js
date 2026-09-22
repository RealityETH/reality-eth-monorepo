const QUESTION_FIELDS = `
  id questionId contract chainId title type category lang outcomes questionJson
  creator arbitrator openingTimestamp timeout minBond bounty
  currentAnswer currentAnswerBond historyHash
  scheduledFinalizationTimestamp answerFinalizedTimestamp
  isPendingArbitration arbitrationOccurred
  createdTimestamp updatedTimestamp
`;

async function gql(url, query) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Indexer HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data;
}

export async function searchQuestions(indexerUrl, { chainId, category, openOnly = true, keyword, limit = 10 }) {
  limit = Math.min(limit, 50);
  const filters = [];
  if (chainId != null) filters.push(`chainId: ${chainId}`);
  if (category)        filters.push(`category: "${category}"`);
  if (openOnly)        filters.push(`answerFinalizedTimestamp: null`);
  if (keyword)         filters.push(`title_contains: "${keyword.replace(/"/g, '\\"')}"`);

  const where = filters.length ? `where: { ${filters.join(', ')} }, ` : '';
  const data = await gql(indexerUrl, `{
    questions(${where}orderBy: "createdTimestamp", orderDirection: "desc", limit: ${limit}) {
      items { ${QUESTION_FIELDS} }
    }
  }`);
  return data.questions.items;
}

export async function getQuestionById(indexerUrl, questionId) {
  // questionId here is the indexer `id` field: "{contract}-{questionId}"
  const data = await gql(indexerUrl, `{
    question(id: "${questionId}") { ${QUESTION_FIELDS} }
    responses(where: { questionId: "${questionId}" }, orderBy: "timestamp", orderDirection: "asc", limit: 1000) {
      items { answer bond user historyHash isCommitment isUnrevealed timestamp }
    }
  }`);
  return { question: data.question, responses: data.responses?.items || [] };
}

export async function findQuestion(indexerUrl, { contract, questionId, chainId }) {
  if (contract && questionId) {
    const id = `${contract.toLowerCase()}-${questionId.toLowerCase()}`;
    return getQuestionById(indexerUrl, id);
  }
  // Bare questionId — search by questionId field
  const filters = [`questionId: "${questionId.toLowerCase()}"`];
  if (chainId) filters.push(`chainId: ${chainId}`);
  const data = await gql(indexerUrl, `{
    questions(where: { ${filters.join(', ')} }, limit: 5) {
      items { ${QUESTION_FIELDS} }
    }
    responses(where: { questionId: "${questionId.toLowerCase()}" }, orderBy: "timestamp", orderDirection: "asc", limit: 1000) {
      items { answer bond user historyHash isCommitment isUnrevealed timestamp }
    }
  }`);
  const questions = data.questions?.items || [];
  if (!questions.length) return { question: null, responses: [] };
  return { question: questions[0], responses: data.responses?.items || [] };
}
