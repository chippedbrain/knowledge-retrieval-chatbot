// Parse markdown files into searchable chunks
export function parseMarkdownToChunks(markdown, category) {
    const chunks = [];
    const sections = markdown.split(/^## /m).filter(s => s.trim());

    sections.forEach(section => {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        if (title && content) {
            chunks.push({
                category,
                title,
                content,
                keywords: extractKeywords(title + ' ' + content)
            });
        }
    });

    return chunks;
}

function extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];

    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .filter((word, index, self) => self.indexOf(word) === index) // unique
        .slice(0, 15);
}

export function findRelevantChunks(query, allChunks, maxChunks = 3) {
    const queryWords = query.toLowerCase().split(/\s+/);

    // Score each chunk based on keyword matches
    const scoredChunks = allChunks.map(chunk => {
        let score = 0;

        queryWords.forEach(word => {
            if (chunk.keywords.includes(word)) score += 2;
            if (chunk.title.toLowerCase().includes(word)) score += 3;
            if (chunk.content.toLowerCase().includes(word)) score += 1;
        });

        return { ...chunk, score };
    });

    // Return top scoring chunks
    return scoredChunks
        .filter(chunk => chunk.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxChunks);
}

export function determineCategory(query) {
    const lowerQuery = query.toLowerCase();

    // Keywords for each category
    const categories = {
        pay: ['scholarship', 'scholarships', 'financial aid', 'fafsa', 'money', 'pay', 'cost', 'afford', 'loan', 'loans', 'grant', 'grants', 'fund', 'funding'],
        apply: ['apply', 'application', 'applying', 'admissions', 'admission', 'requirements', 'deadline', 'deadlines', 'transcript', 'essay'],
        plan: ['plan', 'planning', 'career', 'major', 'choose', 'decide', 'college selection', 'which college', 'reality check', 'explore']
    };

    let bestCategory = 'plan'; // default
    let highestScore = 0;

    Object.entries(categories).forEach(([category, keywords]) => {
        const score = keywords.filter(keyword => lowerQuery.includes(keyword)).length;
        if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
        }
    });

    return bestCategory;
}